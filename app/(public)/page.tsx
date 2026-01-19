"use client";

import Link from "next/link";
import { USERS_COURSE } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { BookOpen, GraduationCap, ArrowRight, Library, MonitorPlay, Bell, FileText, Video as VideoIcon, ExternalLink, Calendar, Megaphone, CalendarClock, Clock, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

interface TimetableEntry {
    date: string;
    subject: string;
    time: string;
}

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: "exam" | "fees" | "general" | "seminar" | "viva";
  link?: string;
  image?: string;
  active: boolean;
  createdAt: string;
  isMain: boolean;
  timetable?: TimetableEntry[];
}


interface Content {
  _id: string;
  title: string;
  type: "video" | "pdf";
  url: string;
  unitId: {
    name: string;
    subjectId: {
      name: string;
      slug: string;
      semesterId: {
        name: string;
        slug: string;
        degreeId: {
          name: string;
          slug: string;
        }
      }
    }
  };
  createdAt: string;
}

interface HomeData {
  notifications: Notification[];
  recentContent: Content[];
}

export default function Home() {
  const { data: session } = useSession();
  const { data, isLoading } = useQuery<HomeData>({
    queryKey: ["homeData"],
    queryFn: async () => {
      const res = await fetch("/api/home");
      if (!res.ok) throw new Error("Failed to fetch home data");
      return res.json();
    },
  });

  const notifications = data?.notifications || [];
  const recentContent = data?.recentContent || [];

  const mainNotification = notifications.find((n) => n.isMain);
  const otherNotifications = notifications.filter((n) => !n.isMain);

  // Helper to convert Google Drive links to direct images (Thumbnail method is more reliable for embedding)
  const getDirectImageUrl = (url: string) => {
    if (!url) return "";
    if (url.includes("drive.google.com") && url.includes("/d/")) {
        const id = url.split("/d/")[1].split("/")[0];
        // sz=w2000 asks for a width of up to 2000px, getting a high-res version
        return `https://drive.google.com/thumbnail?id=${id}&sz=w2000`; 
    }
    return url;
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F5F7] pb-20">
      <div className="bg-white/70 backdrop-blur-xl border-b border-white/20 fixed top-0 w-full z-50 transition-all duration-200">
        <div className="max-w-[980px] mx-auto flex items-center justify-between h-12 px-6">
             <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-black" />
                <span className="font-semibold text-sm tracking-tight text-black">
                    MCA HUB
                </span>
            </div>
            {session?.user ? (
                 <div className="flex items-center gap-4">
                    <Link href="/student/forms" className="text-xs font-medium text-gray-500 hover:text-black transition-colors">
                        Forms
                    </Link>
                    <span className="text-sm font-medium text-gray-600 hidden sm:inline-block">
                        Hi, {session.user.name?.split(' ')[0] || "Student"}
                    </span>
                    <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold ring-2 ring-white shadow-sm">
                        {session.user.name?.[0] || "S"}
                    </div>
                </div>
            ) : (
                <Link href="/student/login">
                    <Button variant="ghost" size="sm" className="h-7 text-xs font-normal bg-black text-white hover:bg-black/80 rounded-full px-4">
                        Sign In
                    </Button>
                </Link>
            )}
        </div>
      </div>

      {/* Hero Area */}
      {/* <div className="pt-28 pb-12 px-6">
         <div className="max-w-[980px] mx-auto text-center space-y-4">
            <h1 className="text-5xl md:text-7xl font-semibold tracking-tight text-black">
                Student Dashboard
            </h1>
            <p className="text-xl md:text-2xl text-gray-500 font-medium max-w-2xl mx-auto leading-relaxed">
                Your entire curriculum, reachable at <br className="hidden md:inline" /> the speed of thought.
            </p>
         </div>
      </div> */}

      <div className="flex-1 w-full max-w-7xl mx-auto pt-28 px-6 py-8 space-y-8">
        
        {/* Main Notification Banner - Full Width */}
        {mainNotification && (
             <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <Card className="rounded-[2rem] overflow-hidden border-0 shadow-2xl bg-black text-white relative min-h-[100px] flex items-center justify-center group cursor-pointer transition-all hover:scale-[1.01]">
                    <Sheet>
                    <SheetTrigger asChild>
                    <div className="w-full h-full absolute inset-0 z-20" />
                    </SheetTrigger>
                    
                    {/* Abstract Apple-style mesh gradient */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_#3e3e3e,_#000000)] opacity-80 pointer-events-none" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] group-hover:bg-blue-600/30 transition-all duration-700 pointer-events-none" />
                    
                    <CardContent className="relative z-10 flex flex-col items-center text-center space-y-6 max-w-2xl mx-auto p-8 pointer-events-none">
                         <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10">
                            <span className="text-xs font-medium tracking-wide uppercase text-white/80">Update</span>
                         </div>
                        <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">{mainNotification.title}</h2>
                        <p className="text-lg text-gray-300 leading-relaxed line-clamp-2">
                            {mainNotification.message}
                        </p>
                        
                        <div className="flex flex-wrap items-center justify-center gap-4 pt-4 pointer-events-auto">
                            <Button size="lg" className="rounded-full bg-white text-black hover:bg-white/90 px-8 text-base h-12 pointer-events-none">
                                {mainNotification.timetable && mainNotification.timetable.length > 0 ? 'View Schedule' : 'View Details'}
                            </Button>
                            {mainNotification.link && (
                                <a href={mainNotification.link} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline hover:text-blue-300 flex items-center gap-1 relative z-30" onClick={(e) => e.stopPropagation()}>
                                    Learn more <ExternalLink className="h-4 w-4" />
                                </a>
                            )}
                        </div>
                    </CardContent>
                        <SheetContent>
                            <SheetHeader>
                                <SheetTitle>{mainNotification.type === 'general' ? 'Details' : 'Event'}</SheetTitle>
                                <SheetDescription>
                                        {mainNotification.title}
                                </SheetDescription>
                            </SheetHeader>
                            <div className="mt-6 space-y-6">
                                        {mainNotification.image && (
                                            <div className="rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                                                <img 
                                                    src={getDirectImageUrl(mainNotification.image)} 
                                                    alt={mainNotification.title} 
                                                    className="w-full h-auto object-cover" 
                                                />
                                            </div>
                                        )}
                                <div className="text-sm text-gray-600 leading-relaxed">
                                    {mainNotification.message}
                                </div>
                                {mainNotification.timetable && mainNotification.timetable.length > 0 && (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Subject</TableHead>
                                            <TableHead>Time</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {mainNotification.timetable.map((row, i) => (
                                            <TableRow key={i}>
                                                <TableCell className="font-medium">{row.date}</TableCell>
                                                <TableCell>{row.subject}</TableCell>
                                                <TableCell>{row.time}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                )}
                            </div>
                        </SheetContent>
                    </Sheet>
                </Card>
             </div>
        )}

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-[1080px] mx-auto">
            
            {/* Left Column: Recent Materials */}
            <div className="lg:col-span-2 space-y-8">
                <div className="flex items-center gap-2 mb-4">
                     <h2 className="text-2xl font-semibold tracking-tight text-black">New in Curriculum</h2>
                </div>

                {isLoading ? (
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {[1, 2].map((i) => (
                            <div key={i} className="aspect-[4/3] rounded-[2rem] bg-gray-200/50 animate-pulse" />
                        ))}
                    </div>
                ) : recentContent.length === 0 ? (
                    <Card className="border-0 shadow-none bg-white rounded-[2rem] h-64 flex flex-col items-center justify-center text-gray-400">
                        <Library className="h-10 w-10 mb-4 opacity-20" />
                        <p>No new materials.</p>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {recentContent.map((item) => (
                         <Link key={item._id} href={`/${item.unitId.subjectId.semesterId.degreeId.slug}/${item.unitId.subjectId.semesterId.slug}/${item.unitId.subjectId.slug}/read/${item._id}`}>
                            <div className="group relative bg-white rounded-[2rem] p-6 shadow-sm hover:scale-[1.03] transition-transform duration-300 ease-out cursor-pointer overflow-hidden border border-black/5 h-full">
                                <div className="flex flex-col h-full justify-between space-y-4">
                                    <div className="space-y-1.5 relative z-10">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block mb-1">
                                            {item.type}
                                        </span>
                                        <h3 className="text-xl font-bold text-black leading-tight group-hover:text-blue-600 transition-colors line-clamp-3">
                                            {item.title}
                                        </h3>
                                        <p className="text-sm text-gray-500 font-medium line-clamp-2">
                                            {item.unitId.name} &middot; {item.unitId.subjectId.name}
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between pt-2">
                                         <span className="text-xs font-medium text-gray-400">
                                            {new Date(item.createdAt).toLocaleDateString()}
                                         </span>
                                         <div className="h-8 w-8 rounded-full bg-black text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <ArrowRight className="h-3 w-3" />
                                         </div>
                                    </div>
                                </div>
                            </div>
                         </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Right Column: Notification Feed */}
            <div className="space-y-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-semibold tracking-tight text-black">Notices</h2>
                     {otherNotifications.length > 0 && <span className="flex h-2 w-2 rounded-full bg-blue-600" />}
                </div>

                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-black/5 min-h-[400px]">
                    {isLoading ? (
                        <div className="space-y-6">
                            {[1,2,3].map(i => <div key={i} className="h-20 rounded-xl bg-gray-100 animate-pulse" />)}
                        </div>
                    ) : otherNotifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center space-y-4">
                            <Bell className="h-8 w-8 opacity-20" />
                            <p>No new notices.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {otherNotifications.map((note, idx) => (
                                <Sheet key={note._id}>
                                    <SheetTrigger asChild>
                                <div className={cn("group cursor-pointer hover:bg-gray-50/50 transition-colors p-3 -mx-3 rounded-xl", idx !== otherNotifications.length - 1 && "border-b border-gray-100 pb-6 mb-2")}>
                                     <div className="flex items-start justify-between gap-4">
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-2">
                                                {/* Dot indicator for type */}
                                                <span className={cn("h-1.5 w-1.5 rounded-full", {
                                                    "bg-red-500": note.type === 'exam' || note.type === 'fees',
                                                    "bg-blue-500": note.type === 'general',
                                                    "bg-purple-500": note.type === 'seminar',
                                                    "bg-emerald-500": note.type === 'viva',
                                                })} />
                                                <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                                                    {new Date(note.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <h3 className="text-base font-semibold text-black leading-snug group-hover:text-blue-600 transition-colors">
                                                {note.title}
                                            </h3>
                                            <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">
                                                {note.message}
                                            </p>
                                        </div>
                                     </div>
                                    
                                    <div className="flex items-center gap-3 mt-3">
                                                <button className="text-xs font-medium text-blue-600 hover:underline flex items-center gap-1 pointer-events-none">
                                                    {note.type === 'exam' || (note.timetable && note.timetable.length > 0) ? 'Exam Schedule' : 'View Details'}
                                                </button>
                                        {note.link && (
                                            <a href={note.link} target="_blank" rel="noreferrer" className="text-xs font-medium text-blue-600 hover:underline flex items-center gap-1 relative z-30" onClick={(e) => e.stopPropagation()}>
                                                View Link <ExternalLink className="h-3 w-3" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                                    </SheetTrigger>
                                    <SheetContent>
                                        <SheetHeader>
                                            <SheetTitle>{note.title}</SheetTitle>
                                            <SheetDescription>{note.message}</SheetDescription>
                                        </SheetHeader>
                                        <div className="mt-6 space-y-6">
                                            {note.image && (
                                                <div className="rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                                                    <img 
                                                        src={getDirectImageUrl(note.image)} 
                                                        alt={note.title} 
                                                        className="w-full h-auto object-cover" 
                                                    />
                                                </div>
                                            )}
                                            <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                                                {note.message}
                                            </div>
                                            {note.timetable && note.timetable.length > 0 && (
                                                <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Date</TableHead>
                                                        <TableHead>Subject</TableHead>
                                                        <TableHead>Time</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {note.timetable.map((row, i) => (
                                                        <TableRow key={i}>
                                                            <TableCell className="font-medium">{row.date}</TableCell>
                                                            <TableCell>{row.subject}</TableCell>
                                                            <TableCell>{row.time}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                            )}
                                        </div>
                                    </SheetContent>
                                </Sheet>
                            ))}
                        </div>
                    )}
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}
