"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Compass, User, Mail, Lock, ShieldAlert, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function SignUpPage() {
  const router = useRouter();

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Form validations
    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill out all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
      } else {
        setSuccess(true);
        // Clear fields
        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        
        // Wait a second and redirect to sign in page
        setTimeout(() => {
          router.push("/auth/signin");
        }, 1500);
      }
    } catch (err) {
      setError("Failed to register. Please check your internet connection.");
    } finally {
      setLoading(false);
    }
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
            <CardTitle className="text-xl font-bold text-white text-center">Create an Account</CardTitle>
            <CardDescription className="text-center text-slate-400 text-xs">
              Start shortlisting your favorite colleges today
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {success ? (
              <div className="flex items-start space-x-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-emerald-400">
                <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold">Registration Successful!</h4>
                  <p className="text-xs text-slate-400 mt-1">Redirecting you to the sign-in portal...</p>
                </div>
              </div>
            ) : null}

            {error && (
              <div className="flex items-start space-x-2.5 rounded-lg border border-rose-500/20 bg-rose-500/5 p-3 text-xs text-rose-400">
                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {!success && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-medium">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="pl-10"
                    />
                  </div>
                </div>

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
                  <label className="text-xs text-slate-400 font-medium">Password</label>
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

                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-medium">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="pl-10"
                    />
                  </div>
                </div>

                <Button type="submit" variant="premium" className="w-full rounded-lg h-10 mt-2 font-semibold" disabled={loading}>
                  {loading ? "Registering..." : "Create Account"}
                </Button>
              </form>
            )}

          </CardContent>
          <CardFooter className="pt-2 border-t border-border/20 justify-center">
            <p className="text-xs text-slate-500">
              Already have an account?{" "}
              <Link href="/auth/signin" className="text-indigo-400 hover:text-indigo-300 font-semibold">
                Sign In
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
