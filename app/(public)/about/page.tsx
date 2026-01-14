import React from "react";
import { GraduationCap, BookOpen, Layers, Users, Shield, Github } from "lucide-react";

export const metadata = {
  title: "About | MCA Hub",
  description: "Learn more about MCA Hub - your ultimate platform for MCA study materials.",
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-6 pt-8">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xl mb-4">
          <GraduationCap className="h-10 w-10" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-400">
          About MCA Hub
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Empowering MCA students with accessible, high-quality study materials and a streamlined learning experience.
        </p>
      </section>

      {/* Mission Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-8 rounded-3xl bg-zinc-50 dark:bg-zinc-900/50 border border-border/50 space-y-4 hover:shadow-lg transition-all duration-300 group">
          <div className="h-12 w-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
            <BookOpen className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-semibold">Quality Content</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Curated notes, textbooks, and resources tailored specifically for the MCA curriculum.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-zinc-50 dark:bg-zinc-900/50 border border-border/50 space-y-4 hover:shadow-lg transition-all duration-300 group">
          <div className="h-12 w-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Layers className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-semibold">Organized Layout</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Navigate through courses, semesters, and subjects with ease using our intuitive sidebar.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-zinc-50 dark:bg-zinc-900/50 border border-border/50 space-y-4 hover:shadow-lg transition-all duration-300 group">
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Users className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-semibold">Community Driven</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Built by students, for students. We constantly update our content based on feedback.
          </p>
        </div>
      </section>

      {/* Detailed Info */}
      <section className="space-y-12">
        <div className="bg-[#f5f5f7] dark:bg-zinc-900 rounded-[2.5rem] p-12 text-zinc-900 dark:text-white overflow-hidden relative group border border-zinc-200 dark:border-white/5 shadow-xl">
          {/* Subtle depth effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none"></div>
          
          <div className="relative z-10 space-y-8 max-w-2xl">
            <h2 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">The Vision</h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-lg leading-relaxed font-medium">
              MCA Hub was born out of the need for a centralized, modern repository for MCA academic resources. 
              We believe that every student deserves access to organized knowledge.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <div className="flex items-center gap-2 bg-white dark:bg-zinc-800 px-4 py-2 rounded-full border border-zinc-200 dark:border-white/10 hover:shadow-md transition-all cursor-default">
                <Shield className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Open Source</span>
              </div>
              <div className="flex items-center gap-2 bg-white dark:bg-zinc-800 px-4 py-2 rounded-full border border-zinc-200 dark:border-white/10 hover:shadow-md transition-all cursor-default">
                <Github className="h-4 w-4 text-zinc-900 dark:text-zinc-400" />
                <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">GitHub Project</span>
              </div>
            </div>
          </div>
        </div>

        {/* Key Contributors Section - Separate Box */}
        <div className="bg-white dark:bg-black p-10 rounded-[2.5rem] border border-zinc-200 dark:border-white/5 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold flex items-center gap-3 text-zinc-900 dark:text-zinc-100">
                <Users className="h-6 w-6 text-blue-500" />
                Key Contributors
              </h3>
              <p className="text-zinc-500 dark:text-zinc-400">The talented individuals behind the data and platform.</p>
            </div>
            
            <div className="flex items-center gap-6 p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl border border-zinc-100 dark:border-white/5">
              <div className="h-14 w-14 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-black flex items-center justify-center text-xl font-bold shrink-0 shadow-xl border-4 border-white dark:border-zinc-800">
                FS
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-zinc-900 dark:text-white text-lg leading-none">M Fathima Sana</h4>
                <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest py-1">Data Management & Notifications</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">Handles uploading data and site-wide update notifications.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer info */}
      <section className="text-center pt-8 border-t border-border/40">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} MCA Hub. All rights reserved.
        </p>
      </section>
    </div>
  );
}
