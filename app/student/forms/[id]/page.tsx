"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle, ArrowLeft, FileText } from "lucide-react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";


interface FormField {
    id: string;
    label: string;
    type: "text" | "number" | "textarea" | "select" | "file" | "date";
    placeholder?: string;
    required: boolean;
    options?: string[];
}

export default function FillFormPage() {
    const params = useParams();
    const router = useRouter();
    const formId = params.id as string;
    const { data: session } = useSession();
    // const { toast } = useToast(); // If using UI toast

    const [responses, setResponses] = useState<Record<string, any>>({});
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const { data: form, isLoading, error } = useQuery({
        queryKey: ["fill-form", formId],
        queryFn: async () => {
            // Re-using admin endpoint for getting form details or creating a specific one? 
            // Admin endpoint returns full form. But wait, that might be protected.
            // Let's modify /api/student/forms?id=... or just use a specific one.
            // Actually, /api/admin/forms/[id] doesn't exist? I made bulk GET. 
            // Let's assume I can fetch the form schema via a public/student route.
            // I'll create a quick route: /api/student/forms/[id]
            const res = await fetch(`/api/student/forms/${formId}`);
            if (!res.ok) throw new Error("Failed to fetch form");
            return res.json();
        }
    });

    const submitMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch("/api/forms/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    formId,
                    studentId: session?.user?.id,
                    responses: data
                }),
            });
            if (!res.ok) {
                const msg = await res.text();
                throw new Error(msg);
            }
            return res.json();
        },
        onSuccess: () => {
            setSuccess(true);
            setTimeout(() => router.push("/student/forms"), 2000);
        },
        onError: (err) => {
            alert(err.message); // Replace with toast later
        }
    });

    const handleInputChange = (fieldId: string, value: any) => {
        setResponses(prev => ({ ...prev, [fieldId]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Basic validation
        if (!session?.user) {
            alert("You must be logged in.");
            return;
        }
        submitMutation.mutate(responses);
    };

    if (isLoading) return <div className="p-10 text-center">Loading form...</div>;
    if (error) return <div className="p-10 text-center text-red-500">Error: {(error as Error).message}</div>;
    if (success) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500 animate-bounce" />
            <h2 className="text-2xl font-bold">Submission Received!</h2>
            <p className="text-muted-foreground">Redirecting you back...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F4F7FB] p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* Dashboard-Style Header Bar */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                            <span>/</span>
                            <Link href="/student/forms" className="hover:text-primary transition-colors">Forms</Link>
                            <span>/</span>
                            <span className="text-slate-600">Submit Response</span>
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900">Add New Response</h1>
                    </div>
                </div>

                {/* Adaptive Two-Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Main Form Column */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="border-none shadow-sm rounded-xl overflow-hidden">
                            <CardHeader className="border-b border-slate-100 bg-white py-5">
                                <CardTitle className="text-lg font-bold text-slate-800">Submission Content</CardTitle>
                                <CardDescription>Enter the required details for "{form.title}"</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 md:p-8">
                                <form onSubmit={handleSubmit} className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                        {form.fields && form.fields.map((field: FormField) => {
                                            const isFullWidth = field.type === "textarea" || field.type === "file";
                                            return (
                                                <div key={field.id} className={`space-y-2 ${isFullWidth ? 'md:col-span-2' : ''}`}>
                                                    <Label className="text-sm font-bold text-slate-700">
                                                        {field.label} {field.required && <span className="text-red-500">*</span>}
                                                    </Label>
                                                    
                                                    <div className="space-y-1.5">
                                                        {field.type === "text" && (
                                                            <Input 
                                                                required={field.required}
                                                                placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                                                                value={responses[field.id] || ""}
                                                                onChange={(e) => handleInputChange(field.id, e.target.value)}
                                                                className="h-11 border-slate-200 rounded-lg focus-visible:ring-1 focus-visible:ring-primary shadow-none bg-slate-50/30"
                                                            />
                                                        )}
                                                        
                                                        {field.type === "number" && (
                                                            <Input 
                                                                type="number"
                                                                required={field.required}
                                                                placeholder={field.placeholder || "0"}
                                                                value={responses[field.id] || ""}
                                                                onChange={(e) => handleInputChange(field.id, e.target.value)}
                                                                className="h-11 border-slate-200 rounded-lg focus-visible:ring-1 focus-visible:ring-primary shadow-none bg-slate-50/30"
                                                            />
                                                        )}

                                                        {field.type === "textarea" && (
                                                            <Textarea 
                                                                required={field.required}
                                                                placeholder={field.placeholder || "Provide detailed information..."}
                                                                value={responses[field.id] || ""}
                                                                onChange={(e) => handleInputChange(field.id, e.target.value)}
                                                                className="min-h-[140px] border-slate-200 rounded-lg focus-visible:ring-1 focus-visible:ring-primary shadow-none bg-slate-50/30 resize-none"
                                                            />
                                                        )}

                                                        {field.type === "select" && (
                                                             <Select 
                                                                required={field.required} 
                                                                onValueChange={(v) => handleInputChange(field.id, v)}
                                                                value={responses[field.id] || ""}
                                                            >
                                                                <SelectTrigger className="h-11 border-slate-200 rounded-lg focus-visible:ring-1 focus-visible:ring-primary shadow-none bg-slate-50/30">
                                                                    <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                                                                </SelectTrigger>
                                                                <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                                                                    {field.options?.filter(opt => opt && opt.trim() !== "").map((opt) => (
                                                                        <SelectItem key={opt} value={opt} className="rounded-lg">{opt}</SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        )}

                                                         {field.type === "date" && (
                                                            <Input 
                                                                type="date"
                                                                required={field.required}
                                                                value={responses[field.id] || ""}
                                                                onChange={(e) => handleInputChange(field.id, e.target.value)}
                                                                className="h-11 border-slate-200 rounded-lg focus-visible:ring-1 focus-visible:ring-primary shadow-none bg-slate-50/30"
                                                            />
                                                         )}

                                                         {field.type === "file" && (
                                                             <label className="flex flex-col items-center justify-center w-full min-h-[140px] border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-all cursor-pointer group">
                                                                 <div className="flex flex-col items-center justify-center py-4">
                                                                     <div className="p-3 bg-white rounded-lg shadow-sm mb-3 group-hover:scale-110 transition-transform border border-slate-100">
                                                                         <CheckCircle className={`h-6 w-6 ${responses[field.id] ? 'text-green-500' : 'text-slate-400'}`} />
                                                                     </div>
                                                                     <p className="text-sm font-bold text-slate-700">
                                                                         {responses[field.id] ? responses[field.id].name : "Upload File Attachment"}
                                                                     </p>
                                                                     <p className="text-[11px] text-slate-400 mt-1 uppercase font-bold tracking-tighter">
                                                                         {responses[field.id] ? `(${(responses[field.id].size / 1024).toFixed(1)} KB)` : "Assignments, PDF, or Images"}
                                                                     </p>
                                                                 </div>
                                                                 <input 
                                                                    type="file"
                                                                    required={field.required && !responses[field.id]}
                                                                    className="hidden"
                                                                    onChange={async (e) => {
                                                                        const file = e.target.files?.[0];
                                                                        if (file) {
                                                                            const reader = new FileReader();
                                                                            reader.onloadend = () => {
                                                                                handleInputChange(field.id, {
                                                                                    name: file.name,
                                                                                    type: file.type,
                                                                                    size: file.size,
                                                                                    data: reader.result
                                                                                });
                                                                            };
                                                                            reader.readAsDataURL(file);
                                                                        }
                                                                    }}
                                                                 />
                                                             </label>
                                                         )}
                                                    </div>
                                                    {field.placeholder && <p className="text-[11px] text-slate-400 font-medium">Example: {field.placeholder}</p>}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Responsive Action Buttons */}
                                    <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row gap-4">
                                        <Button 
                                            type="button"
                                            variant="outline"
                                            onClick={() => router.push("/student/forms")}
                                            className="h-11 px-8 border-slate-200 font-bold text-slate-600 rounded-lg hover:bg-slate-50 order-2 md:order-1"
                                        >
                                            Cancel
                                        </Button>
                                        <Button 
                                            type="submit" 
                                            disabled={submitMutation.isPending}
                                            className="h-11 px-10 font-bold shadow-md rounded-lg flex-1 md:flex-none order-1 md:order-2"
                                        >
                                            {submitMutation.isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                                            Create Submission
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar Column */}
                    <div className="space-y-6">
                        <Card className="border-none shadow-sm rounded-xl overflow-hidden bg-white">
                            <CardHeader className="border-b border-slate-100 pb-4">
                                <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-wider">Status</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-500">Current Status</span>
                                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-600 border border-amber-100">Pending Submission</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-500">Assigned Date</span>
                                    <span className="text-sm font-bold text-slate-700">{new Date(form.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="pt-4 border-t border-slate-50">
                                    <p className="text-[12px] text-slate-400 leading-relaxed italic">
                                        Once submitted, your response will be automatically reviewed by the course administrators.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-sm rounded-xl overflow-hidden bg-white">
                            <CardHeader className="border-b border-slate-100 pb-4">
                                <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-wider">Help & Support</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                                    Need help with this form? Contact your administrator or check the student guidelines.
                                </p>
                                <Button variant="secondary" className="w-full text-xs font-bold uppercase tracking-widest bg-slate-100 hover:bg-slate-200 text-slate-600 border-none">
                                    View Guidelines
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
