"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";

export default function StudentRegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [batch, setBatch] = useState("");
  const [degree, setDegree] = useState("MCA");
  const [college, setCollege] = useState("CSI Institute of Technology, Thovalai");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Generate batch options
  const currentYear = new Date().getFullYear();
  const startYear = 2025;
  const batchOptions = [];
  
  // Ensure we cover from 2025 up to at least current year + 1
  const endYear = Math.max(currentYear + 1, 2028); 

  for (let y = startYear; y <= endYear; y++) {
      batchOptions.push(`${y}-${y + 2}`);
  }

  const registerMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/auth/student/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const responseData = await res.json();
      if (!res.ok) {
        throw new Error(responseData.message || "Registration failed");
      }
      return responseData;
    },
    onSuccess: (data: any) => {
      setSuccess(data.message || "Registration successful! Please check your email to verify your account.");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setBatch("");
      setTimeout(() => {
        router.push("/student/login");
      }, 5000);
    },
    onError: (err: Error) => {
      setError(err.message || "An unexpected error occurred.");
    },
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!batch) {
        setError("Please select your batch");
        return;
    }

    registerMutation.mutate({ name, email, password, batch, degree, college });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4">
      <Card className="w-full max-w-md border-0 shadow-lg">
        <CardHeader className="space-y-1 flex flex-col items-center">
           <div className="bg-primary/10 p-3 rounded-full mb-2">
            <GraduationCap className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-center">
            Student Registration
          </CardTitle>
          <CardDescription className="text-center">
            Join the portal to access course materials
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="text-center space-y-4">
               <div className="text-green-600 bg-green-100 p-3 rounded-md dark:bg-green-900/30 dark:text-green-400 font-medium">
                  {success}
               </div>
            </div>
          ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Full Name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Email Address"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <select 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={batch}
                        onChange={(e) => setBatch(e.target.value)}
                        required
                    >
                        <option value="" disabled>Select Batch</option>
                        {batchOptions.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                </div>
                <div className="space-y-2">
                    <select 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={degree}
                        onChange={(e) => setDegree(e.target.value)}
                        disabled
                    >
                        <option value="MCA">MCA</option>
                    </select>
                </div>
            </div>

            <div className="space-y-2">
                <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    disabled
                >
                    <option value="CSI Institute of Technology, Thovalai">CSI Institute of Technology, Thovalai</option>
                </select>
            </div>

            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Confirm Password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
             {error && <p className="text-sm text-red-500 text-center">{error}</p>}
            <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
              {registerMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Register
            </Button>
          </form>
          )}
        </CardContent>
        {!success && (
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/student/login" className="text-primary hover:underline font-medium">
              Login here
            </Link>
          </p>
        </CardFooter>
        )}
      </Card>
    </div>
  );
}
