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

  return (
    <div className="container mx-auto py-10 px-4 max-w-5xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Forms & Surveys</h1>
        <p className="text-muted-foreground mt-2">Complete the required forms below.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {isLoading ? (
          <p>Loading forms...</p>
        ) : forms.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground bg-gray-50 rounded-lg border-2 border-dashed">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
             <p>No active forms at the moment.</p>
          </div>
        ) : (
          forms.map((form) => (
            <Card key={form._id} className="flex flex-col border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-xl">{form.title}</CardTitle>
                     {form.submitted ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <CheckCircle className="w-3 h-3 mr-1" /> Submitted
                        </Badge>
                     ) : (
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                            <Clock className="w-3 h-3 mr-1" /> Pending
                        </Badge>
                     )}
                </div>
                <CardDescription className="line-clamp-2">
                  {form.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                 <p className="text-sm text-gray-500">
                    Posted on: {new Date(form.createdAt).toLocaleDateString()}
                 </p>
              </CardContent>
              <CardFooter className="pt-4 border-t bg-gray-50/50">
                 {form.submitted ? (
                     <Button variant="ghost" disabled className="w-full">
                        Response Recorded
                     </Button>
                 ) : (
                    <Link href={`/student/forms/${form._id}`} className="w-full">
                        <Button className="w-full">Fill Form</Button>
                    </Link>
                 )}
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
