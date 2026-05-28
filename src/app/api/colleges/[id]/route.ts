import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { mockColleges } from "@/lib/mockData";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Missing college ID" }, { status: 400 });
  }

  try {
    // 1. Attempt database query
    const college = await db.college.findUnique({
      where: { id },
      include: {
        courses: true,
        placements: {
          orderBy: { year: "desc" }
        },
        reviews: {
          orderBy: { createdAt: "desc" }
        }
      }
    });

    if (college) {
      // Map reviews user names
      const mappedReviews = college.reviews.map((r) => ({
        ...r,
        userName: r.userId === "alex-id" ? "Alex Johnson" : "Priya Sharma",
        userImage: r.userId === "alex-id" 
          ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&h=200&fit=crop" 
          : "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&h=200&fit=crop"
      }));

      return NextResponse.json({ college: { ...college, reviews: mappedReviews } });
    }
  } catch (error) {
    console.warn(`Prisma detail fetch failed for ID: ${id}. Using in-memory fallback.`, error);
  }

  // 2. Memory Fallback lookup
  const mockCollege = mockColleges.find((c) => c.id === id);
  if (!mockCollege) {
    return NextResponse.json({ error: "College not found" }, { status: 404 });
  }

  return NextResponse.json({ college: mockCollege });
}
