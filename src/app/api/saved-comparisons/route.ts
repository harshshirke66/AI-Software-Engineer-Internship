import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { db } from "@/lib/db";
import { mockColleges } from "@/lib/mockData";

// Local in-memory store for comparison persistence when database is offline
const globalComparisons = globalThis as unknown as {
  saved: Record<string, { id: string; collegeIds: string[]; createdAt: Date }[]>;
};
if (!globalComparisons.saved) {
  globalComparisons.saved = {};
}

async function getUserFromRequest(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.substring(7);
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return null;

    // Auto-provision user in public db if needed (to satisfy foreign key constraints)
    try {
      const dbUser = await db.user.findUnique({
        where: { id: user.id }
      });
      if (!dbUser) {
        await db.user.create({
          data: {
            id: user.id,
            email: user.email || "",
            name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "User",
            password: "",
          }
        });
      }
    } catch (e) {
      console.warn("Could not sync Supabase user to public database", e);
    }

    return user;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = user.id;

  try {
    const dbComparisons = await db.comparison.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });

    // Gather all distinct college IDs
    const allCollegeIds = Array.from(new Set(dbComparisons.flatMap(c => c.collegeIds)));
    
    // Fetch all these colleges from public DB
    const dbColleges = await db.college.findMany({
      where: { id: { in: allCollegeIds } },
      include: {
        courses: true,
        placements: { orderBy: { year: "desc" } },
        reviews: { orderBy: { createdAt: "desc" } }
      }
    });

    const collegeMap = new Map(dbColleges.map(c => [c.id, c]));

    const comparisonsWithColleges = dbComparisons.map(comp => ({
      id: comp.id,
      collegeIds: comp.collegeIds,
      createdAt: comp.createdAt,
      colleges: comp.collegeIds.map(id => collegeMap.get(id) || mockColleges.find(mc => mc.id === id)).filter(Boolean)
    }));

    return NextResponse.json({ comparisons: comparisonsWithColleges });
  } catch (error) {
    console.warn(`Prisma comparisons fetch failed for user: ${userId}. Using in-memory fallback.`, error);
    
    const comps = globalComparisons.saved[userId] || [];
    const comparisonsWithColleges = comps.map(comp => ({
      id: comp.id,
      collegeIds: comp.collegeIds,
      createdAt: comp.createdAt,
      colleges: comp.collegeIds.map(id => mockColleges.find(mc => mc.id === id)).filter(Boolean)
    }));

    return NextResponse.json({ comparisons: comparisonsWithColleges });
  }
}

export async function POST(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = user.id;
  const { collegeIds } = await request.json();

  if (!collegeIds || !Array.isArray(collegeIds) || collegeIds.length === 0) {
    return NextResponse.json({ error: "Missing or invalid college IDs array" }, { status: 400 });
  }

  try {
    const saved = await db.comparison.create({
      data: { userId, collegeIds }
    });
    return NextResponse.json({ success: true, comparison: saved });
  } catch (error) {
    console.warn(`Prisma comparison creation failed for user: ${userId}. Using in-memory fallback.`, error);

    if (!globalComparisons.saved[userId]) {
      globalComparisons.saved[userId] = [];
    }

    const newComp = {
      id: `mock-comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      collegeIds,
      createdAt: new Date()
    };

    globalComparisons.saved[userId].unshift(newComp);

    return NextResponse.json({ success: true, local: true, comparison: newComp });
  }
}

export async function DELETE(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = user.id;
  const { searchParams } = new URL(request.url);
  let id = searchParams.get("id");

  if (!id) {
    try {
      const body = await request.json();
      id = body.id;
    } catch {}
  }

  if (!id) {
    return NextResponse.json({ error: "Missing comparison ID" }, { status: 400 });
  }

  try {
    await db.comparison.deleteMany({
      where: { id, userId }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.warn(`Prisma comparison delete failed for user: ${userId}. Using in-memory fallback.`, error);

    if (globalComparisons.saved[userId]) {
      globalComparisons.saved[userId] = globalComparisons.saved[userId].filter((c) => c.id !== id);
    }

    return NextResponse.json({ success: true, local: true });
  }
}
