"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { usePathname } from "next/navigation";

export default function CompleteProfileModal() {
  const { data: session, update } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const [batch, setBatch] = useState("");
  const [degree, setDegree] = useState("MCA");
  const [college, setCollege] = useState("CSI Institute of Technology, Thovalai");
  const [error, setError] = useState("");

   // Generate batch options
   const currentYear = new Date().getFullYear();
   const startYear = 2025;
   const batchOptions = [];
   const endYear = Math.max(currentYear + 1, 2028); 
 
   for (let y = startYear; y <= endYear; y++) {
       batchOptions.push(`${y}-${y + 2}`);
   }

  useEffect(() => {
    // Only check for logged-in users who are NOT checking out/registering etc if needed
    // But main criteria is: if they lack batch/degree/college
    if (session?.user) {
        // We need to fetch the FULL user profile because session might be stale or incomplete
        // Or we rely on session. But session usually doesn't have custom fields unless we add them to callbacks.
        // Let's assume we need to check if these fields are missing.
        // Since we didn't add them to the session callback in auth.config.ts yet, we might need to fetch user status.
        // OR better: Update auth.config.ts to include these fields in session to avoid extra fetch.
        // For now, let's fetch the user profile to check.
        fetchUserProfile();
    }
  }, [session, pathname]);

  const fetchUserProfile = async () => {
      try {
          const res = await fetch("/api/user/me"); // We need an endpoint to get current user details
          if(res.ok) {
              const data = await res.json();
              if (!data.batch || !data.degree || !data.college) {
                  setIsOpen(true);
              }
          }
      } catch (err) {
          console.error(err);
      }
  };

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      return res.json();
    },
    onSuccess: async () => {
      setIsOpen(false);
      await update(); // Update session
    },
    onError: () => {
        setError("Failed to update profile. Please try again.");
    }
  });

  const handleSubmit = () => {
      if(!batch) {
          setError("Please select your batch.");
          return;
      }
      updateProfileMutation.mutate({ batch, degree, college });
  };

  // If on login/register pages, don't show? Maybe.
  if (pathname.startsWith("/student/login") || pathname.startsWith("/student/register")) return null;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Complete Your Profile</DialogTitle>
          <DialogDescription>
            We need a few more details to provide you with the best experience.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <div className="space-y-2">
                <label className="text-sm font-medium">Batch</label>
                <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={batch}
                    onChange={(e) => setBatch(e.target.value)}
                >
                    <option value="" disabled>Select Batch</option>
                    {batchOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium">Degree</label>
                <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    disabled // Fixed for now
                >
                    <option value="MCA">MCA</option>
                </select>
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium">College</label>
                <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    disabled // Fixed for now
                >
                    <option value="CSI Institute of Technology, Thovalai">CSI Institute of Technology, Thovalai</option>
                </select>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
        <Button onClick={handleSubmit} disabled={updateProfileMutation.isPending} className="w-full">
            {updateProfileMutation.isPending ? "Saving..." : "Save Details"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
