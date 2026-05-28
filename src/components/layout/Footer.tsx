import Link from "next/link";
import { Compass, Globe, Mail, Link as LinkIcon } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/60 py-12 text-muted-foreground">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="flex h-8 w-8 items-center justify-center rounded border border-[#C9A962]/40 bg-[#251E19] text-primary shadow-brass group-hover:scale-105 transition-transform duration-200">
                <Compass className="h-4 w-4 text-primary" />
              </div>
              <span className="font-display uppercase tracking-widest text-primary text-base font-bold group-hover:text-[#D4B872] transition-colors">CampusCompass</span>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs font-body italic text-muted-foreground/80">
              Empowering students to discover, evaluate, and decide on their dream college path with premium data and smart side-by-side comparison tables.
            </p>
            <div className="flex space-x-2 pt-2">
              <a href="#" className="hover:text-foreground transition-colors border border-border p-2 rounded bg-background" title="Official Website" aria-label="Visit CampusCompass Official Website"><Globe className="h-4 w-4 text-primary" /></a>
              <a href="#" className="hover:text-foreground transition-colors border border-border p-2 rounded bg-background" title="Linked Resources" aria-label="CampusCompass Resources and Links"><LinkIcon className="h-4 w-4 text-primary" /></a>
              <a href="#" className="hover:text-foreground transition-colors border border-border p-2 rounded bg-background" title="Email Support" aria-label="Contact CampusCompass Support via Email"><Mail className="h-4 w-4 text-primary" /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold text-primary tracking-widest uppercase mb-4 font-display">Discover</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/colleges" className="hover:text-primary transition-colors">Find Colleges</Link></li>
              <li><Link href="/compare" className="hover:text-primary transition-colors">Compare Tool</Link></li>
              <li><a href="#" className="hover:text-primary transition-colors">Top Engineering Streams</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Top Management Streams</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-xs font-semibold text-primary tracking-widest uppercase mb-4 font-display">Resources</h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#" className="hover:text-primary transition-colors">Student Guidebook</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Scholarships Info</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Placement Trends 2026</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Help & FAQ</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-semibold text-primary tracking-widest uppercase mb-4 font-display">Company</h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contact Support</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/40 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground font-display tracking-wider">
          <p>© {new Date().getFullYear()} CampusCompass. All rights reserved.</p>
          <p className="mt-2 sm:mt-0 italic">Handcrafted with scholarly devotion.</p>
        </div>
      </div>
    </footer>
  );
}
