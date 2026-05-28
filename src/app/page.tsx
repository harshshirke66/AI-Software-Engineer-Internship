"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { 
  Search, Star, GraduationCap, TrendingUp, GitCompare, 
  MapPin, CheckCircle, ArrowRight, ShieldCheck
} from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/colleges?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/colleges");
    }
  };

  // Hero Section Framer Motion Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as any } },
  };

  // Mock Featured Colleges (IIT Bombay, Stanford, IIM Ahmedabad)
  const featuredColleges = [
    {
      id: "stanford-university",
      name: "Stanford University",
      location: "Stanford, California",
      type: "Private",
      rating: 4.9,
      fees: "$58,000 / yr",
      avgPackage: "$145,000",
      image: "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?q=80&w=600&fit=crop",
      tag: "Ivy-Caliber Tech"
    },
    {
      id: "iit-bombay",
      name: "IIT Bombay",
      location: "Mumbai, Maharashtra",
      type: "Public",
      rating: 4.8,
      fees: "₹2.2 Lakh / yr",
      avgPackage: "₹23.5 LPA",
      image: "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=600&fit=crop",
      tag: "Premier Tech"
    },
    {
      id: "iim-ahmedabad",
      name: "IIM Ahmedabad",
      location: "Ahmedabad, Gujarat",
      type: "Public",
      rating: 4.8,
      fees: "₹12.5 Lakh / yr",
      avgPackage: "₹34.2 LPA",
      image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=600&fit=crop",
      tag: "Top Management"
    }
  ];

  const statistics = [
    { label: "Top Institutions", value: "10+", desc: "Renowned global colleges", icon: GraduationCap },
    { label: "Average Package", value: "₹25.8 LPA", desc: "Top tech streams", icon: TrendingUp },
    { label: "Compare Metrics", value: "15+", desc: "Side-by-side stats", icon: GitCompare },
    { label: "Successful Placements", value: "98.2%", desc: "Direct industry tie-ups", icon: ShieldCheck }
  ];

  const testimonials = [
    {
      name: "Devon Lane",
      role: "B.Tech Student, IIT Bombay",
      text: "CampusCompass saved me weeks of research. The comparison matrix layout let me map placement data, fees, and state-wise listings instantly.",
      image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=100&h=100&fit=crop"
    },
    {
      name: "Courtney Henry",
      role: "MBA Candidate, Stanford",
      text: "The details tabs are extremely clean. I was able to verify the course lists and recruiters list directly without wading through cluttered old forum boards.",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&h=100&fit=crop"
    }
  ];

  return (
    <div className="relative min-h-screen bg-background text-foreground flex flex-col overflow-x-hidden">
      <Navbar />

      {/* Main Content */}
      <main className="flex-grow z-10">
        
        {/* 1. Hero Section */}
        <section className="relative py-24 md:py-32">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            
            {/* Tagline Roman Number Label */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-4"
            >
              <span className="font-display text-[11px] tracking-[0.25em] text-primary uppercase">
                Volume I • The Scholarly Declaration
              </span>
            </motion.div>

            {/* Cormorant Garamond Heading */}
            <motion.h1 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="font-heading font-medium text-4xl sm:text-6xl tracking-tight text-foreground max-w-3xl mx-auto leading-[1.15]"
            >
              <motion.span variants={itemVariants}>Navigate Your Academic</motion.span> <br />
              <motion.span variants={itemVariants} className="italic text-primary font-normal">Future with Dignity & Confidence</motion.span>
            </motion.h1>

            {/* Drop Cap Introductory Paragraph */}
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="mt-8 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed drop-cap text-left sm:text-justify"
            >
              Discover elite global institutions, analyze placement reports, check fee catalogs, and execute direct side-by-side comparative analysis. Every scholar deserves a pathway forged in truth, clarity, and distinguished academic heritage.
            </motion.p>

            {/* Interactive Search Bar */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="mt-10 max-w-xl mx-auto"
            >
              <form onSubmit={handleSearchSubmit} className="relative flex items-center p-1.5 rounded border border-border bg-[#251E19] shadow-premium focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition-all">
                <Search className="h-5 w-5 text-primary ml-3.5 flex-shrink-0" />
                <Input 
                  type="text"
                  placeholder="Search by college name, course, state..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:italic placeholder:text-muted-foreground/50 text-foreground py-6 text-sm pr-4 font-body"
                />
                <Button type="submit" variant="premium" className="rounded px-5 sm:px-6 py-5 shrink-0">
                  Search
                </Button>
              </form>
            </motion.div>
            
          </div>
        </section>

        {/* Section Separator */}
        <div className="mx-auto max-w-5xl px-8">
          <div className="ornate-divider" aria-hidden="true" />
        </div>

        {/* 2. Statistics Section */}
        <section className="py-12 border-y border-border bg-card/30 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {statistics.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <motion.div 
                    key={stat.label}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    className="flex flex-col items-center md:items-start text-center md:text-left space-y-2 border-r last:border-r-0 border-border/40 last:border-0 pr-4"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded border border-primary/30 bg-[#1C1714] text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-heading font-medium text-foreground tracking-tight">{stat.value}</div>
                    <div className="text-[10px] font-semibold text-primary uppercase tracking-widest font-display">{stat.label}</div>
                    <div className="text-xs font-body italic text-muted-foreground">{stat.desc}</div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Section Separator */}
        <div className="mx-auto max-w-5xl px-8">
          <div className="ornate-divider" aria-hidden="true" />
        </div>

        {/* 3. Featured Colleges Section */}
        <section className="py-20 bg-[#251E19]/10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            
            <div className="mb-4">
              <span className="font-display text-[10px] tracking-[0.25em] text-primary uppercase">
                Volume II • Elite Institutions
              </span>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
              <div>
                <h2 className="text-2xl sm:text-4xl font-heading font-medium tracking-tight text-foreground">Featured Institutions</h2>
                <p className="mt-2 text-muted-foreground font-body italic text-sm sm:text-base">Top-ranked colleges offering high return on investment and placement excellence.</p>
              </div>
              <Link href="/colleges" className="mt-4 md:mt-0 inline-flex items-center space-x-1.5 text-xs font-display uppercase tracking-widest text-primary hover:text-[#D4B872] group">
                <span>View All Catalogs</span>
                <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredColleges.map((college, i) => (
                <motion.div
                  key={college.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                  whileHover={{ y: -6 }}
                  className="group relative flex flex-col rounded border border-border bg-card overflow-hidden cursor-pointer shadow-premium hover:shadow-premium-hover transition-all duration-300 corner-flourish"
                  onClick={() => router.push(`/colleges/${college.id}`)}
                >
                  {/* Wax Seal featured badge */}
                  <div className="absolute top-3 right-4 w-9 h-9 rounded-full wax-seal flex items-center justify-center text-primary z-10" title="Featured Badge">
                    <Star className="h-4 w-4 fill-primary text-primary-foreground stroke-1" />
                  </div>

                  {/* College Image (Cathedral Arch Top + Sepia transition) */}
                  <div className="relative h-48 w-full overflow-hidden bg-muted arch-top m-3 mb-0">
                    <img 
                      src={college.image} 
                      alt={college.name} 
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 sepia-effect"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1C1714]/80 to-transparent" />
                    
                    <span className="absolute bottom-3 left-4 rounded border border-primary/30 bg-[#251E19]/90 backdrop-blur-md px-2.5 py-0.5 text-[9px] font-display font-medium text-primary uppercase tracking-widest">
                      {college.tag}
                    </span>
                  </div>

                  {/* College Card Details */}
                  <div className="flex-grow p-6 flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-display uppercase tracking-wider text-muted-foreground">{college.type}</span>
                      <div className="flex items-center space-x-1 text-primary">
                        <Star className="h-3.5 w-3.5 fill-primary" />
                        <span className="text-xs font-semibold text-foreground">{college.rating}</span>
                      </div>
                    </div>

                    <h3 className="text-lg font-heading font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {college.name}
                    </h3>
                    <p className="mt-1 flex items-center text-xs text-muted-foreground font-body italic">
                      <MapPin className="h-3.5 w-3.5 mr-1 text-primary shrink-0" />
                      <span>{college.location}</span>
                    </p>

                    <div className="border-t border-border mt-6 pt-4 grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-[9px] font-display text-muted-foreground uppercase tracking-wider">Annual Fees</div>
                        <div className="text-sm font-semibold text-foreground mt-0.5">{college.fees}</div>
                      </div>
                      <div>
                        <div className="text-[9px] font-display text-muted-foreground uppercase tracking-wider">Avg Placement</div>
                        <div className="text-sm font-semibold text-primary mt-0.5">{college.avgPackage}</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Section Separator */}
        <div className="mx-auto max-w-5xl px-8">
          <div className="ornate-divider" aria-hidden="true" />
        </div>

        {/* 4. Compare CTA Section */}
        <section className="py-20 relative bg-background overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="relative rounded border border-border bg-card/60 p-8 sm:p-12 lg:p-16 overflow-hidden shadow-premium ornate-frame">
              <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-primary/5 to-transparent rounded-full blur-3xl" />
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Text Block */}
                <div className="lg:col-span-7 space-y-6">
                  <div>
                    <span className="font-display text-[10px] tracking-[0.25em] text-primary uppercase">
                      Volume III • Decision Matrix
                    </span>
                  </div>
                  
                  <h2 className="text-3xl sm:text-4xl font-heading font-medium tracking-tight text-foreground leading-tight">
                    Compare Colleges Side-by-Side In Realtime
                  </h2>
                  <p className="text-muted-foreground font-body text-sm sm:text-base leading-relaxed">
                    Struggling between choices? Add up to three colleges to our advanced comparison matrix. We layout fees, average salaries, highest package, location, ratings, and course counts in a clean responsive grid.
                  </p>
                  
                  <div className="space-y-3 pt-2">
                    {[
                      "Annual fees & course streams alignment",
                      "Placements statistics (Average vs Highest packages)",
                      "Campus student facilities mapping side-by-side"
                    ].map((feature) => (
                      <div key={feature} className="flex items-center text-sm text-muted-foreground font-body italic">
                        <CheckCircle className="h-4.5 w-4.5 mr-2.5 text-primary shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4">
                    <Link href="/compare">
                      <Button variant="premium" size="lg" className="rounded flex items-center space-x-2 group">
                        <span>Launch Compare Tool</span>
                        <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Graphics Mockup Block */}
                <div className="lg:col-span-5 flex justify-center">
                  <div className="relative w-full max-w-md rounded border border-border bg-[#1C1714] p-5 shadow-premium">
                    <div className="flex items-center justify-between border-b border-border/60 pb-4 mb-4">
                      <span className="text-[10px] font-display font-semibold text-primary uppercase tracking-widest">Comparison Ledger</span>
                      <div className="flex space-x-1.5">
                        <div className="h-2 w-2 rounded-full bg-[#8B2635]" />
                        <div className="h-2 w-2 rounded-full bg-[#C9A962]" />
                        <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                      </div>
                    </div>
                    
                    {/* Side-by-Side Cards Mock */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="rounded border border-border bg-card p-3 text-center">
                        <div className="text-[9px] font-display text-muted-foreground">IIT Bombay</div>
                        <div className="text-xs font-bold text-foreground mt-1">₹23.5 LPA</div>
                        <div className="text-[9px] font-body italic text-muted-foreground/75">Avg Placement</div>
                      </div>
                      <div className="rounded border border-primary bg-primary/5 p-3 text-center">
                        <div className="text-[9px] font-display text-primary">Stanford</div>
                        <div className="text-xs font-bold text-primary mt-1">$145K</div>
                        <div className="text-[9px] font-body italic text-primary/75">Avg Placement</div>
                      </div>
                    </div>

                    <div className="rounded border border-border bg-card p-3 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Fees Comparison</span>
                        <span className="font-semibold text-primary uppercase font-display text-[9px] tracking-wider">IITB is 20x Cheaper</span>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded overflow-hidden">
                        <div className="h-full bg-primary rounded w-[95%]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Section Separator */}
        <div className="mx-auto max-w-5xl px-8">
          <div className="ornate-divider" aria-hidden="true" />
        </div>

        {/* 5. Testimonials Section */}
        <section className="py-20 bg-[#251E19]/30 border-t border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="font-display text-[10px] tracking-[0.25em] text-primary uppercase mb-2 block">
                Volume IV • Testimonies of Excellence
              </span>
              <h2 className="text-2xl sm:text-4xl font-heading font-medium tracking-tight text-foreground">Recommended by Students</h2>
              <p className="mt-2 text-muted-foreground font-body italic text-sm">Read reviews from verified students who found their colleges through our tools.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {testimonials.map((t) => (
                <Card key={t.name} className="border border-border bg-card shadow-premium relative overflow-hidden rounded">
                  <CardContent className="p-8 space-y-5">
                    <div className="flex items-center space-x-1 text-primary">
                      {[...Array(5)].map((_, idx) => (
                        <Star key={idx} className="h-3.5 w-3.5 fill-primary text-primary" />
                      ))}
                    </div>
                    <p className="text-muted-foreground italic font-body text-base leading-relaxed">
                      "{t.text}"
                    </p>
                    <div className="flex items-center space-x-3 pt-2">
                      <img src={t.image} alt={t.name} className="h-10 w-10 rounded-sm object-cover border border-border" />
                      <div>
                        <h4 className="text-sm font-semibold text-foreground font-display tracking-wider uppercase">{t.name}</h4>
                        <p className="text-[10px] text-muted-foreground font-body italic">{t.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
