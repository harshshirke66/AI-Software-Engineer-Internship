import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { db } from "@/lib/db";
import { mockColleges } from "@/lib/mockData";

// Local in-memory store for bookmark persistence when database is offline
const globalBookmarks = globalThis as unknown as {
  saved: Record<string, string[]>;
};
if (!globalBookmarks.saved) {
  globalBookmarks.saved = {};
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
            password: "", // empty because we authenticate via Supabase
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
    // 1. Try querying from Prisma
    const dbSaved = await db.savedCollege.findMany({
      where: { userId },
      include: {
        college: {
          include: {
            courses: true,
            placements: { orderBy: { year: "desc" } },
            reviews: { orderBy: { createdAt: "desc" } }
          }
        }
      }
    });

    return NextResponse.json({
      savedColleges: dbSaved.map((sc) => ({
        id: sc.id,
        collegeId: sc.collegeId,
        college: sc.college
      }))
    });
  } catch (error) {
    console.warn(`Prisma bookmarks fetch failed for user: ${userId}. Using in-memory fallback.`, error);
    
    // 2. Memory Fallback
    const collegeIds = globalBookmarks.saved[userId] || [];
    const matchedColleges = mockColleges.filter((c) => collegeIds.includes(c.id));

    return NextResponse.json({
      savedColleges: matchedColleges.map((c) => ({
        id: `mock-bookmark-${c.id}`,
        collegeId: c.id,
        college: c
      }))
    });
  }
}

export async function POST(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = user.id;
  const { collegeId } = await request.json();

  if (!collegeId) {
    return NextResponse.json({ error: "Missing college ID" }, { status: 400 });
  }

  try {
    // 1. Try database write
    const saved = await db.savedCollege.create({
      data: { userId, collegeId }
    });
    return NextResponse.json({ success: true, saved });
  } catch (error) {
    console.warn(`Prisma bookmark creation failed for user: ${userId}. Using in-memory fallback.`, error);

    // 2. Memory Fallback write
    if (!globalBookmarks.saved[userId]) {
      globalBookmarks.saved[userId] = [];
    }
    if (!globalBookmarks.saved[userId].includes(collegeId)) {
      globalBookmarks.saved[userId].push(collegeId);
    }

    return NextResponse.json({ success: true, local: true });
  }
}

export async function DELETE(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = user.id;
  const { collegeId } = await request.json();

  if (!collegeId) {
    return NextResponse.json({ error: "Missing college ID" }, { status: 400 });
  }

  try {
    // 1. Try database delete
    await db.savedCollege.deleteMany({
      where: { userId, collegeId }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.warn(`Prisma bookmark delete failed for user: ${userId}. Using in-memory fallback.`, error);

    // 2. Memory Fallback delete
    if (globalBookmarks.saved[userId]) {
      globalBookmarks.saved[userId] = globalBookmarks.saved[userId].filter((id) => id !== collegeId);
    }

    return NextResponse.json({ success: true, local: true });
  }
}
