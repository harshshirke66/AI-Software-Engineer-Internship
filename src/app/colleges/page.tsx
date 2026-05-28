"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { useCompareStore } from "@/lib/store/useCompareStore";
import { 
  Search, Filter, Star, MapPin, 
  ChevronLeft, ChevronRight, GitCompare, 
  RotateCcw, SlidersHorizontal 
} from "lucide-react";
import { formatCurrency, formatSalary } from "@/lib/utils";

function CollegesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // URL search parameter initialization
  const initialSearch = searchParams.get("search") || "";

  // State definitions
  const [search, setSearch] = React.useState(initialSearch);
  const [stream, setStream] = React.useState("");
  const [state, setState] = React.useState("");
  const [type, setType] = React.useState("");
  const [maxFees, setMaxFees] = React.useState<number>(6000000); // 60 Lakhs
  const [minRating, setMinRating] = React.useState<number>(0);
  const [sort, setSort] = React.useState("rating_desc");
  const [page, setPage] = React.useState(1);
  const [isFilterMobileOpen, setIsFilterMobileOpen] = React.useState(false);

  // Compare store hooks
  const { addCollege, removeCollege, isInCompare } = useCompareStore();

  // Reset page when filters change
  React.useEffect(() => {
    setPage(1);
  }, [search, stream, state, type, maxFees, minRating, sort]);

  // Sync state if search query in URL changes (e.g. from hero search)
  React.useEffect(() => {
    const urlSearch = searchParams.get("search");
    if (urlSearch !== null) {
      setSearch(urlSearch);
    }
  }, [searchParams]);

  // TanStack query to fetch colleges
  const fetchColleges = async () => {
    const queryParts = [
      `search=${encodeURIComponent(search)}`,
      `stream=${stream}`,
      `state=${state}`,
      `type=${type}`,
      `fees=${maxFees}`,
      `rating=${minRating}`,
      `sort=${sort}`,
      `page=${page}`,
      `limit=9`
    ];
    const res = await fetch(`/api/colleges?${queryParts.join("&")}`);
    if (!res.ok) throw new Error("Failed to load colleges");
    return res.json();
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["colleges", search, stream, state, type, maxFees, minRating, sort, page],
    queryFn: fetchColleges,
  });

  const handleResetFilters = () => {
    setSearch("");
    setStream("");
    setState("");
    setType("");
    setMaxFees(6000000);
    setMinRating(0);
    setSort("rating_desc");
    setPage(1);
  };

  const handleCompareToggle = (e: React.MouseEvent, collegeId: string) => {
    e.stopPropagation();
    if (isInCompare(collegeId)) {
      removeCollege(collegeId);
    } else {
      const added = addCollege(collegeId);
      if (!added) {
        alert("You can compare up to 3 colleges at a time.");
      }
    }
  };

  // State options matching seeded values
  const stateOptions = ["Maharashtra", "California", "Gujarat", "Delhi", "Tamil Nadu", "Rajasthan", "Massachusetts"];
  const streamOptions = [
    { label: "Engineering", value: "Engineering" },
    { label: "Management", value: "Management" },
    { label: "Medical", value: "Medical" }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Title */}
        <div className="mb-8">
          <span className="font-display text-[10px] tracking-[0.2em] text-primary uppercase block mb-1">Volume II • Directories</span>
          <h1 className="text-3xl font-heading font-medium text-foreground tracking-tight">Colleges Directory</h1>
          <p className="text-muted-foreground font-body italic text-sm mt-1">Discover, filter, and compare top colleges across courses and placements.</p>
        </div>

        {/* Layout: Sidebar + main list grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* 1. FILTER SIDEBAR (Desktop) */}
          <aside className="hidden lg:block space-y-6 sticky top-24 h-fit p-6 rounded border border-border bg-card shadow-premium corner-flourish">
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <span className="flex items-center space-x-2 font-display text-xs uppercase tracking-wider text-primary">
                <Filter className="h-4 w-4 text-primary" />
                <span>Filters</span>
              </span>
              <button 
                onClick={handleResetFilters}
                className="text-xs font-display uppercase tracking-widest text-primary hover:text-[#D4B872] flex items-center space-x-1 cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset All</span>
              </button>
            </div>

            {/* Stream Selector */}
            <div className="space-y-2">
              <label className="text-[10px] font-display font-semibold text-primary uppercase tracking-widest">Stream</label>
              <div className="flex flex-col space-y-2">
                {streamOptions.map((opt) => (
                  <label key={opt.value} className="flex items-center space-x-2 text-sm font-body text-muted-foreground cursor-pointer hover:text-foreground">
                    <input 
                      type="radio" 
                      name="stream" 
                      value={opt.value}
                      checked={stream === opt.value}
                      onChange={() => setStream(opt.value)}
                      className="rounded-sm border-border text-primary focus:ring-primary bg-background focus:ring-offset-0 cursor-pointer"
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Type Selector */}
            <div className="space-y-2 pt-2 border-t border-border/40">
              <label className="text-[10px] font-display font-semibold text-primary uppercase tracking-widest">College Type</label>
              <select 
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full h-10 rounded border border-border bg-[#1C1714] px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground font-body"
                aria-label="Filter by College Type"
                title="Filter by College Type"
              >
                <option value="">All Types</option>
                <option value="Public">Public</option>
                <option value="Private">Private</option>
              </select>
            </div>

            {/* State Selector */}
            <div className="space-y-2 pt-2 border-t border-border/40">
              <label className="text-[10px] font-display font-semibold text-primary uppercase tracking-widest">Location State</label>
              <select 
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full h-10 rounded border border-border bg-[#1C1714] px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground font-body"
                aria-label="Filter by Location State"
                title="Filter by Location State"
              >
                <option value="">All States</option>
                {stateOptions.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            {/* Fees Range Slider */}
            <div className="space-y-3 pt-2 border-t border-border/40">
              <div className="flex justify-between text-[10px] font-display font-semibold text-primary uppercase tracking-widest">
                <span>Max Annual Fees</span>
                <span className="text-foreground normal-case font-bold">{formatCurrency(maxFees)}</span>
              </div>
              <input 
                type="range"
                min={1500}
                max={6000000}
                step={50000}
                value={maxFees}
                onChange={(e) => setMaxFees(parseInt(e.target.value))}
                className="w-full accent-primary cursor-pointer bg-muted rounded appearance-none h-1.5 border border-border"
                aria-label="Filter by Maximum Annual Fees"
                title="Filter by Maximum Annual Fees"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground font-body italic">
                <span>₹1,500</span>
                <span>₹60 Lakh</span>
              </div>
            </div>

            {/* Minimum Rating Selection */}
            <div className="space-y-2 pt-2 border-t border-border/40">
              <label className="text-[10px] font-display font-semibold text-primary uppercase tracking-widest">Minimum Rating</label>
              <div className="flex items-center space-x-1.5">
                {[0, 4.0, 4.5, 4.8].map((rat) => (
                  <button
                    key={rat}
                    onClick={() => setMinRating(rat)}
                    className={`flex-grow h-8 text-xs font-display uppercase tracking-widest rounded border ${
                      minRating === rat 
                        ? "border-primary bg-primary/10 text-primary" 
                        : "border-border bg-background text-muted-foreground hover:text-foreground"
                    } transition-colors cursor-pointer`}
                  >
                    {rat === 0 ? "All" : `${rat}★`}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* 2. MAIN DIRECTORY LAYOUT */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Top Toolbar: Search + Sort controls */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              
              {/* Search Bar */}
              <div className="relative w-full md:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                <Input 
                  type="text"
                  placeholder="Search by name, course or keyword..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 font-body placeholder:italic"
                />
              </div>

              {/* Sorting & Filter toggle for mobile */}
              <div className="flex w-full md:w-auto items-center justify-between md:justify-end gap-3">
                <button
                  onClick={() => setIsFilterMobileOpen(!isFilterMobileOpen)}
                  className="lg:hidden flex items-center space-x-2 h-10 px-4 rounded border border-border bg-[#251E19] text-xs font-display uppercase tracking-wider text-muted-foreground hover:text-foreground"
                >
                  <SlidersHorizontal className="h-4 w-4 text-primary" />
                  <span>Filters</span>
                </button>

                <div className="flex items-center space-x-2 shrink-0">
                  <span className="text-xs text-muted-foreground font-display uppercase tracking-wider font-medium">Sort By:</span>
                  <select 
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="h-10 rounded border border-border bg-[#251E19] px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground font-body"
                    aria-label="Sort Colleges Directory"
                    title="Sort Colleges Directory"
                  >
                    <option value="rating_desc">Rating (High to Low)</option>
                    <option value="fees_asc">Fees (Low to High)</option>
                    <option value="fees_desc">Fees (High to Low)</option>
                    <option value="placement_desc">Avg Package (High to Low)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Mobile Filters Drawer Overlay */}
            {isFilterMobileOpen && (
              <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
                <div className="fixed inset-0 bg-black/60" onClick={() => setIsFilterMobileOpen(false)} />
                <div className="relative w-80 max-w-full bg-[#1C1714] p-6 h-full flex flex-col border-l border-border overflow-y-auto space-y-6 z-10 shadow-2xl">
                  <div className="flex justify-between items-center border-b border-border/40 pb-4">
                    <span className="font-display uppercase tracking-widest text-primary flex items-center space-x-2">
                      <Filter className="h-5 w-5" />
                      <span>Filters</span>
                    </span>
                    <button 
                      onClick={() => setIsFilterMobileOpen(false)}
                      className="text-xs font-display uppercase border border-border px-2 py-1 rounded text-muted-foreground cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                  
                  {/* Stream Mobile */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-display font-semibold text-primary uppercase tracking-widest">Stream</label>
                    <div className="flex flex-col space-y-2">
                      {streamOptions.map((opt) => (
                        <label key={opt.value} className="flex items-center space-x-2 text-sm font-body text-muted-foreground cursor-pointer">
                          <input 
                            type="radio" 
                            name="stream-mob" 
                            value={opt.value}
                            checked={stream === opt.value}
                            onChange={() => setStream(opt.value)}
                            className="rounded-sm border-border text-primary bg-[#1C1714]"
                          />
                          <span>{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Type Mobile */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-display font-semibold text-primary uppercase tracking-widest">Type</label>
                    <select 
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full h-10 rounded border border-border bg-[#251E19] px-3 text-sm focus:outline-none text-foreground font-body"
                      aria-label="Filter by College Type (Mobile)"
                      title="Filter by College Type (Mobile)"
                    >
                      <option value="">All Types</option>
                      <option value="Public">Public</option>
                      <option value="Private">Private</option>
                    </select>
                  </div>

                  {/* State Mobile */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-display font-semibold text-primary uppercase tracking-widest">State</label>
                    <select 
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full h-10 rounded border border-border bg-[#251E19] px-3 text-sm focus:outline-none text-foreground font-body"
                      aria-label="Filter by Location State (Mobile)"
                      title="Filter by Location State (Mobile)"
                    >
                      <option value="">All States</option>
                      {stateOptions.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>

                  {/* Fees Mobile */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-display font-semibold text-primary uppercase tracking-widest">
                      <span>Max Fees</span>
                      <span className="text-foreground font-bold">{formatCurrency(maxFees)}</span>
                    </div>
                    <input 
                      type="range"
                      min={1500}
                      max={6000000}
                      value={maxFees}
                      onChange={(e) => setMaxFees(parseInt(e.target.value))}
                      className="w-full accent-primary cursor-pointer"
                      aria-label="Filter by Maximum Annual Fees (Mobile)"
                      title="Filter by Maximum Annual Fees (Mobile)"
                    />
                  </div>

                  <Button onClick={handleResetFilters} variant="outline" className="w-full">
                    Reset All Filters
                  </Button>
                </div>
              </div>
            )}

            {/* 3. COLLEGE GRID LIST */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="border-border overflow-hidden h-[380px] flex flex-col rounded bg-card shadow-premium">
                    <Skeleton className="h-44 w-full" />
                    <div className="p-5 flex-grow space-y-3">
                      <Skeleton className="h-3.5 w-1/4" />
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <div className="border-t border-border/40 pt-4 grid grid-cols-2 gap-4 mt-4">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : error ? (
              <div className="rounded border border-destructive/20 bg-destructive/5 p-8 text-center">
                <p className="text-destructive font-medium font-body italic">Failed to retrieve colleges.</p>
                <Button onClick={() => refetch()} variant="outline" className="mt-4 border-destructive/20 text-foreground hover:bg-destructive/10">Retry Fetch</Button>
              </div>
            ) : data?.colleges.length === 0 ? (
              /* EMPTY STATE */
              <div className="rounded border border-dashed border-border bg-card/25 p-12 text-center flex flex-col items-center justify-center space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded border border-primary/20 bg-[#1C1714] text-primary">
                  <RotateCcw className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-heading font-medium text-foreground">No colleges match your filter query</h3>
                <p className="text-muted-foreground font-body italic text-sm max-w-sm">Try broadening your search terms, modifying your maximum fee ceiling, or resetting filters entirely.</p>
                <Button onClick={handleResetFilters} variant="secondary" className="mt-2">
                  Reset All Filters
                </Button>
              </div>
            ) : (
              /* ACTIVE COLLEGES GRID */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data?.colleges.map((college: any) => {
                  const inCompare = isInCompare(college.id);
                  const latestPlacement = college.placements?.[0];

                  return (
                    <Card
                      key={college.id}
                      onClick={() => router.push(`/colleges/${college.id}`)}
                      className="group flex flex-col border border-border bg-card overflow-hidden cursor-pointer shadow-premium hover:shadow-premium-hover transition-all duration-300 rounded corner-flourish"
                    >
                      {/* Card Image (Arch Top + Sepia transition) */}
                      <div className="relative h-44 w-full bg-muted overflow-hidden arch-top m-3 mb-0">
                        <img 
                          src={college.imageUrl || "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=400&fit=crop"} 
                          alt={college.name} 
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 sepia-effect"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1C1714]/85 to-transparent" />
                        
                        {/* Rating Badge */}
                        <div className="absolute top-3 left-3 flex items-center space-x-1 rounded border border-primary/30 bg-[#251E19]/90 backdrop-blur-md px-2 py-0.5 text-xs font-bold text-primary">
                          <Star className="h-3.5 w-3.5 fill-primary" />
                          <span>{college.rating.toFixed(1)}</span>
                        </div>

                        {/* Stream / Established Badge */}
                        <div className="absolute bottom-3 left-3 text-[10px] font-display text-muted-foreground font-medium uppercase tracking-wider">
                          Est. {college.established || "N/A"}
                        </div>
                      </div>

                      {/* Content Details */}
                      <div className="p-5 flex-grow flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] uppercase font-display font-semibold tracking-wider text-primary">{college.type}</span>
                            <span className="text-[10px] text-muted-foreground font-display uppercase tracking-widest">{college.courses?.length || 0} Courses</span>
                          </div>
                          
                          <h3 className="text-base font-heading font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1 leading-snug">
                            {college.name}
                          </h3>
                          
                          <p className="mt-1 flex items-center text-xs text-muted-foreground font-body italic">
                            <MapPin className="h-3.5 w-3.5 mr-1 text-primary shrink-0" />
                            <span>{college.location}, {college.state}</span>
                          </p>
                        </div>

                        {/* Placements & Action Section */}
                        <div className="mt-5 space-y-4 pt-4 border-t border-border">
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <div className="text-[9px] font-display uppercase tracking-wider text-muted-foreground">Average Fees</div>
                              <div className="font-semibold text-foreground mt-0.5">
                                {formatCurrency(college.averageFees)}
                                <span className="text-[9px] text-muted-foreground font-normal"> / yr</span>
                              </div>
                            </div>
                            <div>
                              <div className="text-[9px] font-display uppercase tracking-wider text-muted-foreground">Avg Placement</div>
                              <div className="font-semibold text-primary mt-0.5">
                                {latestPlacement ? formatSalary(latestPlacement.averagePackage) : "N/A"}
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              onClick={(e) => handleCompareToggle(e, college.id)}
                              variant={inCompare ? "premium" : "outline"}
                              size="sm"
                              className="flex-grow rounded h-10 text-xs flex items-center justify-center space-x-1.5 font-medium"
                            >
                              <GitCompare className="h-3.5 w-3.5" />
                              <span>{inCompare ? "Added to Compare" : "Compare"}</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* 4. PAGINATION CONTROLS */}
            {data?.pagination && data.pagination.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-border pt-6 font-display text-xs uppercase tracking-wider">
                <span className="text-muted-foreground">
                  Showing Page {data.pagination.page} of {data.pagination.totalPages} ({data.pagination.total} total)
                </span>
                
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1 || isLoading}
                    variant="outline"
                    size="sm"
                    className="h-10 px-4 rounded flex items-center space-x-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Previous</span>
                  </Button>
                  
                  <Button
                    onClick={() => setPage((p) => Math.min(data.pagination.totalPages, p + 1))}
                    disabled={page === data.pagination.totalPages || isLoading}
                    variant="outline"
                    size="sm"
                    className="h-10 px-4 rounded flex items-center space-x-1"
                  >
                    <span>Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}

export default function CollegesPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Navbar />
        <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-8 space-y-6">
          <Skeleton className="h-[250px] w-full rounded" />
        </main>
        <Footer />
      </div>
    }>
      <CollegesContent />
    </React.Suspense>
  );
}
