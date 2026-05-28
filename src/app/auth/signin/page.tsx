"use client";

import * as React from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Compass, Mail, Lock, ShieldAlert, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setError(null);
    setLoading(true);

    try {
      let { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // Auto-provision demo accounts in the local Supabase container if missing
      if (signInError && (email === "alex@example.com" || email === "priya@example.com")) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: email === "alex@example.com" ? "Alex Johnson" : "Priya Sharma",
            }
          }
        });
        if (!signUpError) {
          const res = await supabase.auth.signInWithPassword({ email, password });
          signInError = res.error;
        }
      }

      if (signInError) {
        setError(signInError.message || "Invalid email or password credentials.");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fillQuickCredentials = (userEmail: string, pass: string) => {
    setEmail(userEmail);
    setPassword(pass);
  };

  return (
    <div className="relative min-h-screen bg-background flex items-center justify-center p-4 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <div className="flex flex-col items-center mb-6 space-y-2">
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded border border-[#C9A962]/40 bg-[#251E19] text-primary shadow-brass">
              <Compass className="h-5 w-5" />
            </div>
            <span className="font-display uppercase tracking-widest text-primary text-lg font-bold">CampusCompass</span>
          </Link>
          <p className="text-xs text-muted-foreground font-body italic">Your College Discovery Navigator</p>
        </div>

        <Card className="border-border bg-card/60 backdrop-blur-md shadow-premium rounded ornate-frame">
          <CardHeader className="space-y-1.5 pb-5">
            <CardTitle className="text-xl font-heading font-medium text-foreground text-center">Sign In</CardTitle>
            <CardDescription className="text-center text-muted-foreground font-body italic text-xs">
              Access your shortlist dashboard and save colleges
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {error && (
              <div className="flex items-start space-x-2.5 rounded border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive font-body italic">
                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 font-body">
              <div className="space-y-1.5">
                <label className="text-[10px] font-display uppercase tracking-wider text-muted-foreground font-semibold">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 placeholder:italic placeholder:text-muted-foreground/35"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-display uppercase tracking-wider text-muted-foreground font-semibold">Password</label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 placeholder:text-muted-foreground/35"
                  />
                </div>
              </div>

              <Button type="submit" variant="premium" className="w-full rounded h-12 mt-2 font-semibold" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            {/* Quick Login Helper Panel */}
            <div className="border-t border-border pt-4 mt-2">
              <div className="flex items-center space-x-1.5 mb-2.5 text-[9px] font-display text-primary font-semibold uppercase tracking-widest">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Demo Sandbox Logins</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => fillQuickCredentials("alex@example.com", "password123")}
                  className="p-2 rounded border border-border bg-[#1C1714] text-left hover:bg-primary/5 transition-colors cursor-pointer"
                >
                  <div className="font-heading font-medium text-foreground text-sm">Alex Johnson</div>
                  <div className="text-[10px] text-muted-foreground font-body italic">alex@example.com</div>
                </button>
                <button
                  type="button"
                  onClick={() => fillQuickCredentials("priya@example.com", "student2026")}
                  className="p-2 rounded border border-border bg-[#1C1714] text-left hover:bg-primary/5 transition-colors cursor-pointer"
                >
                  <div className="font-heading font-medium text-foreground text-sm">Priya Sharma</div>
                  <div className="text-[10px] text-muted-foreground font-body italic">priya@example.com</div>
                </button>
              </div>
            </div>

          </CardContent>
          <CardFooter className="pt-2 border-t border-border justify-center font-display text-xs uppercase tracking-wider">
            <p className="text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/auth/signup" className="text-primary hover:text-[#D4B872] font-semibold">
                Sign Up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="h-8 w-8 animate-pulse rounded bg-muted" />
      </div>
    }>
      <SignInContent />
    </React.Suspense>
  );
}
