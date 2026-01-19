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
import { Loader2, CheckCircle, ArrowLeft } from "lucide-react";
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
        <div className="max-w-2xl mx-auto py-10 px-4">
             <Link href="/student/forms" className="inline-flex items-center text-sm text-gray-500 mb-6 hover:text-black">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Forms
            </Link>

            <Card className="border-t-4 border-t-blue-600 shadow-lg">
                <CardHeader className="space-y-4 text-center pb-8 border-b bg-gray-50/50">
                    <CardTitle className="text-3xl">{form.title}</CardTitle>
                    {form.description && <CardDescription className="text-lg">{form.description}</CardDescription>}
                </CardHeader>
                <CardContent className="pt-8 space-y-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {form.fields && form.fields.map((field: FormField) => (
                            <div key={field.id} className="space-y-3">
                                <Label className="text-base font-semibold">
                                    {field.label} {field.required && <span className="text-red-500">*</span>}
                                </Label>
                                
                                {field.type === "text" && (
                                    <Input 
                                        required={field.required}
                                        placeholder={field.placeholder}
                                        value={responses[field.id] || ""}
                                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                                        className="h-11"
                                    />
                                )}
                                
                                {field.type === "number" && (
                                    <Input 
                                        type="number"
                                        required={field.required}
                                        placeholder={field.placeholder}
                                        value={responses[field.id] || ""}
                                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                                        className="h-11"
                                    />
                                )}

                                {field.type === "textarea" && (
                                    <Textarea 
                                        required={field.required}
                                        placeholder={field.placeholder}
                                        value={responses[field.id] || ""}
                                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                                        className="min-h-[120px] resize-y"
                                    />
                                )}

                                {field.type === "select" && (
                                     <Select 
                                        required={field.required} 
                                        onValueChange={(v) => handleInputChange(field.id, v)}
                                        value={responses[field.id] || ""}
                                    >
                                        <SelectTrigger className="h-11">
                                            <SelectValue placeholder="Select an option" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {field.options?.map((opt) => (
                                                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}

                                 {/* Date, File types can be added similarly */}
                                 {field.type === "date" && (
                                    <Input 
                                        type="date"
                                        required={field.required}
                                        value={responses[field.id] || ""}
                                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                                        className="h-11"
                                    />
                                 )}
                            </div>
                        ))}

                        <div className="pt-6">
                            <Button type="submit" size="lg" className="w-full text-lg h-12" disabled={submitMutation.isPending}>
                                {submitMutation.isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                                Submit Response
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
