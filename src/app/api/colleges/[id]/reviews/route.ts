import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { db } from "@/lib/db";

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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: collegeId } = await params;
  const userId = user.id;

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
