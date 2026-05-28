"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { useCompareStore } from "@/lib/store/useCompareStore";
import { 
  GitCompare, Trash2, Plus, Star, MapPin, 
  Check, X, ArrowRight 
} from "lucide-react";
import { formatCurrency, formatSalary } from "@/lib/utils";

export default function ComparePage() {
  const router = useRouter();
  const { collegeIds, removeCollege, addCollege, clearCompare } = useCompareStore();
  const [dropdownIndex, setDropdownIndex] = React.useState<number | null>(null);

  // 1. Fetch all colleges so the user can select and add them on the fly
  const { data } = useQuery({
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
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <span className="font-display text-[10px] tracking-[0.2em] text-primary uppercase block mb-1">Volume III • Analytics</span>
            <h1 className="text-3xl font-heading font-medium text-foreground tracking-tight flex items-center gap-2">
              <GitCompare className="h-7 w-7 text-primary" />
              <span>Compare Colleges</span>
            </h1>
            <p className="text-muted-foreground font-body italic text-sm mt-1">Side-by-side analysis of key metrics: fees, ratings, placements, and facilities.</p>
          </div>
          
          {collegeIds.length > 0 && (
            <Button 
              onClick={clearCompare} 
              variant="outline" 
              className="border-destructive/20 text-destructive hover:bg-destructive/10 self-start"
            >
              Clear Compare Queue
            </Button>
          )}
        </div>

        {/* 1. EMPTY STATE (Less than 1 college selected) */}
        {comparedColleges.length === 0 ? (
          <div className="rounded border border-dashed border-border bg-card/25 p-16 text-center max-w-2xl mx-auto space-y-6 flex flex-col items-center justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded border border-primary/20 bg-[#1C1714] text-primary shadow-premium">
              <GitCompare className="h-7 w-7" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-heading font-medium text-foreground">Your comparison deck is empty</h3>
              <p className="text-muted-foreground font-body italic text-sm max-w-sm mx-auto">
                Select colleges from the discovery directory or pick from the list below to begin analyzing side-by-side.
              </p>
            </div>

            {/* Quick selectors list */}
            {allColleges.length > 0 && (
              <div className="w-full max-w-md pt-4 space-y-3">
                <p className="text-[10px] font-display text-primary uppercase tracking-widest">Quick Select</p>
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
                  {allColleges.slice(0, 4).map((college: any) => (
                    <button
                      key={college.id}
                      onClick={() => handleAddCollegeDirectly(college.id)}
                      className="flex items-center justify-between p-3 rounded border border-border bg-card hover:bg-primary/5 text-left transition-colors cursor-pointer"
                    >
                      <div>
                        <div className="text-sm font-heading font-medium text-foreground">{college.name}</div>
                        <div className="text-xs text-muted-foreground font-body italic">{college.location}, {college.state}</div>
                      </div>
                      <Plus className="h-4 w-4 text-primary" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Button onClick={() => router.push("/colleges")} variant="premium" className="rounded flex items-center space-x-2">
              <span>Go to Discovery Directory</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          
          /* 2. COMPARISON TABLE MATRIX */
          <div className="space-y-8">
            <div className="overflow-x-auto rounded border border-border bg-card/25 backdrop-blur-sm shadow-premium">
              <table className="w-full border-collapse text-left min-w-[700px]">
                
                {/* Column Headers */}
                <thead>
                  <tr className="border-b border-border bg-card/80 font-display text-[10px] uppercase tracking-wider">
                    <th className="p-6 text-primary w-1/4">Comparison Categories</th>
                    
                    {/* Render slots for 3 compared items */}
                    {[0, 1, 2].map((idx) => {
                      const college = comparedColleges[idx];
                      
                      return (
                        <th key={idx} className="p-6 w-1/4 border-l border-border relative">
                          {college ? (
                            /* Card Header with delete */
                            <div className="space-y-4">
                              <button
                                onClick={() => removeCollege(college.id)}
                                className="absolute top-4 right-4 p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                                title={`Remove ${college.name} from compare queue`}
                                aria-label={`Remove ${college.name} from compare queue`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                              
                              <div className="pr-6">
                                <span className="inline-block rounded bg-primary/10 border border-primary/20 px-2 py-0.5 text-[9px] font-display font-medium text-primary uppercase tracking-widest mb-2">
                                  {college.type}
                                </span>
                                <h3 className="text-sm font-heading font-medium text-foreground line-clamp-2 hover:text-primary transition-colors cursor-pointer" onClick={() => router.push(`/colleges/${college.id}`)}>
                                  {college.name}
                                </h3>
                                <p className="text-xs text-muted-foreground font-body italic flex items-center mt-1">
                                  <MapPin className="h-3 w-3 mr-1 text-primary" />
                                  <span>{college.location}, {college.state}</span>
                                </p>
                              </div>
                            </div>
                          ) : (
                            /* Add College placeholder slot */
                            <div className="relative flex flex-col items-center justify-center py-6 text-center space-y-3">
                              <button
                                onClick={() => setDropdownIndex(dropdownIndex === idx ? null : idx)}
                                className="flex h-11 w-11 items-center justify-center rounded border border-dashed border-primary/45 hover:border-primary bg-primary/5 hover:bg-primary/10 text-primary transition-colors cursor-pointer"
                                aria-label="Add college to comparison slot"
                                title="Add college to comparison slot"
                              >
                                <Plus className="h-5 w-5" />
                              </button>
                              <span className="text-[10px] font-display font-semibold tracking-wider text-muted-foreground uppercase">Add College</span>

                              {/* Search selection dropdown menu overlay */}
                              {dropdownIndex === idx && (
                                <>
                                  <div className="fixed inset-0 z-10" onClick={() => setDropdownIndex(null)} />
                                  <div className="absolute top-20 left-1/2 -translate-x-1/2 w-64 rounded border border-border bg-[#1C1714] p-2 shadow-premium z-20 text-left">
                                    <div className="px-2 py-1.5 text-[9px] text-primary uppercase tracking-widest font-display border-b border-border/40 mb-1">
                                      Select College
                                    </div>
                                    <div className="max-h-48 overflow-y-auto space-y-1">
                                      {remainingColleges.length === 0 ? (
                                        <div className="px-2 py-3 text-xs text-muted-foreground text-center">No other colleges available.</div>
                                      ) : (
                                        remainingColleges.map((c: any) => (
                                          <button
                                            key={c.id}
                                            onClick={() => handleAddCollegeDirectly(c.id)}
                                            className="w-full text-left px-2.5 py-2 text-xs font-display uppercase tracking-wider hover:bg-muted/30 rounded text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                          >
                                            <div className="truncate font-bold">{c.name}</div>
                                            <div className="text-[10px] text-muted-foreground truncate font-body italic normal-case">{c.location}, {c.state}</div>
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
                  <tr className="border-b border-border hover:bg-muted/10">
                    <td className="p-4 text-[10px] font-display font-semibold text-muted-foreground uppercase tracking-wider">Rating</td>
                    {[0, 1, 2].map((idx) => {
                      const college = comparedColleges[idx];
                      return (
                        <td key={idx} className="p-4 border-l border-border text-sm font-semibold text-foreground">
                          {college ? (
                            <div className="flex items-center space-x-1.5 text-primary">
                              <Star className="h-4 w-4 fill-primary text-primary" />
                              <span>{college.rating.toFixed(2)} ★</span>
                              <span className="text-[10px] text-muted-foreground font-body italic font-normal">({college.reviews?.length || 0} reviews)</span>
                            </div>
                          ) : (
                            <span className="text-border">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Established Year row */}
                  <tr className="border-b border-border hover:bg-muted/10">
                    <td className="p-4 text-[10px] font-display font-semibold text-muted-foreground uppercase tracking-wider">Established</td>
                    {[0, 1, 2].map((idx) => {
                      const college = comparedColleges[idx];
                      return (
                        <td key={idx} className="p-4 border-l border-border text-sm text-foreground font-body">
                          {college ? (
                            <span>{college.established || "N/A"}</span>
                          ) : (
                            <span className="text-border">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Average Fees row */}
                  <tr className="border-b border-border hover:bg-muted/10">
                    <td className="p-4 text-[10px] font-display font-semibold text-muted-foreground uppercase tracking-wider">Average Fees</td>
                    {[0, 1, 2].map((idx) => {
                      const college = comparedColleges[idx];
                      return (
                        <td key={idx} className="p-4 border-l border-border text-sm font-semibold text-foreground">
                          {college ? (
                            <div className="flex flex-col font-body">
                              <span>{formatCurrency(college.averageFees)}</span>
                              <span className="text-[10px] text-muted-foreground font-normal italic">per year</span>
                            </div>
                          ) : (
                            <span className="text-border">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Average Placement Package row */}
                  <tr className="border-b border-border hover:bg-muted/10">
                    <td className="p-4 text-[10px] font-display font-semibold text-muted-foreground uppercase tracking-wider">Avg Placement Package</td>
                    {[0, 1, 2].map((idx) => {
                      const college = comparedColleges[idx];
                      const placement = college?.placements?.[0];
                      return (
                        <td key={idx} className="p-4 border-l border-border text-sm font-semibold text-foreground font-heading">
                          {college ? (
                            <span className="text-primary font-medium">
                              {placement ? formatSalary(placement.averagePackage) : "N/A"}
                            </span>
                          ) : (
                            <span className="text-border">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Highest Placement Package row */}
                  <tr className="border-b border-border hover:bg-muted/10">
                    <td className="p-4 text-[10px] font-display font-semibold text-muted-foreground uppercase tracking-wider">Highest Placement Package</td>
                    {[0, 1, 2].map((idx) => {
                      const college = comparedColleges[idx];
                      const placement = college?.placements?.[0];
                      return (
                        <td key={idx} className="p-4 border-l border-border text-sm font-semibold text-foreground font-heading">
                          {college ? (
                            <span className="text-primary font-medium">
                              {placement ? formatSalary(placement.highestPackage) : "N/A"}
                            </span>
                          ) : (
                            <span className="text-border">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Placement Rate row */}
                  <tr className="border-b border-border hover:bg-muted/10">
                    <td className="p-4 text-[10px] font-display font-semibold text-muted-foreground uppercase tracking-wider">Placement Rate</td>
                    {[0, 1, 2].map((idx) => {
                      const college = comparedColleges[idx];
                      const placement = college?.placements?.[0];
                      return (
                        <td key={idx} className="p-4 border-l border-border text-sm font-semibold text-foreground font-body">
                          {college ? (
                            <span>{placement ? `${placement.placementRate}%` : "N/A"}</span>
                          ) : (
                            <span className="text-border">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Top Recruiters row */}
                  <tr className="border-b border-border hover:bg-muted/10">
                    <td className="p-4 text-[10px] font-display font-semibold text-muted-foreground uppercase tracking-wider">Top Recruiters</td>
                    {[0, 1, 2].map((idx) => {
                      const college = comparedColleges[idx];
                      const placement = college?.placements?.[0];
                      return (
                        <td key={idx} className="p-4 border-l border-border text-xs text-muted-foreground">
                          {college && placement?.topRecruiters ? (
                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                              {placement.topRecruiters.map((rec: string) => (
                                <span key={rec} className="rounded border border-border bg-[#1C1714] px-1.5 py-0.5 text-[9px] font-display uppercase tracking-wider text-foreground">
                                  {rec}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-border">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Campus Facilities compare checklist */}
                  {commonFacilities.map((facility) => (
                    <tr key={facility} className="border-b border-border hover:bg-muted/10 last:border-b-0">
                      <td className="p-4 text-[10px] font-display font-semibold text-muted-foreground uppercase tracking-wider">{facility}</td>
                      {[0, 1, 2].map((idx) => {
                        const college = comparedColleges[idx];
                        const hasFac = college?.facilities?.some((f: string) => f.toLowerCase() === facility.toLowerCase());
                        
                        return (
                          <td key={idx} className="p-4 border-l border-border">
                            {college ? (
                              hasFac ? (
                                <Check className="h-4 w-4 text-primary" />
                              ) : (
                                <X className="h-4 w-4 text-rose-500" />
                              )
                            ) : (
                              <span className="text-border">-</span>
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
              <p className="text-xs text-center text-muted-foreground font-body italic">
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
