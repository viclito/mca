"use client";

import { useState, useEffect } from "react";

import Link from "next/link";
import Image from "next/image";
import { USERS_COURSE } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { BookOpen, GraduationCap, ArrowRight, Library, MonitorPlay, Bell, FileText, Video as VideoIcon, ExternalLink, Calendar, Megaphone, CalendarClock, Clock, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  type: "exam" | "fees" | "general" | "seminar" | "viva" | "image";
  link?: string;
  image?: string;
  images?: string[];
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
  const { data: session, update } = useSession();
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

  // Check for missing name
  const [showNameModal, setShowNameModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [updatingName, setUpdatingName] = useState(false);

  useEffect(() => {
    const checkName = async () => {
        if (session?.user && (!session.user.name || session.user.name === "Student")) {
            // Session says no name. Let's double check with the DB just in case session is stale.
            try {
                const res = await fetch("/api/user/profile");
                if (res.ok) {
                    const data = await res.json();
                    if (data.user?.name && data.user.name !== "Student") {
                        // DB has name! Session is stale. Update it.
                        await update({ name: data.user.name });
                        return; // Don't show modal
                    }
                }
            } catch (e) {
                console.error("Failed to verify name", e);
            }
            // If we get here, name is really missing.
            setShowNameModal(true);
        }
    };
    
    if (session?.user) {
        checkName();
    }
  }, [session, update]);

  const handleNameUpdate = async () => {
    if (!newName.trim()) return;
    setUpdatingName(true);
    try {
        const res = await fetch("/api/user/profile", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: newName })
        });
        
        if (res.ok) {
            await update({ name: newName });
            setShowNameModal(false);
        } else {
            alert("Failed to update name");
        }
    } catch (error) {
        console.error("Error:", error);
    } finally {
        setUpdatingName(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F5F7] pb-20">
      <Dialog open={showNameModal} onOpenChange={setShowNameModal}>
        <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Complete Your Profile</DialogTitle>
            <DialogDescription>
              Please enter your full name to continue. This looks better on your certificates and dashboard.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="col-span-3"
                placeholder="John Doe"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleNameUpdate} disabled={updatingName || !newName.trim()}>
              {updatingName ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="hidden md:block bg-white/70 backdrop-blur-xl border-b border-slate-100 sticky top-0 w-full z-40 transition-all duration-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-12 px-6">
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
                    <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold ring-2 ring-white shadow-sm">
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

      {/* Hero Area */}
      {/* <div className="pt-28 pb-12 px-6">
         <div className="max-w-[980px] mx-auto text-center space-y-4">
            <h1 className="text-5xl md:text-7xl font-semibold tracking-tight text-black">
                Student Dashboard
            </h1>
         </div>
      </div> */}

      <div className="flex-1 w-full max-w-7xl mx-auto pt-4 md:pt-10 px-6 py-8 space-y-8">
        
        {/* Main Notification Banner - Full Width */}
        {mainNotification && (
             <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <Card className="rounded-[2rem] overflow-hidden border-0 shadow-2xl bg-black text-white relative min-h-[150px] flex items-center justify-center group cursor-pointer transition-all hover:scale-[1.01]">
                    <Sheet>
                    <SheetTrigger asChild>
                        <div className="w-full h-full absolute inset-0 z-10" />
                    </SheetTrigger>
                    
                    {/* Precise background gradient and compact height matching reference */}
                    <div className="absolute inset-0 bg-black pointer-events-none" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_#064e3b_0%,_transparent_70%)] opacity-60 pointer-events-none" />
                    
                    <CardContent className="relative z-10 flex flex-col items-center text-center space-y-5 max-w-4xl mx-auto p-8 md:p-10 pointer-events-none">
                         <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 backdrop-blur-md border border-white/10">
                            <span className="text-[9px] font-bold tracking-widest uppercase text-white/40">Update</span>
                         </div>
                        <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-white px-4">
                            {mainNotification.title}
                        </h2>
                        <p className="text-sm md:text-base text-gray-300/80 leading-relaxed line-clamp-2 whitespace-pre-wrap max-w-2xl px-6">
                            {mainNotification.message}
                        </p>
                        
                        <div className="flex flex-wrap items-center justify-center gap-6 pt-2 pointer-events-auto relative z-20">
                            <SheetTrigger asChild>
                                <Button size="lg" className="rounded-full bg-white text-black hover:bg-white/90 px-8 text-sm h-12 font-semibold shadow-xl shadow-white/5 active:scale-95 transition-all cursor-pointer">
                                    View Details
                                </Button>
                            </SheetTrigger>
                            {mainNotification.link && (
                                <a 
                                    href={mainNotification.link} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="text-emerald-500 hover:text-emerald-400 text-sm font-medium flex items-center gap-1.5 transition-all group"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    Learn more <ExternalLink className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                                </a>
                            )}
                        </div>
                    </CardContent>
                        <SheetContent className="overflow-y-auto">
                            <SheetHeader>
                                <SheetTitle>{mainNotification.type === 'general' ? 'Details' : 'Event'}</SheetTitle>
                                <SheetDescription>
                                        {mainNotification.title}
                                </SheetDescription>
                            </SheetHeader>
                            <div className="mt-6 space-y-6">
                                        {/* Display multiple images for image notifications */}
                                        {mainNotification.type === "image" && mainNotification.images && mainNotification.images.length > 0 && (
                                            <div className="space-y-3">
                                                {mainNotification.images.map((img, idx) => (
                                                    <div key={idx} className="rounded-xl overflow-hidden border border-gray-100 shadow-sm relative min-h-[200px]">
                                                        <Image 
                                                            src={getDirectImageUrl(img)} 
                                                            alt={`${mainNotification.title} - Image ${idx + 1}`} 
                                                            fill
                                                            className="object-cover" 
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {/* Display single image for backward compatibility */}
                                        {mainNotification.type !== "image" && mainNotification.image && (
                                            <div className="rounded-xl overflow-hidden border border-gray-100 shadow-sm relative min-h-[200px]">
                                                <Image 
                                                    src={getDirectImageUrl(mainNotification.image)} 
                                                    alt={mainNotification.title} 
                                                    fill
                                                    className="object-cover" 
                                                />
                                            </div>
                                        )}
                                {mainNotification.message && (
                                    <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                                        {mainNotification.message}
                                    </div>
                                )}
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
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block mb-1">
                                            {item.type}
                                        </span>
                                        <h3 className="text-xl font-bold text-black leading-tight group-hover:text-emerald-600 transition-colors line-clamp-3">
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
                     {otherNotifications.length > 0 && <span className="flex h-2 w-2 rounded-full bg-emerald-600" />}
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
                                        <div className="space-y-1.5 flex-1">
                                            <div className="flex items-center gap-2">
                                                {/* Dot indicator for type */}
                                                <span className={cn("h-1.5 w-1.5 rounded-full", {
                                                    "bg-red-500": note.type === 'exam' || note.type === 'fees',
                                                    "bg-emerald-500": note.type === 'viva' || note.type === 'general',
                                                    "bg-purple-500": note.type === 'seminar',
                                                    "bg-pink-500": note.type === 'image',
                                                })} />
                                                <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                                                    {new Date(note.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <h3 className="text-base font-semibold text-black leading-snug group-hover:text-emerald-600 transition-colors">
                                                {note.title}
                                            </h3>
                                            {/* Show image preview for image notifications */}
                                            {note.type === "image" && note.images && note.images.length > 0 && (
                                                <div className="flex gap-2 mt-2">
                                                    {note.images.slice(0, 3).map((img, imgIdx) => (
                                                        <div key={imgIdx} className="w-16 h-16 rounded-md overflow-hidden border border-gray-200">
                                                            <img 
                                                                src={getDirectImageUrl(img)} 
                                                                alt={`Preview ${imgIdx + 1}`} 
                                                                className="w-full h-full object-cover" 
                                                            />
                                                        </div>
                                                    ))}
                                                    {note.images.length > 3 && (
                                                        <div className="w-16 h-16 rounded-md bg-gray-100 flex items-center justify-center border border-gray-200">
                                                            <span className="text-xs font-semibold text-gray-500">+{note.images.length - 3}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            {/* Show message preview for non-image notifications */}
                                            {note.type !== "image" && note.message && (
                                                <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 whitespace-pre-wrap">
                                                    {note.message}
                                                </p>
                                            )}
                                        </div>
                                     </div>
                                    
                                    <div className="flex items-center gap-3 mt-4">
                                        <div className="px-4 py-1.5 rounded-full bg-emerald-600 text-white text-[11px] font-bold uppercase tracking-tight hover:bg-emerald-700 transition-all duration-300 shadow-sm active:scale-95">
                                            {note.type === 'exam' || (note.timetable && note.timetable.length > 0) ? 'Exam Schedule' : 'View Details'}
                                        </div>
                                        {note.link && (
                                            <a 
                                                href={note.link} 
                                                target="_blank" 
                                                rel="noreferrer" 
                                                className="h-7 px-3 rounded-full bg-gray-100 text-gray-700 text-[11px] font-medium flex items-center gap-1.5 hover:bg-emerald-600 hover:text-white transition-all relative z-30 active:scale-95" 
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                Link <ExternalLink className="h-3 w-3 text-emerald-600" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                                    </SheetTrigger>
                                    <SheetContent className="overflow-y-auto">
                                        <SheetHeader>
                                            <SheetTitle>{note.title}</SheetTitle>
                                            <SheetDescription>{note.message}</SheetDescription>
                                        </SheetHeader>
                                        <div className="mt-6 space-y-6">
                                            {/* Display multiple images for image notifications */}
                                            {note.type === "image" && note.images && note.images.length > 0 && (
                                                <div className="space-y-3">
                                                    {note.images.map((img, idx) => (
                                                        <div key={idx} className="rounded-xl overflow-hidden border border-gray-100 shadow-sm relative min-h-[200px]">
                                                            <Image 
                                                                src={getDirectImageUrl(img)} 
                                                                alt={`${note.title} - Image ${idx + 1}`} 
                                                                fill
                                                                className="object-cover" 
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {/* Display single image for backward compatibility */}
                                            {note.type !== "image" && note.image && (
                                                <div className="rounded-xl overflow-hidden border border-gray-100 shadow-sm relative min-h-[200px]">
                                                    <Image 
                                                        src={getDirectImageUrl(note.image)} 
                                                        alt={note.title} 
                                                        fill
                                                        className="object-cover" 
                                                    />
                                                </div>
                                            )}
                                            {note.message && (
                                                <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                                                    {note.message}
                                                </div>
                                            )}
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
