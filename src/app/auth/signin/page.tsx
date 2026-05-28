"use client";

import * as React from "react";
import { signIn } from "next-auth/react";
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
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
        callbackUrl,
      });

      if (res?.error) {
        setError("Invalid email or password credentials.");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
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
    <div className="relative min-h-screen bg-slate-950 flex items-center justify-center p-4 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <div className="flex flex-col items-center mb-6 space-y-2">
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white">
              <Compass className="h-5 w-5" />
            </div>
            <span className="font-bold text-white text-xl tracking-tight">CampusCompass</span>
          </Link>
          <p className="text-xs text-slate-400">Your College Discovery Navigator</p>
        </div>

        <Card className="border-border/60 bg-slate-900/40 backdrop-blur-md shadow-2xl">
          <CardHeader className="space-y-1.5 pb-5">
            <CardTitle className="text-xl font-bold text-white text-center">Sign In</CardTitle>
            <CardDescription className="text-center text-slate-400 text-xs">
              Access your shortlist dashboard and save colleges
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {error && (
              <div className="flex items-start space-x-2.5 rounded-lg border border-rose-500/20 bg-rose-500/5 p-3 text-xs text-rose-400">
                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs text-slate-400 font-medium">Password</label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10"
                  />
                </div>
              </div>

              <Button type="submit" variant="premium" className="w-full rounded-lg h-10 mt-2 font-semibold" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            {/* Quick Login Helper Panel */}
            <div className="border-t border-border/40 pt-4 mt-2">
              <div className="flex items-center space-x-1.5 mb-2.5 text-xs text-indigo-300 font-semibold uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Demo Sandbox Logins</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => fillQuickCredentials("alex@example.com", "password123")}
                  className="p-2 rounded-lg border border-border bg-slate-950 text-left hover:bg-indigo-500/5 transition-colors cursor-pointer"
                >
                  <div className="font-semibold text-white">Alex Johnson</div>
                  <div className="text-[10px] text-slate-500">alex@example.com</div>
                </button>
                <button
                  type="button"
                  onClick={() => fillQuickCredentials("priya@example.com", "student2026")}
                  className="p-2 rounded-lg border border-border bg-slate-950 text-left hover:bg-indigo-500/5 transition-colors cursor-pointer"
                >
                  <div className="font-semibold text-white">Priya Sharma</div>
                  <div className="text-[10px] text-slate-500">priya@example.com</div>
                </button>
              </div>
            </div>

          </CardContent>
          <CardFooter className="pt-2 border-t border-border/20 justify-center">
            <p className="text-xs text-slate-500">
              Don't have an account?{" "}
              <Link href="/auth/signup" className="text-indigo-400 hover:text-indigo-300 font-semibold">
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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
      </div>
    }>
      <SignInContent />
    </React.Suspense>
  );
}
