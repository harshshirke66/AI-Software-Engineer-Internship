"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { 
  Bookmark, User, Mail, ShieldCheck, MapPin, 
  Star, Heart, Trash2, ArrowRight, Compass 
} from "lucide-react";
import { formatCurrency, formatSalary } from "@/lib/utils";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();

  // Redirect to signin page if not authenticated
  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/dashboard");
    }
  }, [status, router]);

  // Fetch user's saved colleges
  const { data, isLoading, error } = useQuery({
    queryKey: ["saved-colleges"],
    queryFn: async () => {
      const res = await fetch("/api/saved-colleges");
      if (!res.ok) throw new Error("Failed to load bookmarks");
      return res.json();
    },
    enabled: status === "authenticated",
  });

  const savedColleges = data?.savedColleges || [];

  // Remove Bookmark Mutation
  const removeBookmarkMutation = useMutation({
    mutationFn: async (collegeId: string) => {
      const res = await fetch("/api/saved-colleges", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
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

  if (status === "loading" || (status === "authenticated" && isLoading)) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Navbar />
        <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-8 space-y-6">
          <Skeleton className="h-[120px] w-full rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-6 w-[200px]" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-[280px] w-full rounded-xl" />
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* 1. USER PROFILE SUMMARY CARD */}
        <div className="relative rounded-2xl border border-border bg-slate-900/40 p-6 sm:p-8 backdrop-blur-sm overflow-hidden mb-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {session?.user?.image ? (
              <img 
                src={session.user.image} 
                alt={session.user.name || "User Avatar"} 
                className="h-20 w-20 rounded-2xl object-cover border border-border"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white text-3xl font-bold">
                {session?.user?.name?.[0] || "U"}
              </div>
            )}

            <div className="space-y-2 text-center sm:text-left flex-grow">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Welcome, {session?.user?.name || "Student"}!
              </h1>
              
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-sm text-slate-400">
                <span className="flex items-center"><Mail className="h-4 w-4 mr-1 text-slate-500" />{session?.user?.email}</span>
                <span className="flex items-center"><ShieldCheck className="h-4 w-4 mr-1 text-indigo-400" />Student Profile</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. SHORTLISTED COLLEGES SECTION */}
        <div className="space-y-6">
          <div className="flex items-center space-x-2.5">
            <Bookmark className="h-6 w-6 text-indigo-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">My Saved Shortlist ({savedColleges.length})</h2>
          </div>

          {savedColleges.length === 0 ? (
            /* Empty State */
            <div className="rounded-2xl border border-dashed border-border/80 bg-slate-900/10 p-12 text-center max-w-md mx-auto space-y-4 flex flex-col items-center justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 text-slate-400">
                <Compass className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Your shortlist is empty</h3>
                <p className="text-slate-400 text-xs">Browse college catalogs and bookmark your favorite ones to view them here.</p>
              </div>
              <Button onClick={() => router.push("/colleges")} variant="premium" className="rounded-xl flex items-center space-x-2 text-xs">
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
                    className="group border-border hover:border-indigo-500/30 bg-slate-900/30 overflow-hidden cursor-pointer hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div className="p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400">{col.type}</span>
                        <div className="flex items-center space-x-1 text-amber-400">
                          <Star className="h-3.5 w-3.5 fill-amber-400" />
                          <span className="text-xs font-bold text-slate-200">{col.rating.toFixed(1)}</span>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-white group-hover:text-primary transition-colors line-clamp-1">
                          {col.name}
                        </h3>
                        <p className="mt-1 flex items-center text-xs text-slate-400">
                          <MapPin className="h-3.5 w-3.5 mr-1 text-slate-500 shrink-0" />
                          <span>{col.location}, {col.state}</span>
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-xs pt-3 border-t border-border/40">
                        <div>
                          <div className="text-[9px] text-slate-500 uppercase tracking-wider font-mono">Average Fees</div>
                          <div className="font-semibold text-white mt-0.5">{formatCurrency(col.averageFees)}/yr</div>
                        </div>
                        <div>
                          <div className="text-[9px] text-slate-500 uppercase tracking-wider font-mono">Avg Placement</div>
                          <div className="font-semibold text-emerald-400 mt-0.5">
                            {placement ? formatSalary(placement.averagePackage) : "N/A"}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-950/60 p-3.5 border-t border-border/40 flex gap-2">
                      <Button
                        onClick={(e) => handleRemoveClick(e, col.id)}
                        variant="ghost"
                        size="sm"
                        disabled={removeBookmarkMutation.isPending}
                        className="w-full text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg flex items-center justify-center space-x-1 h-8 text-xs font-semibold"
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
