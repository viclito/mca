"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2, Trash, Pencil } from "lucide-react";
import { format } from "date-fns";

interface Degree {
  _id: string;
  name: string;
}

interface Semester {
  _id: string;
  name: string;
  slug: string;
  degreeId: Degree;
  createdAt: string;
}

export default function SemestersPage() {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [degrees, setDegrees] = useState<Degree[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newSemesterName, setNewSemesterName] = useState("");
  const [selectedDegree, setSelectedDegree] = useState("");
  const [editingSemester, setEditingSemester] = useState<Semester | null>(null);
  const [editName, setEditName] = useState("");
  const [editDegreeId, setEditDegreeId] = useState("");

  useEffect(() => {
    fetchDegrees();
    fetchSemesters();
  }, []);

  async function fetchDegrees() {
    const res = await fetch("/api/admin/degrees");
    const data = await res.json();
    setDegrees(data);
  }

  async function fetchSemesters() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/semesters");
      const data = await res.json();
      setSemesters(data);
    } catch (error) {
       console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreate() {
    if (!newSemesterName || !selectedDegree) return;
    setIsCreating(true);
    try {
      const res = await fetch("/api/admin/semesters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newSemesterName, degreeId: selectedDegree }),
      });
      if (res.ok) {
        setNewSemesterName("");
        fetchSemesters();
      } else {
          alert("Failed to create semester");
      }
    } finally {
      setIsCreating(false);
    }
  }

  async function handleUpdate() {
    if (!editingSemester || !editName || !editDegreeId) return;
    setIsUpdating(true);
    try {
      const res = await fetch("/api/admin/semesters", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          id: editingSemester._id, 
          name: editName, 
          degreeId: editDegreeId 
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setSemesters(semesters.map(s => s._id === updated._id ? updated : s));
        setEditingSemester(null);
      } else {
        const err = await res.json();
        alert(err.message || "Failed to update semester");
      }
    } catch (error) {
       console.error(error);
       alert("Error updating semester");
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this semester? This will not delete sub-items but may break references.")) return;
    
    try {
      const res = await fetch(`/api/admin/semesters?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setSemesters(semesters.filter(s => s._id !== id));
      } else {
        alert("Failed to delete semester");
      }
    } catch (error) {
      console.error(error);
      alert("Error deleting semester");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
           <h2 className="text-3xl font-bold tracking-tight">Semesters</h2>
           <p className="text-muted-foreground">Manage semesters within degrees.</p>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Semester
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Add New Semester</SheetTitle>
              <SheetDescription>
                Associate a semester with a degree.
              </SheetDescription>
            </SheetHeader>
            <div className="py-6 space-y-4">
               <div className="space-y-2">
                  <label className="text-sm font-medium">Degree</label>
                  <Select onValueChange={setSelectedDegree} value={selectedDegree}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Degree" />
                    </SelectTrigger>
                    <SelectContent>
                      {degrees.map((d) => (
                        <SelectItem key={d._id} value={d._id}>{d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
               </div>
               <div className="space-y-2">
                  <label className="text-sm font-medium">Semester Name</label>
                  <Input 
                    placeholder="e.g. Semester 1" 
                    value={newSemesterName}
                    onChange={(e) => setNewSemesterName(e.target.value)}
                  />
               </div>
            </div>
            <SheetFooter>
                <SheetClose asChild>
                    <Button variant="outline">Cancel</Button>
                </SheetClose>
                <Button onClick={handleCreate} disabled={isCreating || !selectedDegree || !newSemesterName}>
                    {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Create Semester
                </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        {/* Edit Semester Sheet */}
        <Sheet open={!!editingSemester} onOpenChange={(open) => !open && setEditingSemester(null)}>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Edit Semester</SheetTitle>
              <SheetDescription>
                Update the semester details.
              </SheetDescription>
            </SheetHeader>
            <div className="py-6 space-y-4">
               <div className="space-y-2">
                  <label className="text-sm font-medium">Degree</label>
                  <Select onValueChange={setEditDegreeId} value={editDegreeId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Degree" />
                    </SelectTrigger>
                    <SelectContent>
                      {degrees.map((d) => (
                        <SelectItem key={d._id} value={d._id}>{d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
               </div>
               <div className="space-y-2">
                  <label className="text-sm font-medium">Semester Name</label>
                  <Input 
                    placeholder="e.g. Semester 1" 
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
               </div>
            </div>
            <SheetFooter>
                <Button variant="outline" onClick={() => setEditingSemester(null)}>Cancel</Button>
                <Button onClick={handleUpdate} disabled={isUpdating || !editDegreeId || !editName}>
                    {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Update Semester
                </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
            <p>Loading...</p>
        ) : semesters.length === 0 ? (
            <p className="text-muted-foreground col-span-full text-center py-10">No semesters found.</p>
        ) : (
            semesters.map((sem) => (
                <Card key={sem._id}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="font-semibold text-lg">{sem.name}</CardTitle>
                        <div className="flex items-center gap-1">
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-muted-foreground hover:text-blue-500"
                                onClick={() => {
                                    setEditingSemester(sem);
                                    setEditName(sem.name);
                                    setEditDegreeId(sem.degreeId?._id || "");
                                }}
                            >
                                <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-muted-foreground hover:text-red-500"
                                onClick={() => handleDelete(sem._id)}
                            >
                                 <Trash className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                         <p className="text-sm font-medium text-foreground/80 mb-2">{sem.degreeId?.name || "Unknown Degree"}</p>
                        <p className="text-xs text-muted-foreground">Slug: {sem.slug}</p>
                    </CardContent>
                </Card>
            ))
        )}
      </div>
    </div>
  );
}
