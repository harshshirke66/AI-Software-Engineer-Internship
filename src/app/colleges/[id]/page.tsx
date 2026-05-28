"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { useCompareStore } from "@/lib/store/useCompareStore";
import { 
  Star, MapPin, Calendar, Building, GraduationCap, 
  TrendingUp, Award, Heart, 
  ArrowLeft, GitCompare, MessageSquare, 
  Wifi, BookOpen, Hotel, Trophy, Dumbbell, Microscope 
} from "lucide-react";
import { formatCurrency, formatSalary } from "@/lib/utils";

// Map facilities to icons
const getFacilityIcon = (facility: string) => {
  const name = facility.toLowerCase();
  if (name.includes("wifi")) return <Wifi className="h-5 w-5 text-primary" />;
  if (name.includes("library")) return <BookOpen className="h-5 w-5 text-primary" />;
  if (name.includes("hostel")) return <Hotel className="h-5 w-5 text-primary" />;
  if (name.includes("pool") || name.includes("sports")) return <Trophy className="h-5 w-5 text-primary" />;
  if (name.includes("gym")) return <Dumbbell className="h-5 w-5 text-primary" />;
  if (name.includes("lab")) return <Microscope className="h-5 w-5 text-primary" />;
  return <Award className="h-5 w-5 text-primary" />;
};

export default function CollegeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const router = useRouter();
  const { user: session } = useAuth();
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

  // 2. Fetch bookmarks state
  React.useEffect(() => {
    if (session && college) {
      supabase.auth.getSession().then(({ data: { session: supabaseSession } }) => {
        const token = supabaseSession?.access_token;
        const headers: Record<string, string> = {};
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }
        fetch("/api/saved-colleges", { headers })
          .then((r) => r.json())
          .then((data) => {
            if (data.savedColleges) {
              setIsSaved(data.savedColleges.some((sc: any) => sc.collegeId === college.id));
            }
          })
          .catch((err) => console.error("Error loading bookmarks status:", err));
      });
    }
  }, [session, college]);

  // 3. Toggle Bookmark Mutation
  const toggleBookmarkMutation = useMutation({
    mutationFn: async () => {
      const method = isSaved ? "DELETE" : "POST";
      const sessionData = await supabase.auth.getSession();
      const token = sessionData.data.session?.access_token;

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch("/api/saved-colleges", {
        method,
        headers,
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
      setIsSaved(!isSaved);
    }
  });

  // 4. Submit Review Mutation
  const submitReviewMutation = useMutation({
    mutationFn: async () => {
      const sessionData = await supabase.auth.getSession();
      const token = sessionData.data.session?.access_token;

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`/api/colleges/${id}/reviews`, {
        method: "POST",
        headers,
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
      if (college) {
        college.reviews = [
          {
            id: `temp-r-${Date.now()}`,
            userName: session?.user_metadata?.full_name || session?.user_metadata?.name || session?.email?.split("@")[0] || "You",
            userImage: session?.user_metadata?.avatar_url || session?.user_metadata?.image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&h=200&fit=crop",
            rating: reviewRating,
            comment: reviewComment,
            createdAt: new Date().toISOString()
          },
          ...(college.reviews || [])
        ];
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
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Navbar />
        <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-8 space-y-6">
          <Skeleton className="h-[250px] w-full rounded" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-10 w-[200px]" />
              <Skeleton className="h-[300px] w-full rounded" />
            </div>
            <Skeleton className="h-[400px] w-full rounded" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !college) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Navbar />
        <main className="flex-grow flex flex-col items-center justify-center p-8 text-center">
          <div className="rounded border border-[#C9A962]/40 bg-[#251E19] p-4 text-primary mb-4">
            <MapPin className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-heading font-medium text-foreground">College Details Not Found</h2>
          <p className="text-muted-foreground font-body italic text-sm mt-1 max-w-xs">We could not load information for this college ID. It may have been deleted.</p>
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
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="flex-grow">
        
        {/* 1. HERO HEADER SECTION */}
        <section className="relative h-[250px] sm:h-[320px] bg-[#1C1714] overflow-hidden border-b border-border">
          <img 
            src={college.imageUrl || "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1200&fit=crop"} 
            alt={college.name} 
            className="h-full w-full object-cover opacity-50 sepia-effect"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          
          <div className="absolute bottom-6 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <button 
              onClick={() => router.push("/colleges")}
              className="inline-flex items-center space-x-2 text-xs font-display uppercase tracking-wider text-muted-foreground hover:text-foreground bg-card/80 backdrop-blur-md px-3.5 py-2 rounded border border-border mb-6 transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5 text-primary" />
              <span>Back to Directory</span>
            </button>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <span className="rounded bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[10px] font-display font-medium text-primary uppercase tracking-wider">
                    {college.type}
                  </span>
                  <div className="flex items-center space-x-1 text-primary">
                    <Star className="h-4 w-4 fill-primary" />
                    <span className="text-xs font-bold text-foreground">{college.rating.toFixed(1)}</span>
                  </div>
                </div>
                
                <h1 className="text-2xl sm:text-4xl font-heading font-medium text-foreground tracking-tight leading-tight">
                  {college.name}
                </h1>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-muted-foreground font-body italic">
                  <span className="flex items-center"><MapPin className="h-4 w-4 mr-1 text-primary" />{college.location}, {college.state}</span>
                  <span className="hidden sm:inline text-border">•</span>
                  <span className="flex items-center"><Calendar className="h-4 w-4 mr-1 text-primary" />Established {college.established || "N/A"}</span>
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
                
                <TabsList className="w-full justify-start overflow-x-auto h-12 bg-card border border-border rounded p-1 mb-6">
                  <TabsTrigger value="overview" className="flex items-center space-x-1.5 px-4 font-display text-[10px] uppercase tracking-wider"><Building className="h-4 w-4" /><span>Overview</span></TabsTrigger>
                  <TabsTrigger value="courses" className="flex items-center space-x-1.5 px-4 font-display text-[10px] uppercase tracking-wider"><GraduationCap className="h-4 w-4" /><span>Courses</span></TabsTrigger>
                  <TabsTrigger value="placements" className="flex items-center space-x-1.5 px-4 font-display text-[10px] uppercase tracking-wider"><TrendingUp className="h-4 w-4" /><span>Placements</span></TabsTrigger>
                  <TabsTrigger value="reviews" className="flex items-center space-x-1.5 px-4 font-display text-[10px] uppercase tracking-wider"><MessageSquare className="h-4 w-4" /><span>Reviews</span></TabsTrigger>
                  <TabsTrigger value="facilities" className="flex items-center space-x-1.5 px-4 font-display text-[10px] uppercase tracking-wider"><Award className="h-4 w-4" /><span>Facilities</span></TabsTrigger>
                </TabsList>

                {/* A. OVERVIEW TAB */}
                <TabsContent value="overview">
                  <Card className="border-border bg-card shadow-premium rounded corner-flourish">
                    <CardHeader>
                      <CardTitle className="text-xl text-foreground font-heading font-medium">About the Institution</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-muted-foreground font-body text-base leading-relaxed">
                      <p>{college.description}</p>
                      
                      <div className="grid grid-cols-2 gap-6 pt-4 border-t border-border/40">
                        <div>
                          <div className="text-[10px] text-primary font-display uppercase tracking-widest">Entity Type</div>
                          <div className="text-sm font-semibold text-foreground mt-1">{college.type} Institution</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-primary font-display uppercase tracking-widest">Campus Location</div>
                          <div className="text-sm font-semibold text-foreground mt-1">{college.location}, {college.state}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* B. COURSES TAB */}
                <TabsContent value="courses">
                  <div className="space-y-4">
                    {college.courses?.length === 0 ? (
                      <div className="text-center py-10 border border-dashed border-border rounded text-muted-foreground text-sm font-body italic">
                        No courses recorded.
                      </div>
                    ) : (
                      college.courses?.map((course: any) => (
                        <Card key={course.id} className="border-border bg-card shadow-premium rounded hover:border-primary/50 transition-colors">
                          <CardContent className="p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div>
                                <div className="inline-block rounded bg-primary/10 border border-primary/20 px-2 py-0.5 text-[9px] font-display font-medium text-primary uppercase tracking-wider mb-2">
                                  {course.stream}
                                </div>
                                <h4 className="text-base font-heading font-medium text-foreground">{course.name}</h4>
                                <p className="text-xs text-muted-foreground font-body italic mt-1">{course.description || "Comprehensive academic syllabus."}</p>
                              </div>
                              
                              <div className="border-t sm:border-t-0 sm:border-l border-border pt-4 sm:pt-0 sm:pl-6 text-left sm:text-right shrink-0">
                                <div className="text-[9px] font-display text-muted-foreground uppercase tracking-widest">Annual Tuition</div>
                                <div className="text-base font-bold text-primary mt-0.5">{formatCurrency(course.fees)}</div>
                                <div className="text-[10px] font-display text-muted-foreground uppercase tracking-wider">{course.duration} Year Program</div>
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
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-display">
                      <Card className="border-border bg-[#1C1714] rounded">
                        <CardContent className="p-5 text-center">
                          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Average Package</div>
                          <div className="text-2xl font-heading font-medium text-foreground mt-1">
                            {latestPlacement ? formatSalary(latestPlacement.averagePackage) : "N/A"}
                          </div>
                          <div className="text-[9px] text-muted-foreground uppercase tracking-widest mt-1">Lakhs Per Annum</div>
                        </CardContent>
                      </Card>
                      <Card className="border-border bg-[#1C1714] rounded">
                        <CardContent className="p-5 text-center">
                          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Highest Package</div>
                          <div className="text-2xl font-heading font-medium text-primary mt-1">
                            {latestPlacement ? formatSalary(latestPlacement.highestPackage) : "N/A"}
                          </div>
                          <div className="text-[9px] text-muted-foreground uppercase tracking-widest mt-1">Lakhs Per Annum</div>
                        </CardContent>
                      </Card>
                      <Card className="border-border bg-[#1C1714] rounded">
                        <CardContent className="p-5 text-center">
                          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Placement Rate</div>
                          <div className="text-2xl font-heading font-medium text-foreground mt-1">
                            {latestPlacement ? `${latestPlacement.placementRate}%` : "N/A"}
                          </div>
                          <div className="text-[9px] text-muted-foreground uppercase tracking-widest mt-1">Batch Placed</div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Recruiting companies list */}
                    {latestPlacement?.topRecruiters && (
                      <Card className="border-border bg-card shadow-premium rounded">
                        <CardHeader>
                          <CardTitle className="text-base text-foreground font-heading font-medium">Top Partner Recruiters</CardTitle>
                          <CardDescription className="font-body italic text-muted-foreground">Major recruiters participating in the latest campus drive ({latestPlacement.year}).</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {latestPlacement.topRecruiters.map((company: string) => (
                              <span 
                                key={company} 
                                className="rounded border border-border bg-[#1C1714] px-3.5 py-1.5 text-xs font-display uppercase tracking-wider text-foreground"
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
                    <Card className="border-border bg-card shadow-premium rounded">
                      <CardHeader>
                        <CardTitle className="text-base text-foreground font-heading font-medium">Share Your Review</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {session ? (
                          <form onSubmit={handleReviewSubmit} className="space-y-4">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-display uppercase tracking-wider text-muted-foreground">Rating:</span>
                              <div className="flex space-x-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    type="button"
                                    key={star}
                                    onClick={() => setReviewRating(star)}
                                    className="p-1 hover:scale-110 transition-transform cursor-pointer"
                                    aria-label={`Rate ${star} out of 5 stars`}
                                    title={`Rate ${star} out of 5 stars`}
                                  >
                                    <Star 
                                      className={`h-5 w-5 ${
                                        star <= reviewRating 
                                          ? "fill-primary text-primary" 
                                          : "text-muted"
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
                              className="w-full rounded border border-border bg-[#1C1714] p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground/45 text-foreground font-body"
                            />
                            
                            <Button 
                              type="submit" 
                              variant="premium" 
                              disabled={submitReviewMutation.isPending || !reviewComment.trim()}
                              className="w-full sm:w-auto px-6 h-10 rounded"
                            >
                              Post Review
                            </Button>
                          </form>
                        ) : (
                          <div className="p-4 border border-dashed border-border rounded text-center">
                            <p className="text-sm text-muted-foreground font-body italic">You must be logged in to leave reviews.</p>
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
                        <div className="text-center py-6 border border-dashed border-border rounded text-muted-foreground text-sm font-body italic">
                          No reviews left yet. Be the first to add one!
                        </div>
                      ) : (
                        college.reviews?.map((review: any) => (
                          <Card key={review.id} className="border-border bg-card shadow-premium rounded">
                            <CardContent className="p-5 space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2.5">
                                  <img 
                                    src={review.userImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&h=100&fit=crop"} 
                                    alt={review.userName} 
                                    className="h-8 w-8 rounded-sm object-cover border border-border"
                                  />
                                  <div>
                                    <h5 className="text-xs font-display uppercase tracking-wider text-foreground">{review.userName || "Verified User"}</h5>
                                    <p className="text-[9px] text-muted-foreground font-body italic">{review.createdAt ? new Date(review.createdAt).toLocaleDateString() : "Just now"}</p>
                                  </div>
                                </div>

                                <div className="flex items-center space-x-0.5 text-primary bg-primary/5 px-2.5 py-0.5 rounded border border-primary/20">
                                  <Star className="h-3 w-3 fill-primary" />
                                  <span className="text-[10px] font-bold text-foreground">{review.rating}</span>
                                </div>
                              </div>
                              
                              <p className="text-muted-foreground font-body text-sm leading-relaxed pl-1">
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
                      <Card key={fac} className="border-border bg-card shadow-premium rounded">
                        <CardContent className="p-4 flex items-center space-x-3">
                          <div className="p-2 rounded border border-[#C9A962]/40 bg-[#1C1714] shrink-0">
                            {getFacilityIcon(fac)}
                          </div>
                          <span className="text-xs font-display uppercase tracking-wider text-foreground leading-snug">{fac}</span>
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
              <Card className="border-border bg-card shadow-premium rounded">
                <CardHeader className="border-b border-border/40 pb-4">
                  <CardTitle className="text-xs font-display font-semibold text-primary uppercase tracking-widest">Institution Stats</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-5">
                  
                  {/* Fee Stat */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-[9px] font-display uppercase tracking-widest text-muted-foreground">Average Fees</div>
                      <div className="text-lg font-heading font-medium text-foreground mt-0.5">
                        {formatCurrency(college.averageFees)}
                        <span className="text-xs font-body italic text-muted-foreground font-normal"> / year</span>
                      </div>
                    </div>
                  </div>

                  {/* Salary Stat */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-[9px] font-display uppercase tracking-widest text-muted-foreground">Average Package</div>
                      <div className="text-lg font-heading font-medium text-primary mt-0.5">
                        {latestPlacement ? formatSalary(latestPlacement.averagePackage) : "N/A"}
                      </div>
                    </div>
                  </div>

                  {/* Rating Stat */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-[9px] font-display uppercase tracking-widest text-muted-foreground">Student Rating</div>
                      <div className="flex items-center space-x-1.5 mt-0.5">
                        <span className="text-lg font-heading font-medium text-foreground">{college.rating.toFixed(2)}</span>
                        <div className="flex text-primary">
                          <Star className="h-4 w-4 fill-primary text-primary" />
                        </div>
                        <span className="text-xs text-muted-foreground font-body italic">({college.reviews?.length || 0} reviews)</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-border pt-5 space-y-3">
                    {/* Action: Save College */}
                    <Button 
                      onClick={handleBookmarkClick}
                      variant={isSaved ? "default" : "outline"}
                      className="w-full rounded flex items-center justify-center space-x-2 h-12 text-xs font-semibold"
                    >
                      <Heart className={`h-4.5 w-4.5 ${isSaved ? "fill-primary text-primary-foreground" : ""}`} />
                      <span>{isSaved ? "Saved in Shortlist" : "Save to Shortlist"}</span>
                    </Button>
                    
                    {/* Action: Add to Compare */}
                    <Button 
                      onClick={handleCompareClick}
                      variant={inCompare ? "premium" : "outline"}
                      className="w-full rounded flex items-center justify-center space-x-2 h-12 text-xs font-semibold"
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
