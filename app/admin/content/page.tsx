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
import { Plus, Loader2, Trash, FileText, Video as VideoIcon } from "lucide-react";

interface Degree { _id: string; name: string; }
interface Semester { _id: string; name: string; degreeId: string; }
interface Subject { _id: string; name: string; semesterId: string; }
interface Unit { _id: string; name: string; subjectId: string; }
interface Content {
    _id: string;
    title: string;
    type: "video" | "pdf";
    url: string;
    unitId: {
        _id: string;
        name: string;
    }
}

export default function ContentPage() {
  const [contentList, setContentList] = useState<Content[]>([]);
  const [degrees, setDegrees] = useState<Degree[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  
  const [filteredSemesters, setFilteredSemesters] = useState<Semester[]>([]);
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
  const [filteredUnits, setFilteredUnits] = useState<Unit[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"video"|"pdf">("video");
  const [url, setUrl] = useState("");
  
  const [selectedDegree, setSelectedDegree] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("");

  useEffect(() => {
    fetchDegrees();
    fetchSemesters();
    fetchSubjects();
    fetchUnits();
    fetchContent();
  }, []);

  useEffect(() => {
    if (selectedDegree) {
      setFilteredSemesters(semesters.filter(s => s.degreeId === selectedDegree || (s.degreeId as any)._id === selectedDegree));
    } else {
        setFilteredSemesters([]);
    }
    setSelectedSemester("");
  }, [selectedDegree, semesters]);

  useEffect(() => {
      if (selectedSemester) {
          setFilteredSubjects(subjects.filter(s => s.semesterId === selectedSemester || (s.semesterId as any)._id === selectedSemester));
      } else {
          setFilteredSubjects([]);
      }
      setSelectedSubject("");
  }, [selectedSemester, subjects]);

  useEffect(() => {
      if (selectedSubject) {
          setFilteredUnits(units.filter(u => u.subjectId === selectedSubject || (u.subjectId as any)._id === selectedSubject));
      } else {
          setFilteredUnits([]);
      }
      setSelectedUnit("");
  }, [selectedSubject, units]);


  async function fetchDegrees() {
    const res = await fetch("/api/admin/degrees");
    setDegrees(await res.json());
  }
  async function fetchSemesters() {
    const res = await fetch("/api/admin/semesters");
    setSemesters(await res.json());
  }
  async function fetchSubjects() {
      const res = await fetch("/api/admin/subjects");
      setSubjects(await res.json());
  }
  async function fetchUnits() {
      const res = await fetch("/api/admin/units");
      setUnits(await res.json());
  }

  async function fetchContent() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/content");
      setContentList(await res.json());
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreate() {
    if (!title || !url || !selectedUnit) return;
    setIsCreating(true);
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            title, 
            type, 
            url, 
            unitId: selectedUnit 
        }),
      });
      if (res.ok) {
        setTitle("");
        setUrl("");
        fetchContent();
      } else {
          alert("Failed to create content");
      }
    } finally {
      setIsCreating(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this content item?")) return;
    
    try {
      const res = await fetch(`/api/admin/content?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setContentList(contentList.filter(c => c._id !== id));
      } else {
        alert("Failed to delete content");
      }
    } catch (error) {
      console.error(error);
      alert("Error deleting content");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
           <h2 className="text-3xl font-bold tracking-tight">Content</h2>
           <p className="text-muted-foreground">Manage videos and PDFs (Google Drive Links).</p>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Content
            </Button>
          </SheetTrigger>
          <SheetContent className="overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Add New Content</SheetTitle>
              <SheetDescription>
                Add reference links (Video/PDF).
              </SheetDescription>
            </SheetHeader>
            <div className="py-6 space-y-4">
               {/* Selection Hierarchy */}
               <div className="space-y-2">
                  <label className="text-sm font-medium">Degree</label>
                  <Select onValueChange={setSelectedDegree} value={selectedDegree}>
                    <SelectTrigger><SelectValue placeholder="Select Degree" /></SelectTrigger>
                    <SelectContent>
                      {degrees.map((d) => <SelectItem key={d._id} value={d._id}>{d.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
               </div>
               <div className="space-y-2">
                  <label className="text-sm font-medium">Semester</label>
                  <Select onValueChange={setSelectedSemester} value={selectedSemester} disabled={!selectedDegree}>
                    <SelectTrigger><SelectValue placeholder="Select Semester" /></SelectTrigger>
                    <SelectContent>
                      {filteredSemesters.map((s) => <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
               </div>
               <div className="space-y-2">
                  <label className="text-sm font-medium">Subject</label>
                  <Select onValueChange={setSelectedSubject} value={selectedSubject} disabled={!selectedSemester}>
                    <SelectTrigger><SelectValue placeholder="Select Subject" /></SelectTrigger>
                    <SelectContent>
                      {filteredSubjects.map((s) => <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
               </div>
               <div className="space-y-2">
                  <label className="text-sm font-medium">Unit</label>
                  <Select onValueChange={setSelectedUnit} value={selectedUnit} disabled={!selectedSubject}>
                    <SelectTrigger><SelectValue placeholder="Select Unit" /></SelectTrigger>
                    <SelectContent>
                      {filteredUnits.map((u) => <SelectItem key={u._id} value={u._id}>{u.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
               </div>

               {/* Content Details */}
               <div className="pt-4 border-t border-border/50 space-y-4">
                   <div className="space-y-2">
                      <label className="text-sm font-medium">Title</label>
                      <Input placeholder="Content Title" value={title} onChange={(e) => setTitle(e.target.value)} />
                   </div>
                   <div className="space-y-2">
                      <label className="text-sm font-medium">Type</label>
                      <Select onValueChange={(v: any) => setType(v)} value={type}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                             <SelectItem value="video">Video</SelectItem>
                             <SelectItem value="pdf">PDF</SelectItem>
                        </SelectContent>
                      </Select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-sm font-medium">Google Drive URL</label>
                      <Input placeholder="https://drive.google.com/..." value={url} onChange={(e) => setUrl(e.target.value)} />
                   </div>
               </div>
            </div>
            <SheetFooter>
                <SheetClose asChild>
                    <Button variant="outline">Cancel</Button>
                </SheetClose>
                <Button onClick={handleCreate} disabled={isCreating || !selectedUnit || !title || !url}>
                    {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Add Content
                </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
            <p>Loading...</p>
        ) : contentList.length === 0 ? (
            <p className="text-muted-foreground col-span-full text-center py-10">No content found.</p>
        ) : (
            contentList.map((c) => (
                <Card key={c._id}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="font-semibold text-lg line-clamp-1">{c.title}</CardTitle>
                        <div className="flex items-center gap-2">
                            {c.type === "video" ? <VideoIcon className="h-4 w-4 text-blue-500" /> : <FileText className="h-4 w-4 text-red-500" />}
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-muted-foreground hover:text-red-500"
                                onClick={() => handleDelete(c._id)}
                            >
                                <Trash className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                         <p className="text-xs text-muted-foreground mb-1 break-all line-clamp-1">{c.url}</p>
                         <div className="text-xs font-medium bg-muted px-2 py-1 rounded inline-block mt-2">
                             {c.unitId?.name}
                         </div>
                    </CardContent>
                </Card>
            ))
        )}
      </div>
    </div>
  );
}
