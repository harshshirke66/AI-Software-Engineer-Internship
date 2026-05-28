"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useCompareStore } from "@/lib/store/useCompareStore";
import { Button } from "@/components/ui/Button";
import { Compass, GitCompare, Bookmark, LogOut, Menu, X, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const compareIds = useCompareStore((state) => state.collegeIds);
  const [isOpen, setIsOpen] = React.useState(false);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  const navLinks = [
    { href: "/colleges", label: "Colleges", icon: Compass },
    { href: "/compare", label: "Compare", icon: GitCompare, badge: compareIds.length },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 shadow-md shadow-indigo-500/10 group-hover:scale-105 transition-transform duration-200">
              <Compass className="h-5 w-5 text-white" />
              <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </div>
            <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-xl font-bold tracking-tight text-transparent">
              CampusCompass
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative flex items-center space-x-1.5 text-sm font-medium transition-colors ${
                    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{link.label}</span>
                  {link.badge !== undefined && link.badge > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-white">
                      {link.badge}
                    </span>
                  )}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavLine"
                      className="absolute -bottom-5 left-0 right-0 h-[2px] bg-primary"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {status === "loading" ? (
              <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
            ) : session ? (
              /* Profile Dropdown Container */
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 rounded-full border border-border bg-card p-1 pr-3 hover:bg-accent/40 transition-colors focus:outline-none"
                >
                  {session.user?.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      className="h-7 w-7 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500 text-xs font-bold text-white">
                      {session.user?.name?.[0] || "U"}
                    </div>
                  )}
                  <span className="text-xs font-medium max-w-[100px] truncate">
                    {session.user?.name || "Dashboard"}
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
                        className="absolute right-0 mt-2 w-48 rounded-xl border border-border bg-slate-950/95 p-1 shadow-xl backdrop-blur-md z-20"
                      >
                        <div className="px-3 py-2 border-b border-border/40">
                          <p className="text-[10px] text-muted-foreground truncate">Signed in as</p>
                          <p className="text-xs font-semibold truncate">{session.user?.email}</p>
                        </div>
                        <Link
                          href="/dashboard"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center space-x-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent/50 transition-colors"
                        >
                          <Bookmark className="h-4 w-4" />
                          <span>Saved Colleges</span>
                        </Link>
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            signOut({ callbackUrl: "/" });
                          }}
                          className="flex w-full items-center space-x-2 px-3 py-2 text-sm text-rose-400 hover:text-rose-300 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer text-left"
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
            className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-md"
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
                    className={`flex items-center space-x-3 rounded-lg px-3 py-2.5 text-base font-medium transition-colors ${
                      isActive ? "bg-accent text-primary" : "text-muted-foreground hover:bg-accent/40 hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{link.label}</span>
                    {link.badge !== undefined && link.badge > 0 && (
                      <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-bold text-white">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}

              <div className="border-t border-border/40 my-3 pt-3">
                {session ? (
                  <div className="space-y-1">
                    <div className="px-3 py-2 flex items-center space-x-3">
                      {session.user?.image ? (
                        <img
                          src={session.user.image}
                          alt={session.user.name || "User"}
                          className="h-9 w-9 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500 text-sm font-bold text-white">
                          {session.user?.name?.[0] || "U"}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold">{session.user?.name}</p>
                        <p className="text-xs text-muted-foreground">{session.user?.email}</p>
                      </div>
                    </div>
                    <Link
                      href="/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center space-x-3 rounded-lg px-3 py-2.5 text-base text-muted-foreground hover:bg-accent/40 hover:text-foreground"
                    >
                      <Bookmark className="h-5 w-5" />
                      <span>Saved Colleges</span>
                    </Link>
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        signOut({ callbackUrl: "/" });
                      }}
                      className="flex w-full items-center space-x-3 rounded-lg px-3 py-2.5 text-base text-rose-400 hover:bg-rose-500/10"
                    >
                      <LogOut className="h-5 w-5" />
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
    </header>
  );
}
