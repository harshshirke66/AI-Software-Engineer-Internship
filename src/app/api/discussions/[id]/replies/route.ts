import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { db } from "@/lib/db";

// Reference the global discussions object for fallbacks
const globalDiscussions = globalThis as unknown as {
  discussions: {
    id: string;
    title: string;
    content: string;
    category: string;
    userId: string;
    createdAt: Date;
    user: { name: string; email: string };
    replies: {
      id: string;
      discussionId: string;
      userId: string;
      content: string;
      createdAt: Date;
      user: { name: string; email: string };
    }[];
  }[];
};

async function getUserFromRequest(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.substring(7);
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return null;

    // Auto-provision user in public db
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  try {
    // 1. Try DB query
    const discussion = await db.discussion.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        replies: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          },
          orderBy: { createdAt: "asc" }
        }
      }
    });

    if (!discussion) {
      return NextResponse.json({ error: "Discussion thread not found" }, { status: 404 });
    }

    return NextResponse.json({ discussion });
  } catch (error) {
    console.warn(`Prisma fetching replies failed for thread: ${id}. Using in-memory fallback.`, error);

    // 2. Memory Fallback
    const discussion = globalDiscussions.discussions.find((d) => d.id === id);
    if (!discussion) {
      return NextResponse.json({ error: "Discussion thread not found" }, { status: 404 });
    }

    return NextResponse.json({ discussion });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { content } = await request.json();

  if (!content) {
    return NextResponse.json({ error: "Missing reply content" }, { status: 400 });
  }

  try {
    // 1. Verify parent exists and save reply in DB
    const discussion = await db.discussion.findUnique({ where: { id } });
    if (!discussion) {
      return NextResponse.json({ error: "Discussion thread not found" }, { status: 404 });
    }

    const reply = await db.discussionReply.create({
      data: {
        content,
        discussionId: id,
        userId: user.id
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({ success: true, reply });
  } catch (error) {
    console.warn(`Prisma creating reply failed for thread: ${id}. Using in-memory fallback.`, error);

    // 2. Memory Fallback write
    const discussion = globalDiscussions.discussions.find((d) => d.id === id);
    if (!discussion) {
      return NextResponse.json({ error: "Discussion thread not found" }, { status: 404 });
    }

    const fallbackUser = {
      name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "User",
      email: user.email || ""
    };

    const newReply = {
      id: `fallback-reply-${Date.now()}`,
      discussionId: id,
      userId: user.id,
      content,
      createdAt: new Date(),
      user: fallbackUser
    };

    discussion.replies.push(newReply);

    return NextResponse.json({ success: true, local: true, reply: newReply });
  }
}
