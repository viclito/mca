"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { GraduationCap, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface AdminSettingsContentProps {
  initialIsStudent: boolean;
  userEmail: string;
}

export default function AdminSettingsContent({ initialIsStudent, userEmail }: AdminSettingsContentProps) {
  const [isStudent, setIsStudent] = useState(initialIsStudent);
  const queryClient = useQueryClient();

  const toggleMutation = useMutation({
    mutationFn: async (newValue: boolean) => {
      const res = await fetch("/api/user/role-toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isStudent: newValue }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: (data) => {
      setIsStudent(data.isStudent);
      alert(data.isStudent ? "Registered as student successful!" : "Removed student status successfully!");
      // Invalidate session or user-related queries if any
      queryClient.invalidateQueries({ queryKey: ["session"] });
    },
    onError: (error) => {
      alert(error instanceof Error ? error.message : "An error occurred");
    },
  });

  return (
    <Card className="border-primary/20">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            Student Privileges
          </CardTitle>
          <CardDescription>
            Enable this to participate in forms and student activities.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between space-x-2 border-t pt-4">
          <div className="space-y-0.5">
            <Label htmlFor="student-toggle" className="text-base">Register as Student</Label>
            <p className="text-sm text-muted-foreground">
              You will appear in student lists for forms and submissions.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {toggleMutation.isPending && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            <Switch
              id="student-toggle"
              checked={isStudent}
              onCheckedChange={(checked) => toggleMutation.mutate(checked)}
              disabled={toggleMutation.isPending}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
