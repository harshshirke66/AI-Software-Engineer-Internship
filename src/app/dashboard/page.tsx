"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { 
  Bookmark, Mail, ShieldCheck, MapPin, 
  Star, Trash2, ArrowRight, Compass 
} from "lucide-react";
import { formatCurrency, formatSalary } from "@/lib/utils";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();

  // Redirect to signin page if not authenticated
  React.useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/signin?callbackUrl=/dashboard");
    }
  }, [loading, user, router]);

  // Fetch user's saved colleges
  const { data, isLoading } = useQuery({
    queryKey: ["saved-colleges"],
    queryFn: async () => {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch("/api/saved-colleges", { headers });
      if (!res.ok) throw new Error("Failed to load bookmarks");
      return res.json();
    },
    enabled: !loading && !!user,
  });

  const savedColleges = data?.savedColleges || [];

  // Remove Bookmark Mutation
  const removeBookmarkMutation = useMutation({
    mutationFn: async (collegeId: string) => {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch("/api/saved-colleges", {
        method: "DELETE",
        headers,
        body: JSON.stringify({ collegeId }),
      });
      if (!res.ok) throw new Error("Failed to remove bookmark");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-colleges"] });
    },
    onError: (err, collegeId) => {
      // Optimistic/Local fallback
      queryClient.setQueryData(["saved-colleges"], (oldData: any) => {
        if (!oldData?.savedColleges) return oldData;
        return {
          savedColleges: oldData.savedColleges.filter((sc: any) => sc.collegeId !== collegeId),
        };
      });
    }
  });

  const handleRemoveClick = (e: React.MouseEvent, collegeId: string) => {
    e.stopPropagation();
    removeBookmarkMutation.mutate(collegeId);
  };

  if (loading || (user && isLoading)) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Navbar />
        <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-8 space-y-6">
          <Skeleton className="h-[120px] w-full rounded" />
          <div className="space-y-4">
            <Skeleton className="h-6 w-[200px]" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-[280px] w-full rounded" />
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* 1. USER PROFILE SUMMARY CARD */}
        <div className="relative rounded border border-border bg-card/60 p-6 sm:p-8 backdrop-blur-sm overflow-hidden mb-10 shadow-premium ornate-frame">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {user?.user_metadata?.avatar_url || user?.user_metadata?.image ? (
              <img 
                src={user.user_metadata.avatar_url || user.user_metadata.image} 
                alt={user.user_metadata?.full_name || user.user_metadata?.name || "User Avatar"} 
                className="h-20 w-20 rounded border border-border object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded bg-brass text-[#1C1714] text-3xl font-bold font-display shadow-brass">
                {(user.user_metadata?.full_name || user.user_metadata?.name || user.email)?.[0]?.toUpperCase() || "U"}
              </div>
            )}

            <div className="space-y-2 text-center sm:text-left flex-grow">
              <h1 className="text-2xl sm:text-3xl font-heading font-medium text-foreground tracking-tight">
                Welcome, {user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "Student"}!
              </h1>
              
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-sm text-muted-foreground font-body italic">
                <span className="flex items-center"><Mail className="h-4 w-4 mr-1 text-primary" />{user.email}</span>
                <span className="flex items-center"><ShieldCheck className="h-4 w-4 mr-1 text-primary" />Student Profile</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. SHORTLISTED COLLEGES SECTION */}
        <div className="space-y-6">
          <div className="flex items-center space-x-2.5">
            <Bookmark className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-heading font-medium text-foreground tracking-tight">My Saved Shortlist ({savedColleges.length})</h2>
          </div>

          {savedColleges.length === 0 ? (
            /* Empty State */
            <div className="rounded border border-dashed border-border bg-card/25 p-12 text-center max-w-md mx-auto space-y-4 flex flex-col items-center justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded border border-primary/20 bg-[#1C1714] text-primary">
                <Compass className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-heading font-medium text-foreground">Your shortlist is empty</h3>
                <p className="text-muted-foreground font-body italic text-xs">Browse college catalogs and bookmark your favorite ones to view them here.</p>
              </div>
              <Button onClick={() => router.push("/colleges")} variant="premium" className="rounded flex items-center space-x-2 text-xs">
                <span>Browse Colleges</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            /* Cards List Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedColleges.map((bookmark: any) => {
                const col = bookmark.college;
                if (!col) return null;
                const placement = col.placements?.[0];

                return (
                  <Card
                    key={bookmark.id}
                    onClick={() => router.push(`/colleges/${col.id}`)}
                    className="group border border-border bg-card hover:border-primary/50 overflow-hidden cursor-pointer hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between shadow-premium rounded corner-flourish"
                  >
                    <div className="p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-display font-semibold tracking-wider text-primary">{col.type}</span>
                        <div className="flex items-center space-x-1 text-primary">
                          <Star className="h-3.5 w-3.5 fill-primary" />
                          <span className="text-xs font-semibold text-foreground">{col.rating.toFixed(1)}</span>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-base font-heading font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {col.name}
                        </h3>
                        <p className="mt-1 flex items-center text-xs text-muted-foreground font-body italic">
                          <MapPin className="h-3.5 w-3.5 mr-1 text-primary shrink-0" />
                          <span>{col.location}, {col.state}</span>
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-xs pt-3 border-t border-border">
                        <div>
                          <div className="text-[9px] font-display text-muted-foreground uppercase tracking-wider">Average Fees</div>
                          <div className="font-semibold text-foreground mt-0.5 font-body">{formatCurrency(col.averageFees)}/yr</div>
                        </div>
                        <div>
                          <div className="text-[9px] font-display text-muted-foreground uppercase tracking-wider">Avg Placement</div>
                          <div className="font-semibold text-primary mt-0.5 font-heading">
                            {placement ? formatSalary(placement.averagePackage) : "N/A"}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#1C1714] p-3.5 border-t border-border flex gap-2">
                      <Button
                        onClick={(e) => handleRemoveClick(e, col.id)}
                        variant="ghost"
                        size="sm"
                        disabled={removeBookmarkMutation.isPending}
                        className="w-full text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded flex items-center justify-center space-x-1 h-10 text-xs font-display uppercase tracking-wider"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Remove shortlist</span>
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

      </main>

      <Footer />
    </div>
  );
}
