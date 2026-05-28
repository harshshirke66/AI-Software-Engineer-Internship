import Link from "next/link";
import { Compass, Globe, Mail, Link as LinkIcon } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-slate-950/40 py-12 text-muted-foreground">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 text-white shadow-sm">
                <Compass className="h-4 w-4" />
              </div>
              <span className="font-bold text-foreground text-lg tracking-tight">CampusCompass</span>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs">
              Empowering students to discover, evaluate, and decide on their dream college path with premium data and smart side-by-side comparison tables.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="hover:text-foreground transition-colors"><Globe className="h-4 w-4" /></a>
              <a href="#" className="hover:text-foreground transition-colors"><LinkIcon className="h-4 w-4" /></a>
              <a href="#" className="hover:text-foreground transition-colors"><Mail className="h-4 w-4" /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-foreground tracking-wider uppercase mb-4">Discover</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/colleges" className="hover:text-foreground transition-colors">Find Colleges</Link></li>
              <li><Link href="/compare" className="hover:text-foreground transition-colors">Compare Tool</Link></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Top Engineering Streams</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Top Management Streams</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold text-foreground tracking-wider uppercase mb-4">Resources</h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#" className="hover:text-foreground transition-colors">Student Guidebook</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Scholarships Info</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Placement Trends 2026</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Help & FAQ</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-foreground tracking-wider uppercase mb-4">Company</h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#" className="hover:text-foreground transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Contact Support</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/40 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} CampusCompass. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">Handcrafted for premium quality by Antigravity.</p>
        </div>
      </div>
    </footer>
  );
}
