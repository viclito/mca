"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet";
import { Plus, Loader2, Trash } from "lucide-react";
import { format } from "date-fns";

interface Degree {
  _id: string;
  name: string;
  slug: string;
  createdAt: string;
}

export default function DegreesPage() {
  const [degrees, setDegrees] = useState<Degree[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newDegreeName, setNewDegreeName] = useState("");

  useEffect(() => {
    fetchDegrees();
  }, []);

  async function fetchDegrees() {
    try {
      const res = await fetch("/api/admin/degrees");
      const data = await res.json();
      setDegrees(data);
    } catch (error) {
      console.error("Failed to fetch degrees", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreate() {
    if (!newDegreeName) return;
    setIsCreating(true);
    try {
      const res = await fetch("/api/admin/degrees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newDegreeName }),
      });
      if (res.ok) {
        setNewDegreeName("");
        fetchDegrees();
        // Close sheet (optional, hard to trigger close programmatically without ref, but user can close)
      } else {
          alert("Failed to create degree");
      }
    } catch (error) {
       console.error(error);
    } finally {
      setIsCreating(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this degree? This will not delete sub-items but may break references.")) return;
    
    try {
      const res = await fetch(`/api/admin/degrees?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDegrees(degrees.filter(d => d._id !== id));
      } else {
        alert("Failed to delete degree");
      }
    } catch (error) {
      console.error(error);
      alert("Error deleting degree");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="hidden md:block">
           <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Degrees</h2>
           <p className="text-sm md:text-base text-muted-foreground">Manage the educational degrees available.</p>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" /> Add Degree
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Add New Degree</SheetTitle>
              <SheetDescription>
                Create a new degree program (e.g., MCA, BCA).
              </SheetDescription>
            </SheetHeader>
            <div className="py-6 space-y-4">
               <div className="space-y-2">
                  <Input 
                    placeholder="Degree Name (e.g. Master of Computer Applications)" 
                    value={newDegreeName}
                    onChange={(e) => setNewDegreeName(e.target.value)}
                  />
               </div>
            </div>
            <SheetFooter>
                <SheetClose asChild>
                    <Button variant="outline">Cancel</Button>
                </SheetClose>
                <Button onClick={handleCreate} disabled={isCreating}>
                    {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Create Degree
                </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
            <p>Loading...</p>
        ) : degrees.length === 0 ? (
            <p className="text-muted-foreground col-span-full text-center py-10">No degrees found.</p>
        ) : (
            degrees.map((degree) => (
                <Card key={degree._id}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="font-semibold text-lg">{degree.name}</CardTitle>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-red-500"
                            onClick={() => handleDelete(degree._id)}
                        >
                             <Trash className="h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">Slug: {degree.slug}</p>
                        <p className="text-xs text-muted-foreground mt-2">Added: {format(new Date(degree.createdAt), "PPP")}</p>
                    </CardContent>
                </Card>
            ))
        )}
      </div>
    </div>
  );
}
