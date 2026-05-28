"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { useCompareStore } from "@/lib/store/useCompareStore";
import { 
  GitCompare, Trash2, Plus, Star, MapPin, 
  DollarSign, Check, X, ShieldAlert, Sparkles,
  ArrowRight, Search, Landmark 
} from "lucide-react";
import { formatCurrency, formatSalary } from "@/lib/utils";

export default function ComparePage() {
  const router = useRouter();
  const { collegeIds, removeCollege, addCollege, clearCompare } = useCompareStore();
  const [dropdownIndex, setDropdownIndex] = React.useState<number | null>(null);

  // 1. Fetch all colleges so the user can select and add them on the fly
  const { data, isLoading } = useQuery({
    queryKey: ["colleges-all-compare"],
    queryFn: async () => {
      const res = await fetch("/api/colleges?limit=50");
      if (!res.ok) throw new Error("Failed to load colleges");
      return res.json();
    }
  });

  const allColleges = data?.colleges || [];

  // Filter selected colleges based on Zustand store IDs
  const comparedColleges = allColleges.filter((c: any) => collegeIds.includes(c.id));

  // Find remaining colleges that can be added
  const remainingColleges = allColleges.filter((c: any) => !collegeIds.includes(c.id));

  const handleAddCollegeDirectly = (id: string) => {
    const added = addCollege(id);
    if (!added) {
      alert("You can compare up to 3 colleges at a time.");
    }
    setDropdownIndex(null);
  };

  const commonFacilities = [
    "High-speed Wifi",
    "Central Library",
    "Hostel",
    "Sports Complex",
    "Gymnasium",
    "Advanced Labs"
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <GitCompare className="h-7 w-7 text-indigo-400" />
              <span>Compare Colleges</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">Side-by-side analysis of key metrics: fees, ratings, placements, and facilities.</p>
          </div>
          
          {collegeIds.length > 0 && (
            <Button 
              onClick={clearCompare} 
              variant="outline" 
              className="border-rose-500/20 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 self-start"
            >
              Clear Compare Queue
            </Button>
          )}
        </div>

        {/* 1. EMPTY STATE (Less than 1 college selected) */}
        {comparedColleges.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/80 bg-slate-900/10 p-16 text-center max-w-2xl mx-auto space-y-6 flex flex-col items-center justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 shadow-lg">
              <GitCompare className="h-7 w-7" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">Your comparison deck is empty</h3>
              <p className="text-slate-400 text-sm max-w-sm mx-auto">
                Select colleges from the discovery directory or pick from the list below to begin analyzing side-by-side.
              </p>
            </div>

            {/* Quick selectors list */}
            {allColleges.length > 0 && (
              <div className="w-full max-w-md pt-4 space-y-3">
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Quick Select</p>
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
                  {allColleges.slice(0, 4).map((college: any) => (
                    <button
                      key={college.id}
                      onClick={() => handleAddCollegeDirectly(college.id)}
                      className="flex items-center justify-between p-3 rounded-xl border border-border bg-slate-900/40 hover:bg-indigo-500/5 text-left transition-colors"
                    >
                      <div>
                        <div className="text-sm font-bold text-white">{college.name}</div>
                        <div className="text-xs text-slate-400">{college.location}, {college.state}</div>
                      </div>
                      <Plus className="h-4 w-4 text-indigo-400" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Button onClick={() => router.push("/colleges")} variant="premium" className="rounded-xl flex items-center space-x-2">
              <span>Go to Discovery Directory</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          
          /* 2. COMPARISON TABLE MATRIX */
          <div className="space-y-8">
            <div className="overflow-x-auto rounded-2xl border border-border bg-slate-900/10 backdrop-blur-sm shadow-xl">
              <table className="w-full border-collapse text-left min-w-[700px]">
                
                {/* Column Headers */}
                <thead>
                  <tr className="border-b border-border/60 bg-slate-900/40">
                    <th className="p-6 text-sm font-bold text-slate-400 w-1/4">Comparison Categories</th>
                    
                    {/* Render slots for 3 compared items */}
                    {[0, 1, 2].map((idx) => {
                      const college = comparedColleges[idx];
                      
                      return (
                        <th key={idx} className="p-6 w-1/4 border-l border-border/40 relative">
                          {college ? (
                            /* Card Header with delete */
                            <div className="space-y-4">
                              <button
                                onClick={() => removeCollege(college.id)}
                                className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                                title="Remove college"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                              
                              <div className="pr-6">
                                <span className="inline-block rounded bg-indigo-500/10 px-2 py-0.5 text-[9px] font-bold text-indigo-300 mb-2">
                                  {college.type}
                                </span>
                                <h3 className="text-sm sm:text-base font-bold text-white line-clamp-2 hover:text-primary transition-colors cursor-pointer" onClick={() => router.push(`/colleges/${college.id}`)}>
                                  {college.name}
                                </h3>
                                <p className="text-xs text-slate-400 flex items-center mt-1">
                                  <MapPin className="h-3 w-3 mr-1 text-slate-500" />
                                  <span>{college.location}, {college.state}</span>
                                </p>
                              </div>
                            </div>
                          ) : (
                            /* Add College placeholder slot */
                            <div className="relative flex flex-col items-center justify-center py-6 text-center space-y-3">
                              <button
                                onClick={() => setDropdownIndex(dropdownIndex === idx ? null : idx)}
                                className="flex h-11 w-11 items-center justify-center rounded-full border border-dashed border-indigo-500/40 hover:border-indigo-400 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-400 transition-colors cursor-pointer"
                              >
                                <Plus className="h-5 w-5" />
                              </button>
                              <span className="text-xs text-slate-500 font-medium">Add College to Compare</span>

                              {/* Search selection dropdown menu overlay */}
                              {dropdownIndex === idx && (
                                <>
                                  <div className="fixed inset-0 z-10" onClick={() => setDropdownIndex(null)} />
                                  <div className="absolute top-20 left-1/2 -translate-x-1/2 w-64 rounded-xl border border-border bg-slate-950 p-2 shadow-2xl z-20 text-left">
                                    <div className="px-2 py-1.5 text-[10px] text-slate-500 uppercase tracking-wider font-semibold border-b border-border/40 mb-1">
                                      Select College
                                    </div>
                                    <div className="max-h-48 overflow-y-auto space-y-1">
                                      {remainingColleges.length === 0 ? (
                                        <div className="px-2 py-3 text-xs text-slate-400 text-center">No other colleges available.</div>
                                      ) : (
                                        remainingColleges.map((c: any) => (
                                          <button
                                            key={c.id}
                                            onClick={() => handleAddCollegeDirectly(c.id)}
                                            className="w-full text-left px-2.5 py-2 text-xs font-semibold hover:bg-accent/40 rounded-lg text-slate-200 hover:text-white transition-colors"
                                          >
                                            <div className="truncate font-bold">{c.name}</div>
                                            <div className="text-[10px] text-slate-500 truncate">{c.location}, {c.state}</div>
                                          </button>
                                        ))
                                      )}
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </th>
                      );
                    })}
                  </tr>
                </thead>

                {/* Table Body rows */}
                <tbody>
                  
                  {/* Rating row */}
                  <tr className="border-b border-border/40 hover:bg-slate-900/10">
                    <td className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">Rating</td>
                    {[0, 1, 2].map((idx) => {
                      const college = comparedColleges[idx];
                      return (
                        <td key={idx} className="p-4 border-l border-border/40 text-sm font-bold text-white">
                          {college ? (
                            <div className="flex items-center space-x-1.5 text-amber-400">
                              <Star className="h-4 w-4 fill-amber-400" />
                              <span>{college.rating.toFixed(2)} ★</span>
                              <span className="text-[10px] text-slate-500 font-normal">({college.reviews?.length || 0} reviews)</span>
                            </div>
                          ) : (
                            <span className="text-slate-600">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Established Year row */}
                  <tr className="border-b border-border/40 hover:bg-slate-900/10">
                    <td className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">Established</td>
                    {[0, 1, 2].map((idx) => {
                      const college = comparedColleges[idx];
                      return (
                        <td key={idx} className="p-4 border-l border-border/40 text-sm text-slate-200">
                          {college ? (
                            <span>{college.established || "N/A"}</span>
                          ) : (
                            <span className="text-slate-600">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Average Fees row */}
                  <tr className="border-b border-border/40 hover:bg-slate-900/10">
                    <td className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">Average Fees</td>
                    {[0, 1, 2].map((idx) => {
                      const college = comparedColleges[idx];
                      return (
                        <td key={idx} className="p-4 border-l border-border/40 text-sm font-bold text-white">
                          {college ? (
                            <div className="flex flex-col">
                              <span>{formatCurrency(college.averageFees)}</span>
                              <span className="text-[10px] text-slate-500 font-normal">per year</span>
                            </div>
                          ) : (
                            <span className="text-slate-600">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Average Placement Package row */}
                  <tr className="border-b border-border/40 hover:bg-slate-900/10">
                    <td className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">Avg Placement Package</td>
                    {[0, 1, 2].map((idx) => {
                      const college = comparedColleges[idx];
                      const placement = college?.placements?.[0];
                      return (
                        <td key={idx} className="p-4 border-l border-border/40 text-sm font-bold text-white">
                          {college ? (
                            <span className="text-emerald-400">
                              {placement ? formatSalary(placement.averagePackage) : "N/A"}
                            </span>
                          ) : (
                            <span className="text-slate-600">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Highest Placement Package row */}
                  <tr className="border-b border-border/40 hover:bg-slate-900/10">
                    <td className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">Highest Placement Package</td>
                    {[0, 1, 2].map((idx) => {
                      const college = comparedColleges[idx];
                      const placement = college?.placements?.[0];
                      return (
                        <td key={idx} className="p-4 border-l border-border/40 text-sm font-bold text-white">
                          {college ? (
                            <span className="text-emerald-300">
                              {placement ? formatSalary(placement.highestPackage) : "N/A"}
                            </span>
                          ) : (
                            <span className="text-slate-600">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Placement Rate row */}
                  <tr className="border-b border-border/40 hover:bg-slate-900/10">
                    <td className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">Placement Rate</td>
                    {[0, 1, 2].map((idx) => {
                      const college = comparedColleges[idx];
                      const placement = college?.placements?.[0];
                      return (
                        <td key={idx} className="p-4 border-l border-border/40 text-sm font-bold text-indigo-300">
                          {college ? (
                            <span>{placement ? `${placement.placementRate}%` : "N/A"}</span>
                          ) : (
                            <span className="text-slate-600">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Top Recruiters row */}
                  <tr className="border-b border-border/40 hover:bg-slate-900/10">
                    <td className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">Top Recruiters</td>
                    {[0, 1, 2].map((idx) => {
                      const college = comparedColleges[idx];
                      const placement = college?.placements?.[0];
                      return (
                        <td key={idx} className="p-4 border-l border-border/40 text-xs text-slate-300">
                          {college && placement?.topRecruiters ? (
                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                              {placement.topRecruiters.map((rec: string) => (
                                <span key={rec} className="rounded bg-slate-950 px-1.5 py-0.5 text-[9px] font-semibold border border-border/40">
                                  {rec}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-600">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Campus Facilities compare checklist */}
                  {commonFacilities.map((facility) => (
                    <tr key={facility} className="border-b border-border/40 hover:bg-slate-900/10 last:border-b-0">
                      <td className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">{facility}</td>
                      {[0, 1, 2].map((idx) => {
                        const college = comparedColleges[idx];
                        const hasFac = college?.facilities?.some((f: string) => f.toLowerCase() === facility.toLowerCase());
                        
                        return (
                          <td key={idx} className="p-4 border-l border-border/40">
                            {college ? (
                              hasFac ? (
                                <Check className="h-5 w-5 text-emerald-400" />
                              ) : (
                                <X className="h-5 w-5 text-rose-500" />
                              )
                            ) : (
                              <span className="text-slate-600">-</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}

                </tbody>
              </table>
            </div>

            {comparedColleges.length < 3 && remainingColleges.length > 0 && (
              <p className="text-xs text-center text-slate-500 font-medium">
                Tip: You can add another college by clicking the "+" slot in the table headers.
              </p>
            )}
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
