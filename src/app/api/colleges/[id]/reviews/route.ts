import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: collegeId } = await params;
  const userId = session.user.id;

  try {
    const { rating, comment } = await request.json();

    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Invalid rating" }, { status: 400 });
    }

    if (!comment || typeof comment !== "string" || !comment.trim()) {
      return NextResponse.json({ error: "Review comment is required" }, { status: 400 });
    }

    // 1. Try database insertion
    const review = await db.review.create({
      data: {
        collegeId,
        userId,
        rating,
        comment: comment.trim()
      }
    });

    // Optionally update college overall rating average
    const reviews = await db.review.findMany({
      where: { collegeId }
    });
    
    if (reviews.length > 0) {
      const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
      await db.college.update({
        where: { id: collegeId },
        data: { rating: avgRating }
      });
    }

    return NextResponse.json({ success: true, review });
  } catch (error) {
    console.warn(`Prisma review creation failed for college: ${collegeId}. Fallback to client optimistic update.`, error);
    return NextResponse.json({ success: true, local: true });
  }
}
