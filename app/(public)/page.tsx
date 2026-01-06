import Link from "next/link";
import { USERS_COURSE } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, GraduationCap, ChevronRight, ArrowRight, Library, Video, MonitorPlay } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <div className="flex flex-col min-h-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden w-full flex flex-col items-center text-center pt-24 pb-20 md:pt-32 md:pb-32 bg-background">
        <div className="absolute inset-0 z-0 opacity-40 select-none pointer-events-none">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-foreground/5 blur-[120px] rounded-full"></div>
        </div>

        <div className="z-10 px-6 max-w-5xl mx-auto flex flex-col items-center">
            <div className="inline-flex items-center rounded-full border border-primary/10 bg-primary/5 px-3 py-1 text-xs font-medium text-primary/80 mb-8 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="flex h-1.5 w-1.5 rounded-full bg-primary mr-2 animate-pulse"></span>
            MCA 2024-2025 Curriculum
            </div>
            
            <h1 className="text-5xl font-bold tracking-tighter sm:text-7xl md:text-8xl bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70 pb-4 animate-in fade-in slide-in-from-bottom-6 duration-1000 fill-mode-both">
            Master Your <br/>
            Computers Degree.
            </h1>
            
            <p className="mt-8 max-w-[650px] text-lg text-muted-foreground md:text-xl leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both delay-100 font-medium">
            The premium platform for MCA students. Access high-quality notes, 
            interactive video lectures, and exam resources.
            </p>

            <div className="mt-12 flex flex-wrap justify-center gap-5 animate-in fade-in slide-in-from-bottom-10 duration-1000 fill-mode-both delay-200">
            <Link href={`/${USERS_COURSE.id}`}>
                <div className="inline-flex h-14 items-center justify-center rounded-full bg-primary px-8 text-base font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-105 hover:shadow-xl active:scale-95 duration-200 cursor-pointer">
                    Start Learning
                    <ArrowRight className="ml-2 h-4 w-4" />
                </div>
            </Link>
            <div className="inline-flex h-14 items-center justify-center rounded-full border border-input bg-background/50 backdrop-blur-sm px-8 text-base font-medium shadow-sm hover:bg-accent hover:text-accent-foreground transition-all duration-200 cursor-pointer">
                Browse Subjects
            </div>
            </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="px-6 py-24 bg-muted/30 border-t w-full">
         <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight mb-12 text-center md:text-left">Platform Features</h2>
            
            <div className="grid gap-8 md:grid-cols-3">
                 <div className="group rounded-3xl border border-border/50 bg-background/60 p-8 shadow-sm transition-all hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 duration-300">
                    <div className="h-12 w-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-foreground mb-6 group-hover:scale-110 transition-transform duration-300">
                        <Library className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">Digital Library</h3>
                    <p className="text-muted-foreground leading-relaxed">
                        Access a vast collection of curated notes, PDFs, and reference materials tailored for every subject in your curriculum.
                    </p>
                 </div>

                 <div className="group rounded-3xl border border-border/50 bg-background/60 p-8 shadow-sm transition-all hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 duration-300">
                    <div className="h-12 w-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-foreground mb-6 group-hover:scale-110 transition-transform duration-300">
                        <MonitorPlay className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">Video Lectures</h3>
                    <p className="text-muted-foreground leading-relaxed">
                        Learn complex topics easily with high-definition video tutorials from expert professors and industry professionals.
                    </p>
                 </div>

                 <Link href={`/${USERS_COURSE.id}`} className="block h-full">
                    <div className="group h-full rounded-3xl border border-primary/10 bg-primary/5 p-8 shadow-sm transition-all hover:bg-primary/10 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 duration-300 relative overflow-hidden">
                        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                            <GraduationCap className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-semibold mb-3">Structured Course</h3>
                        <p className="text-muted-foreground leading-relaxed mb-6">
                            Start your journey with the Master of Computer Applications program.
                        </p>
                        <div className="absolute bottom-8 right-8 text-primary opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                            <ArrowRight className="h-6 w-6" />
                        </div>
                    </div>
                 </Link>
            </div>
         </div>
      </section>
    </div>
  );
}
