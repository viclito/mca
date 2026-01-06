"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
import { Plus, Loader2, Trash } from "lucide-react";

interface Degree {
  _id: string;
  name: string;
}

interface Semester {
  _id: string;
  name: string;
  degreeId: string;
}

interface Subject {
  _id: string;
  name: string;
  slug: string;
  semesterId: {
      _id: string;
      name: string;
      degreeId: Degree;
  };
}

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [degrees, setDegrees] = useState<Degree[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [filteredSemesters, setFilteredSemesters] = useState<Semester[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  
  const [newSubjectName, setNewSubjectName] = useState("");
  const [selectedDegree, setSelectedDegree] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");

  useEffect(() => {
    fetchDegrees();
    fetchSemesters();
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (selectedDegree) {
      setFilteredSemesters(semesters.filter(s => s.degreeId === selectedDegree || (s.degreeId as any)._id === selectedDegree));
    } else {
      setFilteredSemesters([]);
    }
  }, [selectedDegree, semesters]);

  async function fetchDegrees() {
    const res = await fetch("/api/admin/degrees");
    const data = await res.json();
    setDegrees(data);
  }

  async function fetchSemesters() {
    const res = await fetch("/api/admin/semesters");
    const data = await res.json();
    setSemesters(data);
  }

  async function fetchSubjects() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/subjects");
      const data = await res.json();
      setSubjects(data);
    } catch (error) {
       console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreate() {
    if (!newSubjectName || !selectedSemester) return;
    setIsCreating(true);
    try {
      const res = await fetch("/api/admin/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newSubjectName, semesterId: selectedSemester }),
      });
      if (res.ok) {
        setNewSubjectName("");
        fetchSubjects();
      } else {
          alert("Failed to create subject");
      }
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="hidden md:block">
           <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Subjects</h2>
           <p className="text-sm md:text-base text-muted-foreground">Manage subjects within semesters.</p>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" /> Add Subject
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Add New Subject</SheetTitle>
              <SheetDescription>
                Select Degree &rarr; Semester &rarr; Add Subject
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
                  <label className="text-sm font-medium">Semester</label>
                  <Select onValueChange={setSelectedSemester} value={selectedSemester} disabled={!selectedDegree}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Semester" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredSemesters.map((s) => (
                        <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
               </div>
               <div className="space-y-2">
                  <label className="text-sm font-medium">Subject Name</label>
                  <Input 
                    placeholder="e.g. Data Structures" 
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                  />
               </div>
            </div>
            <SheetFooter>
                <SheetClose asChild>
                    <Button variant="outline">Cancel</Button>
                </SheetClose>
                <Button onClick={handleCreate} disabled={isCreating || !selectedSemester || !newSubjectName}>
                    {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Create Subject
                </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
            <p>Loading...</p>
        ) : subjects.length === 0 ? (
            <p className="text-muted-foreground col-span-full text-center py-10">No subjects found.</p>
        ) : (
            subjects.map((sub) => (
                <Card key={sub._id}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="font-semibold text-lg">{sub.name}</CardTitle>
                         <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500">
                             <Trash className="h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent>
                         <div className="text-sm text-foreground/80 mb-1">
                             {sub.semesterId?.degreeId?.name} &gt; {sub.semesterId?.name}
                         </div>
                        <p className="text-xs text-muted-foreground">Slug: {sub.slug}</p>
                    </CardContent>
                </Card>
            ))
        )}
      </div>
    </div>
  );
}
