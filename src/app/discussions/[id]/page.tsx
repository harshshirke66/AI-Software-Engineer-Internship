"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";
import { 
  ArrowLeft, Clock, 
  MessageCircle, AlertCircle, Sparkles, LogIn 
} from "lucide-react";
import { motion } from "framer-motion";

export default function DiscussionDetailPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [newReplyContent, setNewReplyContent] = React.useState("");
  const [formError, setFormError] = React.useState<string | null>(null);

  // Fetch thread details & replies
  const { data, isLoading, error } = useQuery({
    queryKey: ["discussion-detail", id],
    queryFn: async () => {
      const res = await fetch(`/api/discussions/${id}/replies`);
      if (!res.ok) throw new Error("Failed to load discussion details");
      return res.json();
    },
    enabled: !!id,
  });

  const discussion = data?.discussion;
  const replies = discussion?.replies || [];

  // Create Reply Mutation
  const createReplyMutation = useMutation({
    mutationFn: async () => {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`/api/discussions/${id}/replies`, {
        method: "POST",
        headers,
        body: JSON.stringify({ content: newReplyContent })
      });

      if (!res.ok) throw new Error("Failed to submit reply");
      return res.json();
    },
    onSuccess: () => {
      setNewReplyContent("");
      setFormError(null);
      queryClient.invalidateQueries({ queryKey: ["discussion-detail", id] });
    },
    onError: (err: any) => {
      setFormError(err.message || "An error occurred while posting your reply.");
    }
  });

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReplyContent.trim()) {
      setFormError("Reply content cannot be empty.");
      return;
    }
    createReplyMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Back navigation */}
        <button
          onClick={() => router.push("/discussions")}
          className="flex items-center gap-1.5 text-xs font-display uppercase tracking-wider text-muted-foreground hover:text-primary mb-6 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 text-primary" />
          <span>Back to symposium</span>
        </button>

        {isLoading ? (
          <div className="space-y-6">
            <div className="h-48 w-full border border-border bg-card/45 rounded animate-pulse" />
            <div className="h-28 w-full border border-border bg-card/45 rounded animate-pulse" />
          </div>
        ) : error || !discussion ? (
          <div className="p-8 text-center border border-dashed border-destructive/20 bg-destructive/5 text-destructive rounded font-body italic flex items-center justify-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <span>Discussion thread could not be loaded. It may have been deleted.</span>
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* 1. ORIGINAL TOPIC THREAD CARD */}
            <Card className="border-border bg-card/60 backdrop-blur-sm shadow-premium rounded ornate-frame p-6 sm:p-8">
              <div className="flex items-center justify-between gap-2 mb-4 border-b border-border/40 pb-3">
                <span className="inline-block rounded bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[9px] font-display font-medium text-primary uppercase tracking-widest">
                  {discussion.category}
                </span>
                <span className="text-[10px] text-muted-foreground font-body italic flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>
                    {new Date(discussion.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </span>
                </span>
              </div>

              <div className="space-y-4">
                <h1 className="text-xl sm:text-2xl font-heading font-medium text-foreground tracking-tight">
                  {discussion.title}
                </h1>
                
                <p className="text-sm text-foreground/90 font-body leading-relaxed whitespace-pre-wrap italic pl-4 border-l border-primary/35">
                  {discussion.content}
                </p>

                <div className="flex items-center space-x-2.5 pt-3 text-xs">
                  <div className="flex h-7 w-7 items-center justify-center rounded bg-brass text-[#1C1714] text-xs font-bold font-display shadow-brass shrink-0">
                    {(discussion.user?.name || "Anonymous Scholar")[0].toUpperCase()}
                  </div>
                  <div className="font-body text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      {discussion.user?.name || "Anonymous Scholar"}
                    </span>
                    <span className="mx-1.5">•</span>
                    <span>Thread Creator</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* 2. REPLIES / ANSWERS SECTION */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 border-b border-border pb-2">
                <MessageCircle className="h-5 w-5 text-primary" />
                <h2 className="text-base font-heading font-medium text-foreground tracking-tight">
                  Scholarly Answers ({replies.length})
                </h2>
              </div>

              {replies.length === 0 ? (
                /* Empty state for replies */
                <div className="rounded border border-dashed border-border bg-card/25 p-12 text-center space-y-3 flex flex-col items-center justify-center">
                  <span className="text-xs text-muted-foreground font-body italic">
                    No responses published in this symposium yet. Be the first to add your answer below!
                  </span>
                </div>
              ) : (
                <div className="space-y-4">
                  {replies.map((reply: any) => {
                    const rAuthor = reply.user?.name || "Anonymous Scholar";
                    
                    return (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={reply.id}
                        className="rounded border border-border/80 bg-card/30 p-5 shadow-premium flex gap-4"
                      >
                        <div className="flex h-7 w-7 items-center justify-center rounded bg-brass text-[#1C1714] text-xs font-bold font-display shadow-brass shrink-0">
                          {rAuthor[0].toUpperCase()}
                        </div>

                        <div className="flex-grow space-y-1.5 font-body">
                          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                            <span className="font-semibold text-foreground">{rAuthor}</span>
                            <span className="italic">
                              {new Date(reply.createdAt).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </span>
                          </div>
                          <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                            {reply.content}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3. POST A REPLY FORM */}
            <div className="pt-4">
              {user ? (
                <Card className="border-border bg-card/45 backdrop-blur-sm rounded ornate-frame p-6">
                  <h3 className="text-sm font-heading font-medium text-foreground mb-4">Post Your Answer</h3>
                  
                  <form onSubmit={handleReplySubmit} className="space-y-4">
                    <Textarea
                      placeholder="Write your answer with scholarly detail..."
                      value={newReplyContent}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewReplyContent(e.target.value)}
                      required
                      rows={4}
                      className="placeholder:italic placeholder:text-muted-foreground/35 resize-none font-body text-sm"
                    />

                    {formError && (
                      <div className="p-3 text-xs bg-rose-500/5 border border-rose-500/20 text-rose-400 italic rounded">
                        {formError}
                      </div>
                    )}

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        variant="premium"
                        disabled={createReplyMutation.isPending}
                        className="rounded font-semibold flex items-center space-x-1.5 shadow-brass text-xs h-10 px-4"
                      >
                        <Sparkles className="h-4 w-4 text-[#1C1714]" />
                        <span>Submit Answer</span>
                      </Button>
                    </div>
                  </form>
                </Card>
              ) : (
                /* Prompt to Login */
                <div className="rounded border border-border bg-[#1C1714] p-6 text-center space-y-4 flex flex-col items-center justify-center shadow-premium">
                  <p className="text-xs text-muted-foreground font-body italic">
                    You must be signed in to post an answer or participate in this academic forum.
                  </p>
                  <Button
                    onClick={() => router.push(`/auth/signin?redirect=/discussions/${id}`)}
                    variant="premium"
                    className="rounded text-xs font-semibold flex items-center space-x-1.5"
                  >
                    <LogIn className="h-4 w-4 text-[#1C1714]" />
                    <span>Sign In to Answer</span>
                  </Button>
                </div>
              )}
            </div>

          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
