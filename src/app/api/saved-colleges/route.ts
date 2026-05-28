import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { mockColleges } from "@/lib/mockData";

// Local in-memory store for bookmark persistence when database is offline
const globalBookmarks = globalThis as unknown as {
  saved: Record<string, string[]>;
};
if (!globalBookmarks.saved) {
  globalBookmarks.saved = {};
}

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

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
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
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
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
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
