"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea"; // Refresh language server cache
import { 
  MessageSquare, Plus, Search, 
  Clock, MessageCircle, AlertCircle, X 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = ["All", "Admissions", "Placement", "Campus Life", "General"];

export default function DiscussionsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [activeCategory, setActiveCategory] = React.useState("All");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);

  // New thread form states
  const [newTitle, setNewTitle] = React.useState("");
  const [newCategory, setNewCategory] = React.useState("General");
  const [newContent, setNewContent] = React.useState("");
  const [formError, setFormError] = React.useState<string | null>(null);

  // Fetch discussions list
  const { data, isLoading, error } = useQuery({
    queryKey: ["discussions", activeCategory, searchQuery],
    queryFn: async () => {
      let url = "/api/discussions";
      const params = new URLSearchParams();
      if (activeCategory !== "All") params.append("category", activeCategory);
      if (searchQuery) params.append("search", searchQuery);
      
      const queryStr = params.toString();
      if (queryStr) url += `?${queryStr}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load discussions");
      return res.json();
    }
  });

  const discussions = data?.discussions || [];

  // Create Discussion Mutation
  const createDiscussionMutation = useMutation({
    mutationFn: async () => {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch("/api/discussions", {
        method: "POST",
        headers,
        body: JSON.stringify({
          title: newTitle,
          category: newCategory,
          content: newContent
        })
      });

      if (!res.ok) throw new Error("Failed to post discussion");
      return res.json();
    },
    onSuccess: () => {
      // Reset form states
      setNewTitle("");
      setNewCategory("General");
      setNewContent("");
      setIsCreateOpen(false);
      setFormError(null);
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["discussions"] });
    },
    onError: (err: any) => {
      setFormError(err.message || "An error occurred while posting.");
    }
  });

  const handleOpenCreateModal = () => {
    if (!user) {
      router.push("/auth/signin?redirect=/discussions");
      return;
    }
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      setFormError("Title and description content cannot be empty.");
      return;
    }
    createDiscussionMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <span className="font-display text-[10px] tracking-[0.2em] text-primary uppercase block mb-1">Volume V • Symposium</span>
            <h1 className="text-3xl font-heading font-medium text-foreground tracking-tight flex items-center gap-2">
              <MessageSquare className="h-7 w-7 text-primary" />
              <span>Discussion Board</span>
            </h1>
            <p className="text-muted-foreground font-body italic text-sm mt-1">
              Ask questions, share reviews, and join discussions with other academic scholars.
            </p>
          </div>
          
          <Button 
            onClick={handleOpenCreateModal} 
            variant="premium" 
            className="rounded flex items-center space-x-1.5 shadow-brass self-start sm:self-center font-semibold"
          >
            <Plus className="h-4 w-4 text-[#1C1714]" />
            <span>Start Thread</span>
          </Button>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8 pb-4 border-b border-border">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 text-xs font-display uppercase tracking-wider rounded border transition-all cursor-pointer ${
                  activeCategory === cat
                    ? "bg-primary border-primary text-[#1C1714] font-bold"
                    : "border-border bg-card/60 hover:bg-muted/40 text-muted-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
            <Input
              type="text"
              placeholder="Search symposium threads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 placeholder:italic placeholder:text-muted-foreground/35"
            />
          </div>
        </div>

        {/* Discussions List */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-28 w-full border border-border bg-card/45 rounded animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center border border-dashed border-destructive/20 bg-destructive/5 text-destructive rounded font-body italic flex items-center justify-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <span>Could not load discussions board. Please check your internet connection.</span>
          </div>
        ) : discussions.length === 0 ? (
          <div className="rounded border border-dashed border-border bg-card/25 p-16 text-center max-w-lg mx-auto space-y-4 flex flex-col items-center justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded border border-primary/20 bg-[#1C1714] text-primary">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-heading font-medium text-foreground">No discussions here yet</h3>
              <p className="text-muted-foreground font-body italic text-xs">
                {searchQuery || activeCategory !== "All"
                  ? "Try resetting your search query or filters to find other active boards."
                  : "Be the first to publish a topic of discussion! Click the Start Thread button above."}
              </p>
            </div>
            {(searchQuery || activeCategory !== "All") && (
              <Button 
                onClick={() => { setSearchQuery(""); setActiveCategory("All"); }} 
                variant="outline" 
                className="text-xs"
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {discussions.map((disc: any) => {
              const userName = disc.user?.name || "Anonymous Scholar";
              const userInitial = userName[0].toUpperCase();
              const repliesCount = disc.replies?.length || 0;
              const dateString = new Date(disc.createdAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric"
              });

              return (
                <div
                  key={disc.id}
                  onClick={() => router.push(`/discussions/${disc.id}`)}
                  className="group relative rounded border border-border bg-card hover:border-primary/50 p-5 shadow-premium cursor-pointer transition-all duration-300 flex flex-col gap-3 corner-flourish"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-block rounded bg-primary/10 border border-primary/20 px-2 py-0.5 text-[9px] font-display font-medium text-primary uppercase tracking-widest">
                      {disc.category}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-body italic flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{dateString}</span>
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-heading font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {disc.title}
                    </h3>
                    <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2 font-body italic">
                      {disc.content}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-border/40 pt-3 mt-1 text-xs">
                    <div className="flex items-center space-x-2.5">
                      <div className="flex h-6 w-6 items-center justify-center rounded bg-brass text-[#1C1714] text-[10px] font-bold font-display shadow-brass shrink-0">
                        {userInitial}
                      </div>
                      <span className="font-body text-muted-foreground font-medium truncate max-w-[150px]">
                        By {userName}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1 text-primary font-display text-[10px] uppercase font-bold tracking-wider group-hover:translate-x-0.5 transition-transform">
                      <MessageCircle className="h-4 w-4 mr-0.5" />
                      <span>{repliesCount} {repliesCount === 1 ? "Answer" : "Answers"}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </main>

      {/* Start Thread Dialog/Modal Overlay */}
      <AnimatePresence>
        {isCreateOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateOpen(false)}
              className="fixed inset-0 bg-[#0c0a09]/80 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50 p-6"
            >
              <Card className="border-border bg-[#15110E] shadow-premium rounded ornate-frame">
                <CardHeader className="relative pb-4">
                  <button
                    onClick={() => setIsCreateOpen(false)}
                    aria-label="Close dialog"
                    title="Close"
                    className="absolute top-4 right-4 p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <CardTitle className="text-xl font-heading font-medium text-foreground">Start Discussion Thread</CardTitle>
                  <CardDescription className="font-body italic text-xs">
                    Address academic topics, ask questions, or exchange placement notes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 font-body">
                  <form onSubmit={handleCreateSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-display uppercase tracking-wider text-muted-foreground font-semibold">Discussion Title</label>
                      <Input
                        type="text"
                        placeholder="e.g. Admission threshold cutoff trends at IIT Delhi B.Tech"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        required
                        className="placeholder:text-muted-foreground/35"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="category-select" className="text-[10px] font-display uppercase tracking-wider text-muted-foreground font-semibold">Select Category</label>
                      <select
                        id="category-select"
                        title="Select category"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="w-full h-10 px-3 py-1.5 rounded border border-border bg-card hover:bg-muted/30 focus:border-primary text-foreground text-sm font-body outline-none cursor-pointer"
                      >
                        {CATEGORIES.slice(1).map((cat) => (
                          <option key={cat} value={cat} className="bg-card">
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-display uppercase tracking-wider text-muted-foreground font-semibold">Brief Description / Body Content</label>
                      <Textarea
                        placeholder="Explain the context of your question or sharing topic..."
                        value={newContent}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewContent(e.target.value)}
                        required
                        rows={5}
                        className="placeholder:italic placeholder:text-muted-foreground/35 resize-none"
                      />
                    </div>

                    {formError && (
                      <div className="p-3 text-xs bg-rose-500/5 border border-rose-500/20 text-rose-400 italic rounded">
                        {formError}
                      </div>
                    )}

                    <div className="flex justify-end gap-2.5 pt-3 border-t border-border/40">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsCreateOpen(false)}
                        className="text-xs"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="premium"
                        disabled={createDiscussionMutation.isPending}
                        className="rounded font-semibold flex items-center space-x-1.5 shadow-brass text-xs h-10 px-4"
                      >
                        <span>Publish Topic</span>
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
