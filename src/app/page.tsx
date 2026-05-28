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
  MapPin, CheckCircle, ArrowRight, ShieldCheck, Sparkles 
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
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col overflow-x-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-[radial-gradient(ellipse_60%_60%_at_50%_-10%,rgba(99,102,241,0.15),rgba(0,0,0,0))] pointer-events-none z-0" />
      
      <Navbar />

      {/* Main Content */}
      <main className="flex-grow z-10">
        
        {/* 1. Hero Section */}
        <section className="relative pt-20 pb-16 md:pt-32 md:pb-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            
            {/* Tagline Pill */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center space-x-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 mb-6 shadow-inner text-xs font-semibold text-indigo-300"
            >
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              <span>Next-Gen College Selection Platform</span>
            </motion.div>

            <motion.h1 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-b from-white via-slate-200 to-slate-500 bg-clip-text text-transparent max-w-4xl mx-auto leading-[1.1]"
            >
              <motion.span variants={itemVariants}>Navigate Your Academic</motion.span> <br />
              <motion.span variants={itemVariants} className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">Future with Confidence</motion.span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed"
            >
              Discover elite global institutions, analyze placement reports, check fee catalogs, and execute direct side-by-side comparative analysis.
            </motion.p>

            {/* Interactive Search Bar */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="mt-10 max-w-xl mx-auto"
            >
              <form onSubmit={handleSearchSubmit} className="relative flex items-center p-1.5 rounded-2xl border border-border/80 bg-slate-900/90 shadow-2xl focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition-all">
                <Search className="h-5 w-5 text-slate-500 ml-3.5 flex-shrink-0" />
                <Input 
                  type="text"
                  placeholder="Search by college name, course, state..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-slate-500 text-slate-200 py-6 text-sm sm:text-base pr-4"
                />
                <Button type="submit" variant="premium" className="rounded-xl px-5 sm:px-6 py-5 shrink-0">
                  Search
                </Button>
              </form>
            </motion.div>
            
          </div>
        </section>

        {/* 2. Statistics Section */}
        <section className="py-12 border-y border-border/20 bg-slate-950/50 backdrop-blur-sm">
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
                    className="flex flex-col items-center md:items-start text-center md:text-left space-y-2 border-r last:border-r-0 border-border/20 last:border-0 pr-4"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{stat.value}</div>
                    <div className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">{stat.label}</div>
                    <div className="text-xs text-slate-400">{stat.desc}</div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 3. Featured Colleges Section */}
        <section className="py-20 bg-slate-950">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
              <div>
                <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">Featured Institutions</h2>
                <p className="mt-2 text-slate-400 text-sm sm:text-base">Top-ranked colleges offering high return on investment and placement excellence.</p>
              </div>
              <Link href="/colleges" className="mt-4 md:mt-0 inline-flex items-center space-x-1 text-sm font-semibold text-primary hover:text-primary/80 group">
                <span>View all colleges</span>
                <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
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
                  whileHover={{ y: -8 }}
                  className="group relative flex flex-col rounded-2xl border border-border bg-slate-900/60 overflow-hidden cursor-pointer"
                  onClick={() => router.push(`/colleges/${college.id}`)}
                >
                  {/* College Image */}
                  <div className="relative h-48 w-full overflow-hidden bg-slate-950">
                    <img 
                      src={college.image} 
                      alt={college.name} 
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
                    
                    <span className="absolute top-4 left-4 rounded-full bg-slate-950/80 backdrop-blur-md px-3 py-1 text-[11px] font-bold text-indigo-300 border border-indigo-500/20">
                      {college.tag}
                    </span>
                  </div>

                  {/* College Card Details */}
                  <div className="flex-grow p-6 flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-400">{college.type}</span>
                      <div className="flex items-center space-x-1 text-amber-400">
                        <Star className="h-3.5 w-3.5 fill-amber-400" />
                        <span className="text-xs font-bold text-slate-200">{college.rating}</span>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors line-clamp-1">
                      {college.name}
                    </h3>
                    <p className="mt-1 flex items-center text-xs text-slate-400">
                      <MapPin className="h-3.5 w-3.5 mr-1 text-slate-500 shrink-0" />
                      <span>{college.location}</span>
                    </p>

                    <div className="border-t border-border/40 mt-6 pt-4 grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider">Average Fees</div>
                        <div className="text-sm font-semibold text-white mt-0.5">{college.fees}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider">Avg Placement</div>
                        <div className="text-sm font-semibold text-emerald-400 mt-0.5">{college.avgPackage}</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Compare CTA Section */}
        <section className="py-20 relative bg-slate-900/40 border-t border-border/20 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_120%,rgba(99,102,241,0.08),rgba(0,0,0,0))] pointer-events-none" />
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="relative rounded-3xl border border-border/55 bg-slate-950/80 p-8 sm:p-12 lg:p-16 overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-indigo-500/10 to-transparent rounded-full blur-3xl" />
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Text Block */}
                <div className="lg:col-span-6 space-y-6">
                  <span className="inline-flex items-center space-x-1.5 rounded-md bg-indigo-500/10 px-2.5 py-1 text-xs font-semibold text-indigo-400">
                    <GitCompare className="h-3.5 w-3.5" />
                    <span>Decision Helper</span>
                  </span>
                  
                  <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                    Compare Colleges Side-by-Side In Realtime
                  </h2>
                  <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                    Struggling between choices? Add up to three colleges to our advanced comparison matrix. We layout fees, average salaries, highest package, location, ratings, and course counts in a clean responsive grid.
                  </p>
                  
                  <div className="space-y-3 pt-2">
                    {[
                      "Annual fees & course streams alignment",
                      "Placements statistics (Average vs Highest packages)",
                      "Campus student facilities mapping side-by-side"
                    ].map((feature) => (
                      <div key={feature} className="flex items-center text-sm text-slate-300">
                        <CheckCircle className="h-4.5 w-4.5 mr-2 text-indigo-400 shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4">
                    <Link href="/compare">
                      <Button variant="premium" size="lg" className="rounded-xl flex items-center space-x-2 group">
                        <span>Launch Compare Tool</span>
                        <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Graphics Mockup Block */}
                <div className="lg:col-span-6 flex justify-center">
                  <div className="relative w-full max-w-md rounded-2xl border border-border bg-slate-900/60 p-5 shadow-2xl backdrop-blur-sm">
                    <div className="flex items-center justify-between border-b border-border/40 pb-4 mb-4">
                      <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">Comparison Deck</span>
                      <div className="flex space-x-1.5">
                        <div className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                        <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                        <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                      </div>
                    </div>
                    
                    {/* Side-by-Side Cards Mock */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="rounded-xl border border-border bg-slate-950 p-3 text-center">
                        <div className="text-[10px] text-slate-400">IIT Bombay</div>
                        <div className="text-xs font-bold text-white mt-1">₹23.5 LPA</div>
                        <div className="text-[9px] text-slate-500">Avg Placement</div>
                      </div>
                      <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-3 text-center">
                        <div className="text-[10px] text-indigo-300">Stanford University</div>
                        <div className="text-xs font-bold text-white mt-1">$145K</div>
                        <div className="text-[9px] text-slate-400">Avg Placement</div>
                      </div>
                    </div>

                    <div className="rounded-xl bg-slate-950/80 p-3 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Fees Comparison</span>
                        <span className="font-semibold text-rose-400">IITB is 20x Cheaper</span>
                      </div>
                      <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: "95%" }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 5. Testimonials Section */}
        <section className="py-20 bg-slate-950 border-t border-border/20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">Recommended by Students</h2>
              <p className="mt-2 text-slate-400">Read reviews from verified students who found their colleges through our tools.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {testimonials.map((t, i) => (
                <Card key={t.name} className="border border-border/60 bg-slate-900/40 shadow-lg relative overflow-hidden backdrop-blur-sm">
                  <CardContent className="p-8 space-y-5">
                    <div className="flex items-center space-x-1 text-amber-400">
                      {[...Array(5)].map((_, idx) => (
                        <Star key={idx} className="h-4 w-4 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-slate-300 italic text-sm sm:text-base leading-relaxed">
                      "{t.text}"
                    </p>
                    <div className="flex items-center space-x-3 pt-2">
                      <img src={t.image} alt={t.name} className="h-10 w-10 rounded-full object-cover" />
                      <div>
                        <h4 className="text-sm font-bold text-white">{t.name}</h4>
                        <p className="text-xs text-slate-500">{t.role}</p>
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
