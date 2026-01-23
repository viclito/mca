"use client";

import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, ArrowRight, Table as TableIcon, Loader2, Info, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";

interface Information {
  _id: string;
  title: string;
  description?: string;
  columns: string[];
  permissionMode: "view-only" | "editable" | "edit-with-proof";
  active: boolean;
  createdAt: string;
}

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      type: "spring" as const, 
      stiffness: 300, 
      damping: 24 
    } 
  }
};

export default function StudentInformationListPage() {
  const { data: informationList = [], isLoading } = useQuery<Information[]>({
    queryKey: ["studentInformation"],
    queryFn: async () => {
      const res = await fetch("/api/student/information");
      if (!res.ok) throw new Error("Failed to fetch information");
      return res.json();
    },
  });

    return (
        <div className="min-h-screen bg-[#F4F7FB] p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* Header Bar with Breadcrumbs */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                            <span>/</span>
                            <span className="text-slate-600">Information</span>
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900">Administrative Resources</h1>
                    </div>
                </div>

                {/* Adaptive Two-Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Main Resources Column */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center gap-2 px-2">
                            <Info className="h-5 w-5 text-primary" />
                            <h2 className="text-lg font-bold text-slate-800">Shared Data Tables</h2>
                        </div>

                        {informationList.length === 0 ? (
                            <div className="bg-white p-12 rounded-xl border border-slate-200 flex flex-col items-center justify-center text-center">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                                    <FileSpreadsheet className="h-8 w-8 text-slate-300" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-800">No resources shared yet</h3>
                                <p className="text-sm text-slate-500 mt-1 max-w-xs">
                                    Administrative resources and shared data tables will appear here once they are published.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {informationList.map((info) => (
                                    <Card key={info._id} className="group border border-slate-200 shadow-none hover:shadow-md transition-all duration-300 bg-white rounded-xl overflow-hidden flex flex-col h-full">
                                        <CardHeader className="p-6 pb-4">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="p-2.5 rounded-lg bg-primary/5 group-hover:bg-primary transition-colors">
                                                    <TableIcon className="h-5 w-5 text-primary group-hover:text-white" />
                                                </div>
                                                <Badge className="bg-slate-50 text-slate-500 border-slate-200 flex items-center gap-1 font-bold text-[10px] uppercase shadow-none">
                                                    {info.permissionMode.replace(/-/g, ' ')}
                                                </Badge>
                                            </div>
                                            <CardTitle className="text-lg font-bold text-slate-800 group-hover:text-primary transition-colors">
                                                {info.title}
                                            </CardTitle>
                                            <CardDescription className="line-clamp-2 mt-2 text-slate-500 font-medium leading-relaxed min-h-[40px]">
                                                {info.description || "Administrative data shared for your reference and action."}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="p-6 pt-0 flex-1">
                                            <div className="pt-4 border-t border-slate-50 grid grid-cols-2 gap-4">
                                                <div className="space-y-0.5">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Structure</p>
                                                    <p className="text-xs font-bold text-slate-700">{info.columns.length} Columns</p>
                                                </div>
                                                <div className="space-y-0.5">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Shared On</p>
                                                    <p className="text-xs font-bold text-slate-700">{new Date(info.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                        <CardFooter className="p-6 pt-0">
                                            <Link href={`/student/information/${info._id}`} className="w-full">
                                                <Button className="w-full h-10 font-bold shadow-sm rounded-lg group/btn active:scale-[0.98]">
                                                    Open Table 
                                                    <ArrowRight className="ml-2 h-3.5 w-3.5 group-hover/btn:translate-x-1 transition-transform" />
                                                </Button>
                                            </Link>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Information Sidebar */}
                    <div className="space-y-6">
                        <Card className="border-none shadow-sm rounded-xl overflow-hidden bg-white">
                            <CardHeader className="border-b border-slate-100 pb-4">
                                <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-wider">About Resources</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-4">
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    These tables are provided by the administration to share important data, track progress, or collect specific informational updates.
                                </p>
                                <div className="space-y-3 pt-2">
                                    <div className="flex gap-3">
                                        <div className="mt-1 p-1 bg-green-50 rounded border border-green-100">
                                            <CheckCircle className="h-3 w-3 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-700">View Data</p>
                                            <p className="text-[11px] text-slate-500 font-medium">Access shared lists and records.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="mt-1 p-1 bg-blue-50 rounded border border-blue-100">
                                            <Clock className="h-3 w-3 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-700">Live Updates</p>
                                            <p className="text-[11px] text-slate-500 font-medium">Stay updated with administrative changes.</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-sm rounded-xl overflow-hidden bg-gradient-to-br from-[#1e293b] to-[#0f172a] text-white">
                            <CardContent className="p-6 space-y-4">
                                <div className="p-3 bg-white/10 rounded-xl w-fit">
                                    <Info className="h-6 w-6 text-blue-400" />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-bold text-lg leading-tight">Usage Guidelines</h4>
                                    <p className="text-white/70 text-xs font-medium leading-relaxed">
                                        Some tables may allow direct editing. Please ensure all data entered is accurate and follows institutional policy.
                                    </p>
                                </div>
                                <Button variant="secondary" size="sm" className="w-full font-bold bg-white/10 hover:bg-white/20 text-white border-none mt-2">
                                    Policy Guidelines
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
