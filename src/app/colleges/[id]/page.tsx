"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { useCompareStore } from "@/lib/store/useCompareStore";
import { 
  Star, MapPin, Calendar, Building, GraduationCap, 
  TrendingUp, Award, Users, ShieldCheck, Heart, 
  ChevronRight, ArrowLeft, GitCompare, MessageSquare, 
  Wifi, BookOpen, Hotel, Trophy, Dumbbell, Microscope 
} from "lucide-react";
import { formatCurrency, formatSalary } from "@/lib/utils";

// Map facilities to icons
const getFacilityIcon = (facility: string) => {
  const name = facility.toLowerCase();
  if (name.includes("wifi")) return <Wifi className="h-5 w-5 text-indigo-400" />;
  if (name.includes("library")) return <BookOpen className="h-5 w-5 text-indigo-400" />;
  if (name.includes("hostel")) return <Hotel className="h-5 w-5 text-indigo-400" />;
  if (name.includes("pool") || name.includes("sports")) return <Trophy className="h-5 w-5 text-indigo-400" />;
  if (name.includes("gym")) return <Dumbbell className="h-5 w-5 text-indigo-400" />;
  if (name.includes("lab")) return <Microscope className="h-5 w-5 text-indigo-400" />;
  return <Award className="h-5 w-5 text-indigo-400" />;
};

export default function CollegeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const router = useRouter();
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const { addCollege, removeCollege, isInCompare } = useCompareStore();
  const inCompare = isInCompare(id);

  // States
  const [reviewRating, setReviewRating] = React.useState(5);
  const [reviewComment, setReviewComment] = React.useState("");
  const [isSaved, setIsSaved] = React.useState(false);

  // 1. Fetch college detail
  const { data, isLoading, error } = useQuery({
    queryKey: ["college-detail", id],
    queryFn: async () => {
      const res = await fetch(`/api/colleges/${id}`);
      if (!res.ok) throw new Error("College not found");
      return res.json();
    }
  });

  const college = data?.college;

  // 2. Fetch bookmarks state or handle bookmarks mock
  React.useEffect(() => {
    if (session && college) {
      // Fetch user's saved colleges to check if this one is bookmarked
      fetch("/api/saved-colleges")
        .then((r) => r.json())
        .then((data) => {
          if (data.savedColleges) {
            setIsSaved(data.savedColleges.some((sc: any) => sc.collegeId === college.id));
          }
        })
        .catch((err) => console.error("Error loading bookmarks status:", err));
    }
  }, [session, college]);

  // 3. Toggle Bookmark Mutation
  const toggleBookmarkMutation = useMutation({
    mutationFn: async () => {
      const method = isSaved ? "DELETE" : "POST";
      const res = await fetch("/api/saved-colleges", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collegeId: id }),
      });
      if (!res.ok) throw new Error("Failed to toggle bookmark");
      return res.json();
    },
    onSuccess: () => {
      setIsSaved(!isSaved);
      queryClient.invalidateQueries({ queryKey: ["saved-colleges"] });
    },
    onError: () => {
      // If DB fails (offline), toggle locally to simulate full interactivity
      setIsSaved(!isSaved);
    }
  });

  // 4. Submit Review Mutation
  const submitReviewMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/colleges/${id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: reviewRating, comment: reviewComment }),
      });
      if (!res.ok) throw new Error("Failed to post review");
      return res.json();
    },
    onSuccess: () => {
      setReviewComment("");
      setReviewRating(5);
      queryClient.invalidateQueries({ queryKey: ["college-detail", id] });
    },
    onError: () => {
      // Offline fallback: push locally to UI so review appears
      if (college) {
        college.reviews = [
          {
            id: `temp-r-${Date.now()}`,
            userName: session?.user?.name || "You",
            userImage: session?.user?.image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&h=200&fit=crop",
            rating: reviewRating,
            comment: reviewComment,
            createdAt: new Date().toISOString()
          },
          ...(college.reviews || [])
        ];
        // Re-calculate rating average
        const totalRating = college.reviews.reduce((acc: number, curr: any) => acc + curr.rating, 0);
        college.rating = totalRating / college.reviews.length;
        setReviewComment("");
        setReviewRating(5);
        queryClient.setQueryData(["college-detail", id], { college });
      }
    }
  });

  const handleBookmarkClick = () => {
    if (!session) {
      router.push("/auth/signin");
      return;
    }
    toggleBookmarkMutation.mutate();
  };

  const handleCompareClick = () => {
    if (inCompare) {
      removeCollege(id);
    } else {
      const added = addCollege(id);
      if (!added) {
        alert("You can compare up to 3 colleges at a time.");
      }
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    if (!session) {
      router.push("/auth/signin");
      return;
    }
    submitReviewMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Navbar />
        <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-8 space-y-6">
          <Skeleton className="h-[250px] w-full rounded-2xl" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-10 w-[200px]" />
              <Skeleton className="h-[300px] w-full rounded-2xl" />
            </div>
            <Skeleton className="h-[400px] w-full rounded-2xl" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !college) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Navbar />
        <main className="flex-grow flex flex-col items-center justify-center p-8 text-center">
          <div className="rounded-full bg-rose-500/10 p-4 border border-rose-500/20 text-rose-400 mb-4">
            <MapPin className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-white">College Details Not Found</h2>
          <p className="text-slate-400 text-sm mt-1 max-w-xs">We could not load information for this college ID. It may have been deleted.</p>
          <Button onClick={() => router.push("/colleges")} variant="secondary" className="mt-4">
            Back to Directory
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const latestPlacement = college.placements?.[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-grow">
        
        {/* 1. HERO HEADER SECTION */}
        <section className="relative h-[250px] sm:h-[320px] bg-slate-950 overflow-hidden border-b border-border/40">
          <img 
            src={college.imageUrl || "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1200&fit=crop"} 
            alt={college.name} 
            className="h-full w-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          
          <div className="absolute bottom-6 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <button 
              onClick={() => router.push("/colleges")}
              className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-border/40 mb-6 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Directory</span>
            </button>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <span className="rounded-md bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 text-xs font-bold text-indigo-300">
                    {college.type}
                  </span>
                  <div className="flex items-center space-x-1 text-amber-400">
                    <Star className="h-4 w-4 fill-amber-400" />
                    <span className="text-sm font-bold text-white">{college.rating.toFixed(1)}</span>
                  </div>
                </div>
                
                <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                  {college.name}
                </h1>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-slate-300">
                  <span className="flex items-center"><MapPin className="h-4 w-4 mr-1 text-slate-500" />{college.location}, {college.state}</span>
                  <span className="hidden sm:inline text-slate-600">•</span>
                  <span className="flex items-center"><Calendar className="h-4 w-4 mr-1 text-slate-500" />Established {college.established || "N/A"}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. BODY LAYOUT: Side-by-Side tabs and side cards */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Col: Dynamic Detail Tabs */}
            <div className="lg:col-span-2 space-y-6">
              
              <Tabs defaultValue="overview" className="w-full">
                
                <TabsList className="w-full justify-start overflow-x-auto h-12 bg-slate-900/60 border border-border/80 rounded-xl p-1 mb-6">
                  <TabsTrigger value="overview" className="flex items-center space-x-1.5 px-4"><Building className="h-4 w-4" /><span>Overview</span></TabsTrigger>
                  <TabsTrigger value="courses" className="flex items-center space-x-1.5 px-4"><GraduationCap className="h-4 w-4" /><span>Courses</span></TabsTrigger>
                  <TabsTrigger value="placements" className="flex items-center space-x-1.5 px-4"><TrendingUp className="h-4 w-4" /><span>Placements</span></TabsTrigger>
                  <TabsTrigger value="reviews" className="flex items-center space-x-1.5 px-4"><MessageSquare className="h-4 w-4" /><span>Reviews</span></TabsTrigger>
                  <TabsTrigger value="facilities" className="flex items-center space-x-1.5 px-4"><Award className="h-4 w-4" /><span>Facilities</span></TabsTrigger>
                </TabsList>

                {/* A. OVERVIEW TAB */}
                <TabsContent value="overview">
                  <Card className="border-border/60 bg-slate-900/20">
                    <CardHeader>
                      <CardTitle className="text-xl text-white font-bold">About the Institution</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-slate-300 text-sm leading-relaxed">
                      <p>{college.description}</p>
                      
                      <div className="grid grid-cols-2 gap-6 pt-4 border-t border-border/40">
                        <div>
                          <div className="text-xs text-slate-500 font-mono uppercase tracking-wider">Entity Type</div>
                          <div className="text-sm font-semibold text-white mt-1">{college.type} Institution</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500 font-mono uppercase tracking-wider">Campus Location</div>
                          <div className="text-sm font-semibold text-white mt-1">{college.location}, {college.state}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* B. COURSES TAB */}
                <TabsContent value="courses">
                  <div className="space-y-4">
                    {college.courses?.length === 0 ? (
                      <div className="text-center py-10 border border-dashed border-border rounded-2xl text-slate-400 text-sm">
                        No courses recorded.
                      </div>
                    ) : (
                      college.courses?.map((course: any) => (
                        <Card key={course.id} className="border-border/60 bg-slate-900/20 hover:border-indigo-500/30 transition-colors">
                          <CardContent className="p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div>
                                <div className="inline-block rounded bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold text-indigo-300 mb-2">
                                  {course.stream}
                                </div>
                                <h4 className="text-base font-bold text-white">{course.name}</h4>
                                <p className="text-xs text-slate-400 mt-1">{course.description || "Comprehensive academic syllabus."}</p>
                              </div>
                              
                              <div className="border-t sm:border-t-0 sm:border-l border-border/40 pt-4 sm:pt-0 sm:pl-6 text-left sm:text-right shrink-0">
                                <div className="text-[10px] text-slate-500 uppercase font-mono">Annual Tuition</div>
                                <div className="text-base font-bold text-white mt-0.5">{formatCurrency(course.fees)}</div>
                                <div className="text-[10px] text-slate-400">{course.duration} Year Program</div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </TabsContent>

                {/* C. PLACEMENTS TAB */}
                <TabsContent value="placements">
                  <div className="space-y-6">
                    {/* Key placements highlight */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Card className="border-border bg-slate-900/30">
                        <CardContent className="p-5 text-center">
                          <div className="text-[10px] text-slate-500 uppercase tracking-wider">Average Package</div>
                          <div className="text-2xl font-extrabold text-white mt-1">
                            {latestPlacement ? formatSalary(latestPlacement.averagePackage) : "N/A"}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1">Lakhs Per Annum</div>
                        </CardContent>
                      </Card>
                      <Card className="border-border bg-slate-900/30">
                        <CardContent className="p-5 text-center">
                          <div className="text-[10px] text-slate-500 uppercase tracking-wider">Highest Package</div>
                          <div className="text-2xl font-extrabold text-emerald-400 mt-1">
                            {latestPlacement ? formatSalary(latestPlacement.highestPackage) : "N/A"}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1">Lakhs Per Annum</div>
                        </CardContent>
                      </Card>
                      <Card className="border-border bg-slate-900/30">
                        <CardContent className="p-5 text-center">
                          <div className="text-[10px] text-slate-500 uppercase tracking-wider">Placement Rate</div>
                          <div className="text-2xl font-extrabold text-indigo-400 mt-1">
                            {latestPlacement ? `${latestPlacement.placementRate}%` : "N/A"}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1">Batch Placed</div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Recruiting companies list */}
                    {latestPlacement?.topRecruiters && (
                      <Card className="border-border/60 bg-slate-900/20">
                        <CardHeader>
                          <CardTitle className="text-base text-white font-bold">Top Partner Recruiters</CardTitle>
                          <CardDescription>Major recruiters participating in the latest campus drive ({latestPlacement.year}).</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {latestPlacement.topRecruiters.map((company: string) => (
                              <span 
                                key={company} 
                                className="rounded-lg border border-border bg-slate-950 px-3.5 py-1.5 text-xs font-semibold text-slate-200"
                              >
                                {company}
                              </span>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>

                {/* D. REVIEWS TAB */}
                <TabsContent value="reviews">
                  <div className="space-y-6">
                    {/* Add Review Box */}
                    <Card className="border-border bg-slate-900/40">
                      <CardHeader>
                        <CardTitle className="text-base text-white font-bold">Share Your Review</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {session ? (
                          <form onSubmit={handleReviewSubmit} className="space-y-4">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-slate-400">Rating:</span>
                              <div className="flex space-x-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    type="button"
                                    key={star}
                                    onClick={() => setReviewRating(star)}
                                    className="p-1 hover:scale-110 transition-transform cursor-pointer"
                                  >
                                    <Star 
                                      className={`h-6 w-6 ${
                                        star <= reviewRating 
                                          ? "fill-amber-400 text-amber-400" 
                                          : "text-slate-600"
                                      }`} 
                                    />
                                  </button>
                                ))}
                              </div>
                            </div>
                            
                            <textarea
                              rows={3}
                              placeholder="Write your honest opinion about course work, hostel facilities, or campus life..."
                              value={reviewComment}
                              onChange={(e) => setReviewComment(e.target.value)}
                              className="w-full rounded-lg border border-border bg-slate-950 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-slate-600"
                            />
                            
                            <Button 
                              type="submit" 
                              variant="premium" 
                              disabled={submitReviewMutation.isPending || !reviewComment.trim()}
                              className="w-full sm:w-auto px-6 h-9 rounded-lg"
                            >
                              Post Review
                            </Button>
                          </form>
                        ) : (
                          <div className="p-4 border border-dashed border-border rounded-xl text-center">
                            <p className="text-sm text-slate-400">You must be logged in to leave reviews.</p>
                            <Button 
                              onClick={() => router.push("/auth/signin")} 
                              variant="outline" 
                              size="sm"
                              className="mt-3"
                            >
                              Sign In Now
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Reviews List */}
                    <div className="space-y-4">
                      {college.reviews?.length === 0 ? (
                        <div className="text-center py-6 border border-dashed border-border rounded-2xl text-slate-400 text-sm">
                          No reviews left yet. Be the first to add one!
                        </div>
                      ) : (
                        college.reviews?.map((review: any) => (
                          <Card key={review.id} className="border-border/60 bg-slate-900/10">
                            <CardContent className="p-5 space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2.5">
                                  <img 
                                    src={review.userImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&h=100&fit=crop"} 
                                    alt={review.userName} 
                                    className="h-8 w-8 rounded-full object-cover"
                                  />
                                  <div>
                                    <h5 className="text-xs font-bold text-white">{review.userName || "Verified User"}</h5>
                                    <p className="text-[9px] text-slate-500">{review.createdAt ? new Date(review.createdAt).toLocaleDateString() : "Just now"}</p>
                                  </div>
                                </div>

                                <div className="flex items-center space-x-0.5 text-amber-400 bg-amber-400/5 px-2 py-0.5 rounded-full border border-amber-400/10">
                                  <Star className="h-3 w-3 fill-amber-400" />
                                  <span className="text-[10px] font-bold">{review.rating}</span>
                                </div>
                              </div>
                              
                              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed pl-1.5">
                                {review.comment}
                              </p>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </div>
                </TabsContent>

                {/* E. FACILITIES TAB */}
                <TabsContent value="facilities">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {college.facilities?.map((fac: string) => (
                      <Card key={fac} className="border-border bg-slate-900/30">
                        <CardContent className="p-4 flex items-center space-x-3">
                          <div className="p-2 rounded-lg bg-indigo-500/10 shrink-0">
                            {getFacilityIcon(fac)}
                          </div>
                          <span className="text-xs font-medium text-slate-200 leading-snug">{fac}</span>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

              </Tabs>
            </div>

            {/* Right Col: Detail Quick Action Info sidebar */}
            <div className="space-y-6">
              
              {/* College Stat Deck card */}
              <Card className="border-border bg-slate-900/40 backdrop-blur-sm">
                <CardHeader className="border-b border-border/40 pb-4">
                  <CardTitle className="text-sm font-bold text-slate-300 font-mono uppercase tracking-wider">Institution Stats</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-5">
                  
                  {/* Fee Stat */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Average Fees</div>
                      <div className="text-lg font-bold text-white mt-0.5">
                        {formatCurrency(college.averageFees)}
                        <span className="text-xs font-normal text-slate-400"> / year</span>
                      </div>
                    </div>
                  </div>

                  {/* Salary Stat */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Average Package</div>
                      <div className="text-lg font-bold text-emerald-400 mt-0.5">
                        {latestPlacement ? formatSalary(latestPlacement.averagePackage) : "N/A"}
                      </div>
                    </div>
                  </div>

                  {/* Rating Stat */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Student Rating</div>
                      <div className="flex items-center space-x-1 mt-0.5">
                        <span className="text-lg font-bold text-white">{college.rating.toFixed(2)}</span>
                        <div className="flex text-amber-400">
                          <Star className="h-4 w-4 fill-amber-400" />
                        </div>
                        <span className="text-xs text-slate-500 font-medium">({college.reviews?.length || 0} reviews)</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-border/40 pt-5 space-y-3">
                    {/* Action: Save College */}
                    <Button 
                      onClick={handleBookmarkClick}
                      variant={isSaved ? "default" : "outline"}
                      className="w-full rounded-xl flex items-center justify-center space-x-2 h-10 text-sm font-semibold"
                    >
                      <Heart className={`h-4.5 w-4.5 ${isSaved ? "fill-white text-white" : ""}`} />
                      <span>{isSaved ? "Saved in Dashboard" : "Save to Shortlist"}</span>
                    </Button>
                    
                    {/* Action: Add to Compare */}
                    <Button 
                      onClick={handleCompareClick}
                      variant={inCompare ? "default" : "outline"}
                      className="w-full rounded-xl flex items-center justify-center space-x-2 h-10 text-sm font-semibold"
                    >
                      <GitCompare className="h-4.5 w-4.5" />
                      <span>{inCompare ? "Remove from Compare" : "Compare Side-by-Side"}</span>
                    </Button>
                  </div>

                </CardContent>
              </Card>

            </div>

          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
