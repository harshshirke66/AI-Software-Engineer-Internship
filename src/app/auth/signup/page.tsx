"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
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
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message || "Something went wrong. Please try again.");
      } else {
        // Automatically sign in the user using the credentials they just created
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          // If auto sign-in fails (e.g. email confirmation required, though typically disabled),
          // fallback to telling the user to check their email/sign in manually.
          setError("Account created, but auto-login failed: " + signInError.message);
          setTimeout(() => {
            router.push("/auth/signin");
          }, 3000);
        } else {
          setSuccess(true);
          // Clear fields
          setName("");
          setEmail("");
          setPassword("");
          setConfirmPassword("");
          
          // Wait a second and redirect to dashboard page
          setTimeout(() => {
            router.push("/dashboard");
          }, 1500);
        }
      }
    } catch {
      setError("Failed to register. Please check your internet connection.");
    } finally {
      setLoading(false);
    }
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
            <CardTitle className="text-xl font-heading font-medium text-foreground text-center">Create an Account</CardTitle>
            <CardDescription className="text-center text-muted-foreground font-body italic text-xs">
              Start shortlisting your favorite colleges today
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {success ? (
              <div className="flex items-start space-x-2.5 rounded border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-emerald-400 font-body italic">
                <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-foreground not-italic">Registration Successful!</h4>
                  <p className="text-xs text-muted-foreground mt-1">Logging you in and redirecting to dashboard...</p>
                </div>
              </div>
            ) : null}

            {error && (
              <div className="flex items-start space-x-2.5 rounded border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive font-body italic">
                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {!success && (
              <form onSubmit={handleSubmit} className="space-y-4 font-body">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-display uppercase tracking-wider text-muted-foreground font-semibold">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                    <Input
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="pl-10 placeholder:text-muted-foreground/35"
                    />
                  </div>
                </div>

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
                  <label className="text-[10px] font-display uppercase tracking-wider text-muted-foreground font-semibold">Password</label>
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

                <div className="space-y-1.5">
                  <label className="text-[10px] font-display uppercase tracking-wider text-muted-foreground font-semibold">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="pl-10 placeholder:text-muted-foreground/35"
                    />
                  </div>
                </div>

                <Button type="submit" variant="premium" className="w-full rounded h-12 mt-2 font-semibold" disabled={loading}>
                  {loading ? "Registering..." : "Create Account"}
                </Button>
              </form>
            )}

          </CardContent>
          <CardFooter className="pt-2 border-t border-border justify-center font-display text-xs uppercase tracking-wider">
            <p className="text-muted-foreground">
              Already have an account?{" "}
              <Link href="/auth/signin" className="text-primary hover:text-[#D4B872] font-semibold">
                Sign In
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
