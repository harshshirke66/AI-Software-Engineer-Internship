import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { db } from "@/lib/db";

// Global in-memory fallback for discussions
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

if (!globalDiscussions.discussions) {
  globalDiscussions.discussions = [
    {
      id: "demo-disc-1",
      title: "Is B.Tech Computer Science at Stanford worth the high tuition fees?",
      content: "I received an offer letter but the tuition fees are quite steep. Looking for reviews on placements, faculty, and return on investment.",
      category: "Admissions",
      userId: "demo-user-1",
      createdAt: new Date(Date.now() - 3600000 * 24 * 3), // 3 days ago
      user: { name: "Ananya Iyer", email: "ananya@example.com" },
      replies: [
        {
          id: "demo-reply-1",
          discussionId: "demo-disc-1",
          userId: "demo-user-2",
          content: "Absolutely! The network, internship opportunities in Silicon Valley, and placement packages are outstanding. Most students clear their loans within 2-3 years.",
          createdAt: new Date(Date.now() - 3600000 * 24 * 2), // 2 days ago
          user: { name: "Rohan Das", email: "rohan@example.com" }
        }
      ]
    },
    {
      id: "demo-disc-2",
      title: "How is the placement scenario for MBA at Harvard Business School?",
      content: "Specifically looking for finance and consulting role statistics for the class of 2025/2026.",
      category: "Placement",
      userId: "demo-user-3",
      createdAt: new Date(Date.now() - 3600000 * 12), // 12 hours ago
      user: { name: "Vikram Malhotra", email: "vikram@example.com" },
      replies: []
    }
  ];
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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || "";
  const search = searchParams.get("search") || "";

  try {
    // 1. Try DB
    const where: any = {};
    if (category) {
      where.category = { equals: category, mode: "insensitive" };
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } }
      ];
    }

    const dbDiscussions = await db.discussion.findMany({
      where,
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
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ discussions: dbDiscussions });
  } catch (error) {
    console.warn("Prisma discussions query failed. Using in-memory fallback:", error);

    // 2. Fallback
    let filtered = [...globalDiscussions.discussions];
    if (category) {
      filtered = filtered.filter(d => d.category.toLowerCase() === category.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(d => d.title.toLowerCase().includes(q) || d.content.toLowerCase().includes(q));
    }

    // Sort descending by date
    filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return NextResponse.json({ discussions: filtered, local: true });
  }
}

export async function POST(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, content, category } = await request.json();

  if (!title || !content || !category) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const newDisc = await db.discussion.create({
      data: {
        title,
        content,
        category,
        userId: user.id
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        replies: true
      }
    });

    return NextResponse.json({ success: true, discussion: newDisc });
  } catch (error) {
    console.warn("Prisma discussion creation failed. Using in-memory fallback:", error);

    const fallbackUser = {
      name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "User",
      email: user.email || ""
    };

    const newDisc = {
      id: `fallback-disc-${Date.now()}`,
      title,
      content,
      category,
      userId: user.id,
      createdAt: new Date(),
      user: fallbackUser,
      replies: []
    };

    globalDiscussions.discussions.unshift(newDisc);

    return NextResponse.json({ success: true, local: true, discussion: newDisc });
  }
}
