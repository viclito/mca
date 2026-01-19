"use client";

import { useState } from "react";
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
import { Plus, Loader2, FileText, BarChart3, Pencil, Trash } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Form {
  _id: string;
  title: string;
  description: string;
  status: "draft" | "active" | "closed";
  createdAt: string;
  fields: any[];
}

export default function AdminFormsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: forms = [], isLoading } = useQuery<Form[]>({
    queryKey: ["admin-forms"],
    queryFn: async () => {
      const res = await fetch("/api/admin/forms");
      if (!res.ok) throw new Error("Failed to fetch forms");
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/admin/forms?id=${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-forms"] });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Forms</h2>
          <p className="text-muted-foreground">Create and manage data collection forms.</p>
        </div>
        <Link href="/admin/forms/builder">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Create Form
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <p>Loading forms...</p>
        ) : forms.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg text-muted-foreground bg-gray-50/50">
            <FileText className="h-12 w-12 mb-4 opacity-20" />
            <p>No forms created yet.</p>
            <Link href="/admin/forms/builder" className="mt-4">
               <Button variant="outline">Create your first form</Button>
            </Link>
          </div>
        ) : (
          forms.map((form) => (
            <Card key={form._id} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start gap-2">
                    <CardTitle className="line-clamp-1">{form.title}</CardTitle>
                    <Badge variant={form.status === "active" ? "default" : "secondary"}>
                      {form.status}
                    </Badge>
                </div>
                <CardDescription className="line-clamp-2">
                  {form.description || "No description provided."}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                 <p className="text-xs text-muted-foreground">
                    {form.fields.length} fields defined
                 </p>
                 <p className="text-xs text-muted-foreground mt-1">
                    Created: {new Date(form.createdAt).toLocaleDateString()}
                 </p>
              </CardContent>
              <CardFooter className="flex justify-between gap-2 border-t pt-4">
                 <div className="flex gap-2">
                    <Link href={`/admin/forms/builder?id=${form._id}`}>
                        <Button variant="outline" size="sm">
                            <Pencil className="h-3 w-3 mr-1" /> Edit
                        </Button>
                    </Link>
                    <Link href={`/admin/forms/${form._id}`}>
                        <Button variant="outline" size="sm">
                            <BarChart3 className="h-3 w-3 mr-1" /> Results
                        </Button>
                    </Link>
                 </div>
                 <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => {
                        if(confirm("Delete this form?")) deleteMutation.mutate(form._id);
                    }}
                 >
                    <Trash className="h-4 w-4" />
                 </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
