"use client";

import Link from "next/link";
import { USERS_COURSE } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { BookOpen, GraduationCap, ArrowRight, Library, MonitorPlay, Bell, FileText, Video as VideoIcon, ExternalLink, Calendar, Megaphone, CalendarClock, Clock, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
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

  return (
    <div className="flex flex-col min-h-screen bg-muted/10 pb-10">
      
      {/* Header / Welcome Area */}
      {/* Header / Welcome Area */}
      <div className="bg-background border-b pt-24 pb-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    Student Dashboard
                </h1>
                <p className="text-muted-foreground mt-2 text-lg">
                    Welcome back! Here's what's happening today.
                </p>
            </div>
            <Link href="/student/login">
                <Button className="gap-2">
                    <GraduationCap className="h-4 w-4" />
                    Student Login
                </Button>
            </Link>
        </div>
      </div>

      <div className="flex-1 w-full max-w-7xl mx-auto px-6 py-8 space-y-8">
        
        {/* Main Notification Banner - Full Width */}
        {mainNotification && (
             <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                <Card className="bg-gradient-to-r from-yellow-500/10 to-transparent border-l-4 border-l-yellow-500 border-y shadow-sm">
                    <CardContent className="flex flex-col md:flex-row items-center md:items-start gap-6 p-6">
                        <div className="bg-yellow-100 dark:bg-yellow-900/30 p-4 rounded-full shadow-inner shrink-0">
                            <Megaphone className="h-8 w-8 text-yellow-600 dark:text-yellow-400 animate-pulse" />
                        </div>
                        <div className="flex-1 space-y-2 text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start gap-3">
                                <h2 className="text-2xl font-bold text-foreground">{mainNotification.title}</h2>
                                <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-300">Important</Badge>
                            </div>
                            <p className="text-base text-muted-foreground leading-relaxed max-w-4xl">
                                {mainNotification.message}
                            </p>
                            
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-4">
                                {mainNotification.timetable && mainNotification.timetable.length > 0 && (
                                    <Sheet>
                                        <SheetTrigger asChild>
                                            <Button className="bg-yellow-600 hover:bg-yellow-700 text-white">
                                                <CalendarClock className="h-4 w-4 mr-2" /> View Exam Schedule
                                            </Button>
                                        </SheetTrigger>
                                        <SheetContent>
                                            <SheetHeader>
                                                <SheetTitle>Exam Timetable</SheetTitle>
                                                <SheetDescription>Schedule for {mainNotification.title}</SheetDescription>
                                            </SheetHeader>
                                            <div className="mt-6">
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
                                            </div>
                                        </SheetContent>
                                    </Sheet>
                                )}
                                {mainNotification.link && (
                                    <Button variant="outline" asChild>
                                        <a href={mainNotification.link} target="_blank" rel="noreferrer" className="flex items-center gap-2">
                                            More Details <ExternalLink className="h-4 w-4" />
                                        </a>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
             </div>
        )}

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Recent Study Materials (2/3 width) */}
            <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                         <div className="p-2 bg-primary/10 rounded-lg">
                            <Sparkles className="h-5 w-5 text-primary" />
                         </div>
                        <h2 className="text-xl font-bold tracking-tight">Recently Added Materials</h2>
                    </div>
                </div>

                {isLoading ? (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-48 rounded-xl bg-muted animate-pulse border" />
                        ))}
                    </div>
                ) : recentContent.length === 0 ? (
                    <Card className="border-dashed shadow-none bg-background/50">
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                            <Library className="h-12 w-12 mb-4 opacity-20" />
                            <p>No new study materials added recently.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {recentContent.map((item) => (
                         <Link key={item._id} href={`/${item.unitId.subjectId.semesterId.degreeId.slug}/${item.unitId.subjectId.semesterId.slug}/${item.unitId.subjectId.name}/read/${item._id}`}>
                            <Card className="h-full hover:shadow-lg hover:border-primary/40 transition-all duration-300 group overflow-hidden border-muted/60 bg-background cursor-pointer">
                                <div className={cn("h-1.5 w-full", item.type === 'video' ? "bg-blue-500" : "bg-orange-500")} />
                                <CardHeader className="pb-3 space-y-2">
                                    <div className="flex justify-between items-start gap-2">
                                        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
                                             <BookOpen className="h-3 w-3" />
                                             {item.unitId.subjectId.name}
                                        </div>
                                        <Badge variant="outline" className={cn("text-[10px] capitalize", item.type === 'video' ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-orange-50 text-orange-700 border-orange-200")}>
                                            {item.type}
                                        </Badge>
                                    </div>
                                    <CardTitle className="text-lg leading-snug group-hover:text-primary transition-colors line-clamp-2">
                                        {item.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pb-3">
                                     <p className="text-sm text-muted-foreground line-clamp-2">
                                        {item.unitId.name}
                                     </p>
                                </CardContent>
                                <CardFooter className="pt-0 text-xs text-muted-foreground flex items-center justify-between">
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {new Date(item.createdAt).toLocaleDateString()}
                                    </span>
                                    <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-primary" />
                                </CardFooter>
                            </Card>
                         </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Right Column: Notification Feed (1/3 width) */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-muted rounded-lg">
                            <Bell className="h-5 w-5 text-foreground" />
                        </div>
                        <h2 className="text-xl font-bold tracking-tight">Notice Board</h2>
                    </div>
                     <Badge variant="secondary" className="rounded-full">{otherNotifications.length} New</Badge>
                </div>

                <div className="bg-background rounded-xl border shadow-sm p-1 min-h-[500px]">
                    {isLoading ? (
                        <div className="space-y-4 p-4">
                            {[1,2,3].map(i => <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />)}
                        </div>
                    ) : otherNotifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-muted-foreground p-8 text-center">
                            <Bell className="h-10 w-10 mb-4 opacity-20" />
                            <p>All caught up! No active notices.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-0 divide-y">
                            {otherNotifications.map((note) => (
                                <div key={note._id} className="p-4 hover:bg-muted/30 transition-colors group">
                                     <div className="flex items-center justify-between mb-2">
                                        <Badge variant="outline" className={cn("text-[10px] uppercase font-bold tracking-wider rounded-sm", {
                                            "border-red-200 text-red-600 bg-red-50": note.type === 'exam' || note.type === 'fees',
                                            "border-blue-200 text-blue-600 bg-blue-50": note.type === 'general',
                                            "border-purple-200 text-purple-600 bg-purple-50": note.type === 'seminar',
                                            "border-emerald-200 text-emerald-600 bg-emerald-50": note.type === 'viva',
                                        })}>
                                            {note.type}
                                        </Badge>
                                        <span className="text-[10px] text-muted-foreground font-medium">
                                            {new Date(note.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h3 className="font-semibold text-sm mb-1 text-foreground/90 group-hover:text-primary transition-colors">{note.title}</h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 mb-2">
                                        {note.message}
                                    </p>
                                    
                                    <div className="flex items-center gap-3">
                                        {note.timetable && note.timetable.length > 0 && (
                                            <Sheet>
                                                <SheetTrigger asChild>
                                                    <Button size="sm" variant="ghost" className="h-7 text-[10px] px-2 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300">
                                                        <CalendarClock className="h-3 w-3 mr-1" /> View Schedule
                                                    </Button>
                                                </SheetTrigger>
                                                <SheetContent>
                                                    <SheetHeader>
                                                        <SheetTitle>Exam Timetable</SheetTitle>
                                                        <SheetDescription>Schedule for {note.title}</SheetDescription>
                                                    </SheetHeader>
                                                    <div className="mt-6">
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
                                                    </div>
                                                </SheetContent>
                                            </Sheet>
                                        )}
                                        {note.link && (
                                            <Button variant="link" asChild className="p-0 h-auto text-xs text-muted-foreground hover:text-primary">
                                                <a href={note.link} target="_blank" rel="noreferrer" className="flex items-center gap-1">
                                                    Open Link <ExternalLink className="h-3 w-3" />
                                                </a>
                                            </Button>
                                        )}
                                    </div>
                                </div>
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
