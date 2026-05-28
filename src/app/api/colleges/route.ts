import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { mockColleges, MockCollege } from "@/lib/mockData";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  // Parse filter options
  const search = searchParams.get("search") || "";
  const state = searchParams.get("state") || "";
  const type = searchParams.get("type") || "";
  const stream = searchParams.get("stream") || "";
  const maxFees = searchParams.get("fees") ? parseFloat(searchParams.get("fees")!) : null;
  const minRating = searchParams.get("rating") ? parseFloat(searchParams.get("rating")!) : null;
  const sort = searchParams.get("sort") || "";
  
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.max(1, parseInt(searchParams.get("limit") || "9"));

  let colleges: any[] = [];
  let totalCount = 0;
  let usingFallback = false;

  try {
    // 1. Attempt database query
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
        { state: { contains: search, mode: "insensitive" } },
        { courses: { some: { name: { contains: search, mode: "insensitive" } } } },
      ];
    }

    if (state) {
      where.state = { equals: state, mode: "insensitive" };
    }

    if (type) {
      where.type = { equals: type, mode: "insensitive" };
    }

    if (maxFees !== null) {
      where.averageFees = { lte: maxFees };
    }

    if (minRating !== null) {
      where.rating = { gte: minRating };
    }

    if (stream) {
      where.courses = { some: { stream: { equals: stream, mode: "insensitive" } } };
    }

    // Query matching records
    const dbColleges = await db.college.findMany({
      where,
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

    // Map DB objects to match front-end format
    colleges = dbColleges.map((c) => ({
      ...c,
      reviews: c.reviews.map((r) => ({
        ...r,
        // Since we don't have mock user joints hydrated in detail, we mock user details
        userName: r.userId === "alex-id" ? "Alex Johnson" : "Priya Sharma",
        userImage: r.userId === "alex-id" 
          ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&fit=crop" 
          : "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&fit=crop"
      }))
    }));
  } catch (error) {
    console.warn("Prisma query failed. Using in-memory fallback:", error instanceof Error ? error.message : error);
    usingFallback = true;

    // 2. Memory Fallback filter logic
    let filtered = [...mockColleges];

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q) ||
          c.state.toLowerCase().includes(q) ||
          c.courses.some((cr) => cr.name.toLowerCase().includes(q))
      );
    }

    if (state) {
      filtered = filtered.filter((c) => c.state.toLowerCase() === state.toLowerCase());
    }

    if (type) {
      filtered = filtered.filter((c) => c.type.toLowerCase() === type.toLowerCase());
    }

    if (maxFees !== null) {
      filtered = filtered.filter((c) => c.averageFees <= maxFees);
    }

    if (minRating !== null) {
      filtered = filtered.filter((c) => c.rating >= minRating);
    }

    if (stream) {
      filtered = filtered.filter((c) =>
        c.courses.some((cr) => cr.stream.toLowerCase() === stream.toLowerCase())
      );
    }

    colleges = filtered;
  }

  // 3. Unified Sorting (Works for both DB array and Fallback array)
  if (sort === "rating_desc") {
    colleges.sort((a, b) => b.rating - a.rating);
  } else if (sort === "fees_asc") {
    colleges.sort((a, b) => a.averageFees - b.averageFees);
  } else if (sort === "fees_desc") {
    colleges.sort((a, b) => b.averageFees - a.averageFees);
  } else if (sort === "placement_desc") {
    colleges.sort((a, b) => {
      const pkgA = a.placements?.[0]?.averagePackage || 0;
      const pkgB = b.placements?.[0]?.averagePackage || 0;
      return pkgB - pkgA;
    });
  }

  totalCount = colleges.length;

  // 4. Unified Pagination
  const startIndex = (page - 1) * limit;
  const paginatedColleges = colleges.slice(startIndex, startIndex + limit);

  return NextResponse.json({
    colleges: paginatedColleges,
    pagination: {
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit)
    },
    meta: {
      fallback: usingFallback
    }
  });
}
