"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useCompareStore } from "@/lib/store/useCompareStore";
import { 
  Sparkles, Award, Star, MapPin, 
  ChevronRight, HelpCircle, GitCompare, CheckCircle2 
} from "lucide-react";
import { motion } from "framer-motion";
import { formatCurrency, formatSalary } from "@/lib/utils";

interface MatchResult {
  college: any;
  probability: "Safe" | "Target" | "Reach";
  probabilityScore: number; // 0 to 100
  cutoffRank: number;
  matchedStream: string;
}

const EXAMS = [
  { id: "jee", name: "JEE Main", stream: "Engineering", placeholder: "e.g. 5000", maxRank: 300000 },
  { id: "cat", name: "CAT", stream: "Management", placeholder: "e.g. 1500", maxRank: 150000 },
  { id: "neet", name: "NEET", stream: "Medical", placeholder: "e.g. 3500", maxRank: 200000 },
  { id: "sat", name: "SAT", stream: "Arts", placeholder: "e.g. 800", maxRank: 50000 },
  { id: "gmat", name: "GMAT", stream: "Management", placeholder: "e.g. 1200", maxRank: 100000 }
];

export default function PredictorPage() {
  const router = useRouter();
  const { addCollege, isInCompare } = useCompareStore();

  const [selectedExam, setSelectedExam] = React.useState(EXAMS[0].id);
  const [inputMode, setInputMode] = React.useState<"rank" | "score">("rank");
  const [rankInput, setRankInput] = React.useState("");
  const [results, setResults] = React.useState<MatchResult[]>([]);
  const [hasPredicted, setHasPredicted] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Fetch all colleges with courses to perform client-side matching
  const { data, isLoading } = useQuery({
    queryKey: ["colleges-predictor"],
    queryFn: async () => {
      const res = await fetch("/api/colleges?limit=100");
      if (!res.ok) throw new Error("Failed to load colleges");
      return res.json();
    }
  });

  const colleges = data?.colleges || [];

  const handlePredict = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const exam = EXAMS.find(ex => ex.id === selectedExam);
    if (!exam) return;

    const rawVal = parseFloat(rankInput);
    if (isNaN(rawVal) || rawVal <= 0) {
      setError(inputMode === "rank" ? "Please enter a valid rank greater than 0." : "Please enter a valid score/percentile.");
      return;
    }

    let calculatedRank = 0;

    if (inputMode === "rank") {
      if (rawVal > exam.maxRank) {
        setError(`Rank is too high. Max typical cutoff rank for ${exam.name} is ${exam.maxRank.toLocaleString()}.`);
        return;
      }
      calculatedRank = Math.round(rawVal);
    } else {
      // Score / Percentile mode conversion
      if (exam.id === "sat") {
        if (rawVal < 400 || rawVal > 1600) {
          setError("SAT Score must be between 400 and 1600.");
          return;
        }
        // Map SAT Score (400 - 1600) to typical rank (1 - 50000)
        const pct = (rawVal - 400) / 1200;
        calculatedRank = Math.max(1, Math.round((1 - pct) * exam.maxRank));
      } else if (exam.id === "gmat") {
        if (rawVal < 200 || rawVal > 800) {
          setError("GMAT Score must be between 200 and 800.");
          return;
        }
        // Map GMAT Score (200 - 800) to typical rank (1 - 100000)
        const pct = (rawVal - 200) / 600;
        calculatedRank = Math.max(1, Math.round((1 - pct) * exam.maxRank));
      } else {
        // JEE, CAT, NEET are percentiles
        if (rawVal < 1 || rawVal > 100) {
          setError("Percentile must be between 1.0 and 100.0.");
          return;
        }
        const candidates = exam.id === "jee" ? 1200000 : exam.id === "neet" ? 2000000 : 250000;
        calculatedRank = Math.max(1, Math.round(((100 - rawVal) * candidates) / 100));
      }
    }

    // Matcher logic
    const matched: MatchResult[] = [];

    colleges.forEach((col: any) => {
      // Find courses matching the stream of the exam
      const hasMatchingCourse = col.courses?.some(
        (course: any) => course.stream.toLowerCase() === exam.stream.toLowerCase()
      );

      if (hasMatchingCourse || exam.id === "sat") { // SAT is undergraduate general, matches most
        // Determine rank cutoff based on college rating
        // Higher rating = lower (better) cutoff rank threshold
        let baseCutoff = 10000;
        if (col.rating >= 4.7) {
          baseCutoff = 1200;
        } else if (col.rating >= 4.4) {
          baseCutoff = 4500;
        } else if (col.rating >= 4.1) {
          baseCutoff = 15000;
        } else if (col.rating >= 3.8) {
          baseCutoff = 45000;
        } else if (col.rating >= 3.5) {
          baseCutoff = 90000;
        } else {
          baseCutoff = 180000;
        }

        // Adjust baseCutoff based on exam weights (e.g. CAT/GMAT ranks are typically lower range)
        if (exam.id === "cat" || exam.id === "gmat" || exam.id === "sat") {
          baseCutoff = Math.round(baseCutoff / 3);
        }

        // Calculate probability
        let probability: "Safe" | "Target" | "Reach";
        let probabilityScore = 0;

        if (calculatedRank <= baseCutoff * 0.7) {
          probability = "Safe";
          probabilityScore = Math.min(99, Math.round(95 + (1 - calculatedRank / (baseCutoff * 0.7)) * 4));
        } else if (calculatedRank <= baseCutoff) {
          probability = "Target";
          probabilityScore = Math.round(75 + (1 - (calculatedRank - baseCutoff * 0.7) / (baseCutoff * 0.3)) * 19);
        } else if (calculatedRank <= baseCutoff * 1.4) {
          probability = "Reach";
          probabilityScore = Math.round(35 + (1 - (calculatedRank - baseCutoff) / (baseCutoff * 0.4)) * 39);
        } else {
          // Unlikely to match
          return;
        }

        matched.push({
          college: col,
          probability,
          probabilityScore,
          cutoffRank: baseCutoff,
          matchedStream: exam.stream
        });
      }
    });

    // Sort matching colleges by probability score desc, then by college rating desc
    matched.sort((a, b) => {
      if (a.probability !== b.probability) {
        const order = { Safe: 3, Target: 2, Reach: 1 };
        return order[b.probability] - order[a.probability];
      }
      return b.college.rating - a.college.rating;
    });

    setResults(matched);
    setHasPredicted(true);
  };

  const handleAddToCompare = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const added = addCollege(id);
    if (!added && !isInCompare(id)) {
      alert("You can compare up to 3 colleges at a time.");
    }
  };

  const currentExamObj = EXAMS.find(ex => ex.id === selectedExam);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <span className="font-display text-[10px] tracking-[0.2em] text-primary uppercase block mb-1">Volume IV • Predictions</span>
            <h1 className="text-3xl font-heading font-medium text-foreground tracking-tight flex items-center gap-2">
              <Award className="h-7 w-7 text-primary" />
              <span>Oraculum Matcher</span>
            </h1>
            <p className="text-muted-foreground font-body italic text-sm mt-1">
              Find and predict college admissions based on your competitive exam rank or percentiles.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Side */}
          <div className="lg:col-span-1">
            <Card className="border-border bg-card/60 backdrop-blur-md shadow-premium rounded ornate-frame">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-heading font-medium text-foreground">Admission Parameters</CardTitle>
                <CardDescription className="font-body italic text-xs">
                  Enter your performance details to forecast college matching chances
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 font-body">
                <form onSubmit={handlePredict} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-display uppercase tracking-wider text-muted-foreground font-semibold">Select Examination</label>
                    <div className="flex flex-wrap gap-2">
                      {EXAMS.map((exam) => (
                        <button
                          key={exam.id}
                          type="button"
                          onClick={() => {
                            setSelectedExam(exam.id);
                            setError(null);
                            setHasPredicted(false);
                          }}
                          className={`px-3 py-2 text-xs font-display uppercase tracking-wider rounded border text-center transition-colors cursor-pointer flex-grow min-w-[70px] ${
                            selectedExam === exam.id
                              ? "bg-primary border-primary text-[#1C1714] font-bold"
                              : "border-border bg-card hover:bg-muted/40 text-muted-foreground"
                          }`}
                        >
                          {exam.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-display uppercase tracking-wider text-muted-foreground font-semibold">Select Input Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setInputMode("rank");
                          setError(null);
                        }}
                        className={`px-3 py-1.5 text-xs font-display uppercase tracking-wider rounded border text-center transition-colors cursor-pointer ${
                          inputMode === "rank"
                            ? "bg-primary/20 border-primary text-primary font-bold shadow-sm"
                            : "border-border bg-card hover:bg-muted/40 text-muted-foreground"
                        }`}
                      >
                        Rank
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setInputMode("score");
                          setError(null);
                        }}
                        className={`px-3 py-1.5 text-xs font-display uppercase tracking-wider rounded border text-center transition-colors cursor-pointer ${
                          inputMode === "score"
                            ? "bg-primary/20 border-primary text-primary font-bold shadow-sm"
                            : "border-border bg-card hover:bg-muted/40 text-muted-foreground"
                        }`}
                      >
                        Score / Percentile
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-display uppercase tracking-wider text-muted-foreground font-semibold">
                        {inputMode === "rank" 
                          ? "Enter Rank" 
                          : selectedExam === "sat" || selectedExam === "gmat" 
                            ? "Enter Score" 
                            : "Enter Percentile"
                        }
                      </label>
                      <span className="text-[9px] text-muted-foreground font-body italic">
                        Stream: {currentExamObj?.stream}
                      </span>
                    </div>
                    <div className="relative">
                      <Input
                        type="number"
                        step={inputMode === "score" && selectedExam !== "sat" && selectedExam !== "gmat" ? "0.01" : "1"}
                        placeholder={
                          inputMode === "rank" 
                            ? currentExamObj?.placeholder 
                            : selectedExam === "sat" 
                              ? "e.g. 1480 (400-1600)" 
                              : selectedExam === "gmat" 
                                ? "e.g. 710 (200-800)" 
                                : "e.g. 98.5 (1.0-100.0)"
                        }
                        value={rankInput}
                        onChange={(e) => setRankInput(e.target.value)}
                        required
                        min={inputMode === "score" && selectedExam === "sat" ? "400" : inputMode === "score" && selectedExam === "gmat" ? "200" : "1"}
                        max={inputMode === "score" && selectedExam === "sat" ? "1600" : inputMode === "score" && selectedExam === "gmat" ? "800" : inputMode === "score" ? "100" : undefined}
                        className="placeholder:italic placeholder:text-muted-foreground/35"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 text-xs bg-rose-500/5 border border-rose-500/20 text-rose-400 italic rounded">
                      {error}
                    </div>
                  )}

                  <Button type="submit" variant="premium" className="w-full rounded h-11 font-semibold shadow-brass" disabled={isLoading}>
                    <Sparkles className="h-4 w-4 mr-1.5 text-[#1C1714]" />
                    <span>Predict My Colleges</span>
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="pt-2 border-t border-border/40 text-[10px] text-muted-foreground font-body italic justify-center">
                Predictions are calculated based on standard academic cutoff ratios.
              </CardFooter>
            </Card>
          </div>

          {/* Results Side */}
          <div className="lg:col-span-2 space-y-6">
            {!hasPredicted ? (
              <div className="rounded border border-dashed border-border bg-card/25 p-16 text-center space-y-4 flex flex-col items-center justify-center min-h-[350px]">
                <div className="flex h-14 w-14 items-center justify-center rounded border border-primary/20 bg-[#1C1714] text-primary shadow-premium">
                  <Sparkles className="h-7 w-7" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-heading font-medium text-foreground">Oraculum Predictions</h3>
                  <p className="text-muted-foreground font-body italic text-sm max-w-sm mx-auto">
                    Fill in your examination and rank parameters on the left to see which institutions you align with.
                  </p>
                </div>
              </div>
            ) : results.length === 0 ? (
              <div className="rounded border border-dashed border-border bg-card/25 p-16 text-center space-y-4 flex flex-col items-center justify-center min-h-[350px]">
                <div className="flex h-14 w-14 items-center justify-center rounded border border-primary/20 bg-[#1C1714] text-primary">
                  <HelpCircle className="h-7 w-7" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-heading font-medium text-foreground">No matches found</h3>
                  <p className="text-muted-foreground font-body italic text-sm max-w-sm mx-auto">
                    We couldn't find matches within standard cutoff probability thresholds for rank {parseInt(rankInput).toLocaleString()}. Try a lower rank parameter or another exam type.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h2 className="text-lg font-heading font-medium text-foreground">
                    Matches Found ({results.length})
                  </h2>
                  <span className="text-xs text-muted-foreground font-body italic">
                    Sorted by admission probability
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {results.map(({ college, probability, probabilityScore, matchedStream }) => {
                    const placement = college.placements?.[0];
                    
                    let probabilityBadgeColor = "";
                    let probabilityTextColor = "";
                    
                    if (probability === "Safe") {
                      probabilityBadgeColor = "bg-emerald-500/10 border-emerald-500/25";
                      probabilityTextColor = "text-emerald-400";
                    } else if (probability === "Target") {
                      probabilityBadgeColor = "bg-primary/10 border-primary/25";
                      probabilityTextColor = "text-primary";
                    } else {
                      probabilityBadgeColor = "bg-amber-500/10 border-amber-500/25";
                      probabilityTextColor = "text-amber-400";
                    }

                    return (
                      <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={college.id}
                        onClick={() => router.push(`/colleges/${college.id}`)}
                        className="group relative rounded border border-border bg-card hover:border-primary/50 overflow-hidden shadow-premium cursor-pointer transition-all duration-300 flex flex-col md:flex-row"
                      >
                        {/* Probability color block side indicator */}
                        <div className={`w-1.5 shrink-0 ${
                          probability === "Safe" ? "bg-emerald-600" : probability === "Target" ? "bg-primary" : "bg-amber-600"
                        }`} />

                        <div className="p-6 flex-grow flex flex-col justify-between">
                          <div className="space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center space-x-2">
                                <span className="inline-block rounded bg-muted border border-border px-2 py-0.5 text-[9px] font-display font-medium text-muted-foreground uppercase tracking-widest">
                                  {college.type}
                                </span>
                                <span className="inline-block rounded bg-primary/10 border border-primary/20 px-2 py-0.5 text-[9px] font-display font-medium text-primary uppercase tracking-widest">
                                  {matchedStream}
                                </span>
                              </div>

                              <div className={`flex items-center space-x-1.5 rounded border px-2.5 py-0.5 text-[10px] font-display font-semibold tracking-wider uppercase ${probabilityBadgeColor} ${probabilityTextColor}`}>
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span>{probability} • {probabilityScore}%</span>
                              </div>
                            </div>

                            <div>
                              <h3 className="text-lg font-heading font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
                                {college.name}
                              </h3>
                              <p className="mt-1 flex items-center text-xs text-muted-foreground font-body italic">
                                <MapPin className="h-3.5 w-3.5 mr-1 text-primary shrink-0" />
                                <span>{college.location}, {college.state}</span>
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs pt-4 mt-4 border-t border-border">
                            <div>
                              <div className="text-[9px] font-display text-muted-foreground uppercase tracking-wider">Average Fees</div>
                              <div className="font-semibold text-foreground mt-0.5 font-body">{formatCurrency(college.averageFees)}/yr</div>
                            </div>
                            <div>
                              <div className="text-[9px] font-display text-muted-foreground uppercase tracking-wider">Avg Placement Package</div>
                              <div className="font-semibold text-primary mt-0.5 font-heading">
                                {placement ? formatSalary(placement.averagePackage) : "N/A"}
                              </div>
                            </div>
                            <div className="hidden sm:block">
                              <div className="text-[9px] font-display text-muted-foreground uppercase tracking-wider">Rating & Reviews</div>
                              <div className="flex items-center mt-0.5 text-primary">
                                <Star className="h-3.5 w-3.5 fill-primary text-primary mr-1" />
                                <span className="font-semibold text-foreground">{college.rating.toFixed(2)} ★</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Action buttons on the side/bottom */}
                        <div className="bg-[#1C1714] md:border-l border-t md:border-t-0 border-border p-4 md:w-48 flex md:flex-col items-stretch justify-center gap-2 shrink-0">
                          <Button
                            onClick={() => router.push(`/colleges/${college.id}`)}
                            variant="outline"
                            size="sm"
                            className="w-full text-xs font-display uppercase tracking-wider h-10"
                          >
                            <span>Details</span>
                            <ChevronRight className="h-3.5 w-3.5 ml-1" />
                          </Button>
                          <Button
                            onClick={(e) => handleAddToCompare(e, college.id)}
                            variant={isInCompare(college.id) ? "outline" : "premium"}
                            size="sm"
                            disabled={isInCompare(college.id)}
                            className="w-full text-xs font-semibold h-10 flex items-center justify-center gap-1.5 shadow-brass"
                          >
                            <GitCompare className="h-3.5 w-3.5" />
                            <span>{isInCompare(college.id) ? "Compared" : "Add Compare"}</span>
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
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
