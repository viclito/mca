"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { FileText, CheckCircle, Clock } from "lucide-react";
import { useSession } from "next-auth/react"; // Use session to check status

interface Form {
  _id: string;
  title: string;
  description: string;
  status: "active" | "closed";
  createdAt: string;
  submissions?: any[]; // To check if user submitted? logic needs to be better
}

export default function StudentFormsPage() {
  const { data: session } = useSession(); // We need session to know if student submitted. 
  // Actually, the API should tell us if THIS user submitted.
  // I need to update the API /api/student/forms to only return active forms and include "submitted: boolean" flag.
  
  // Wait, I haven't created /api/student/forms. 
  // I can use /api/admin/forms but that returns everything. 
  // Better to create a specific API or filter on client (less secure/efficient).
  // Let's assume I'll create a simple API endpoint for students or use query params on existing.
  // For now, I'll fetch all and filter client side, but 'submitted' status is tricky without checking submissions.
  
  // Let's create the page assuming I'll fetch `/api/student/forms` which returns { forms: [], submissions: [] } or forms with status.
  
  const { data: forms = [], isLoading } = useQuery<any[]>({
    queryKey: ["student-forms"],
    queryFn: async () => {
      // Create this API next!
      const res = await fetch("/api/student/forms"); 
      if (!res.ok) throw new Error("Failed to fetch forms");
      return res.json();
    },
  });

  const submittedCount = forms.filter(f => f.submitted).length;
  const pendingCount = forms.length - submittedCount;

    return (
        <div className="min-h-screen bg-[#F4F7FB] p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* Header Bar with Breadcrumbs */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                            <span>/</span>
                            <span className="text-slate-600">Forms</span>
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900">Forms & Surveys</h1>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Forms Listing Area */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center gap-2 px-2">
                            <FileText className="h-5 w-5 text-primary" />
                            <h2 className="text-lg font-bold text-slate-800">Available Forms</h2>
                        </div>

                        {isLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="h-48 bg-white rounded-xl border border-slate-200 animate-pulse" />
                                ))}
                            </div>
                        ) : forms.length === 0 ? (
                            <div className="bg-white p-12 rounded-xl border border-slate-200 flex flex-col items-center justify-center text-center">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                                    <FileText className="h-8 w-8 text-slate-300" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-800">No active forms</h3>
                                <p className="text-sm text-slate-500 mt-1 max-w-xs">
                                    You don't have any pending forms or surveys to complete right now.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {forms.map((form) => (
                                    <Card key={form._id} className="group border border-slate-200 shadow-none hover:shadow-md transition-all duration-300 bg-white rounded-xl overflow-hidden flex flex-col">
                                        <CardHeader className="pb-4">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className={`p-2 rounded-lg ${form.submitted ? 'bg-green-50' : 'bg-primary/5'}`}>
                                                    <FileText className={`h-5 w-5 ${form.submitted ? 'text-green-600' : 'text-primary'}`} />
                                                </div>
                                                {form.submitted ? (
                                                    <Badge className="bg-green-50 text-green-700 border-green-100 flex items-center gap-1 font-bold text-[10px] uppercase shadow-none">
                                                        <CheckCircle className="h-3 w-3" /> Submitted
                                                    </Badge>
                                                ) : (
                                                    <Badge className="bg-amber-50 text-amber-700 border-amber-100 flex items-center gap-1 font-bold text-[10px] uppercase shadow-none">
                                                        <Clock className="h-3 w-3" /> Action Required
                                                    </Badge>
                                                )}
                                            </div>
                                            <CardTitle className="text-lg text-slate-800 group-hover:text-primary transition-colors">{form.title}</CardTitle>
                                            <CardDescription className="line-clamp-2 mt-2 text-slate-500 font-medium leading-relaxed">
                                                {form.description || "No description provided."}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="flex-1 pb-6">
                                            <div className="text-[12px] font-bold text-slate-400 flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                                                Posted {new Date(form.createdAt).toLocaleDateString()}
                                            </div>
                                        </CardContent>
                                        <CardFooter className="pt-0 border-none bg-slate-50/50 p-6">
                                            {form.submitted ? (
                                                <Button variant="outline" disabled className="w-full h-10 border-slate-200 bg-white opacity-60 font-bold text-slate-400">
                                                    Locked: Response Recorded
                                                </Button>
                                            ) : (
                                                <Link href={`/student/forms/${form._id}`} className="w-full">
                                                    <Button className="w-full h-10 font-bold shadow-sm rounded-lg transition-all active:scale-[0.98]">
                                                        Start Filling
                                                    </Button>
                                                </Link>
                                            )}
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sidebar Area */}
                    <div className="space-y-6">
                        {/* Stats Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Statistical Overview</h3>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-50 rounded-lg">
                                            <FileText className="h-4 w-4 text-blue-600" />
                                        </div>
                                        <span className="text-sm font-bold text-slate-700">Total Assigned</span>
                                    </div>
                                    <span className="text-xl font-black text-slate-900">{forms.length}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-amber-50 rounded-lg">
                                            <Clock className="h-4 w-4 text-amber-600" />
                                        </div>
                                        <span className="text-sm font-bold text-slate-700">Pending Tasks</span>
                                    </div>
                                    <span className="text-xl font-black text-amber-600">{pendingCount}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-green-50 rounded-lg">
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                        </div>
                                        <span className="text-sm font-bold text-slate-700">Completed</span>
                                    </div>
                                    <span className="text-xl font-black text-green-600">{submittedCount}</span>
                                </div>
                            </div>
                            <div className="px-6 pb-6 pt-2 border-t border-slate-50">
                                <p className="text-[11px] text-slate-400 font-medium leading-relaxed italic">
                                    Academic surveys and administrative forms help us improve your student experience.
                                </p>
                            </div>
                        </div>

                        {/* Banner/Support Card */}
                        <div className="bg-gradient-to-br from-primary to-primary/80 rounded-xl shadow-lg p-6 text-white overflow-hidden relative group">
                            <div className="relative z-10 space-y-3">
                                <h4 className="font-bold text-lg leading-tight">Need assistance?</h4>
                                <p className="text-white/80 text-xs font-medium leading-relaxed">
                                    If you're unable to access a form, please contact your department coordinator.
                                </p>
                                <Button variant="secondary" size="sm" className="w-full font-bold bg-white text-primary border-none hover:bg-slate-100 mt-2">
                                    Support Center
                                </Button>
                            </div>
                            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                                <FileText className="h-24 w-24" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
