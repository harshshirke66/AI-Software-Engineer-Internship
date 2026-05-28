"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useCompareStore } from "@/lib/store/useCompareStore";
import { Button } from "@/components/ui/Button";
import { Compass, GitCompare, Bookmark, LogOut, Menu, X, Sparkles, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, signOut } = useAuth();
  const compareIds = useCompareStore((state) => state.collegeIds);
  const [isOpen, setIsOpen] = React.useState(false);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  const navLinks = [
    { href: "/colleges", label: "Colleges", icon: Compass },
    { href: "/predictor", label: "Predictor", icon: Sparkles },
    { href: "/discussions", label: "Discussions", icon: MessageSquare },
    { href: "/compare", label: "Compare", icon: GitCompare, badge: compareIds.length },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="relative flex h-10 w-10 items-center justify-center rounded border border-[#C9A962]/40 bg-[#251E19] text-primary shadow-brass group-hover:scale-105 transition-transform duration-200">
              <Compass className="h-5 w-5 text-primary" />
              <div className="absolute inset-0 rounded bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </div>
            <span className="font-display uppercase tracking-widest text-primary text-base font-bold group-hover:text-[#D4B872] transition-colors">
              CampusCompass
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map((link, idx) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <React.Fragment key={link.href}>
                  <Link
                    href={link.href}
                    className={`relative flex items-center space-x-1.5 font-display text-[10px] uppercase tracking-[0.2em] hover:tracking-[0.25em] font-semibold transition-all duration-300 ${
                      isActive ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{link.label}</span>
                    {link.badge !== undefined && link.badge > 0 && (
                      <span className="flex h-4.5 min-w-4.5 items-center justify-center rounded bg-primary px-1.5 text-[9px] font-bold text-[#1C1714]">
                        {link.badge}
                      </span>
                    )}
                    {isActive && (
                      <motion.div
                        layoutId="activeNavLine"
                        className="absolute -bottom-[23px] left-0 right-0 h-[2px] bg-primary"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                  {idx < navLinks.length - 1 && (
                    <span className="text-border font-body text-xs select-none" aria-hidden="true">/</span>
                  )}
                </React.Fragment>
              );
            })}
          </nav>

          {/* User Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {loading ? (
              <div className="h-8 w-8 animate-pulse rounded bg-muted" />
            ) : user ? (
              /* Profile Dropdown Container */
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 rounded border border-border bg-card p-1 pr-3 hover:bg-muted/40 transition-colors focus:outline-none cursor-pointer"
                >
                  {user.user_metadata?.avatar_url || user.user_metadata?.image ? (
                    <img
                      src={user.user_metadata.avatar_url || user.user_metadata.image}
                      alt={user.user_metadata?.full_name || user.user_metadata?.name || "User"}
                      className="h-7 w-7 rounded-sm object-cover"
                    />
                  ) : (
                    <div className="flex h-7 w-7 items-center justify-center rounded bg-primary text-xs font-bold text-[#1C1714]">
                      {(user.user_metadata?.full_name || user.user_metadata?.name || user.email)?.[0]?.toUpperCase() || "U"}
                    </div>
                  )}
                  <span className="text-xs font-medium max-w-[100px] truncate">
                    {user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "Dashboard"}
                  </span>
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setDropdownOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-48 rounded border border-border bg-card p-1 shadow-premium backdrop-blur-md z-20"
                      >
                        <div className="px-3 py-2 border-b border-border/40">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-display">Signed in as</p>
                          <p className="text-xs font-semibold truncate text-foreground">{user?.email}</p>
                        </div>
                        <Link
                          href="/dashboard"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center space-x-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded hover:bg-muted/50 transition-colors"
                        >
                          <Bookmark className="h-4 w-4" />
                          <span>Saved Colleges</span>
                        </Link>
                        <button
                          onClick={async () => {
                            setDropdownOpen(false);
                            await signOut();
                            router.push("/");
                          }}
                          className="flex w-full items-center space-x-2 px-3 py-2 text-sm text-rose-400 hover:text-rose-300 rounded hover:bg-rose-500/10 transition-colors cursor-pointer text-left"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Sign Out</span>
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/auth/signin">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button variant="premium" size="sm">Get Started</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border bg-card/95 backdrop-blur-md"
          >
            <div className="space-y-1 px-4 py-4">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center space-x-3 rounded px-3 py-2.5 font-display text-xs uppercase tracking-wider transition-colors ${
                      isActive 
                        ? "bg-[#1C1714] border border-[#C9A962]/30 text-primary" 
                        : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{link.label}</span>
                    {link.badge !== undefined && link.badge > 0 && (
                      <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[9px] font-bold text-[#1C1714]">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}

              <div className="border-t border-border/40 my-3 pt-3">
                {user ? (
                  <div className="space-y-1">
                    <div className="px-3 py-2 flex items-center space-x-3">
                      {user.user_metadata?.avatar_url || user.user_metadata?.image ? (
                        <img
                          src={user.user_metadata.avatar_url || user.user_metadata.image}
                          alt={user.user_metadata?.full_name || user.user_metadata?.name || "User"}
                          className="h-9 w-9 rounded-sm object-cover"
                        />
                      ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded bg-primary text-sm font-bold text-[#1C1714]">
                          {(user.user_metadata?.full_name || user.user_metadata?.name || user.email)?.[0]?.toUpperCase() || "U"}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold truncate max-w-[150px] text-foreground">
                          {user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0]}
                        </p>
                        <p className="text-xs text-muted-foreground truncate max-w-[150px]">{user.email}</p>
                      </div>
                    </div>
                    <Link
                      href="/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center space-x-3 rounded px-3 py-2.5 font-display text-xs uppercase tracking-wider text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                    >
                      <Bookmark className="h-4 w-4" />
                      <span>Saved Colleges</span>
                    </Link>
                    <button
                      onClick={async () => {
                        setIsOpen(false);
                        await signOut();
                        router.push("/");
                      }}
                      className="flex w-full items-center space-x-3 rounded px-3 py-2.5 font-display text-xs uppercase tracking-wider text-rose-400 hover:bg-rose-500/10 cursor-pointer text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 px-3 py-1">
                    <Link href="/auth/signin" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full">Sign In</Button>
                    </Link>
                    <Link href="/auth/signup" onClick={() => setIsOpen(false)}>
                      <Button variant="premium" className="w-full">Get Started</Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="h-[2px] bg-primary/85 shadow-brass" />
    </header>
  );
}
