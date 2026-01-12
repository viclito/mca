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
import { Plus, Loader2, Trash, Pencil, FileText, Video as VideoIcon } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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
        subjectId?: {
            _id: string;
            name: string;
            semesterId?: {
                _id: string;
                name: string;
                degreeId?: {
                    _id: string;
                    name: string;
                }
            }
        }
    }
}

export default function ContentPage() {
  const [filteredSemesters, setFilteredSemesters] = useState<Semester[]>([]);
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
  const [filteredUnits, setFilteredUnits] = useState<Unit[]>([]);
  
  const [isCreating, setIsCreating] = useState(false);
  
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"video"|"pdf">("video");
  const [url, setUrl] = useState("");
  
  const [selectedDegree, setSelectedDegree] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("");

  const [editingContent, setEditingContent] = useState<Content | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editType, setEditType] = useState<"video"|"pdf">("video");
  const [editUrl, setEditUrl] = useState("");
  const [editDegreeId, setEditDegreeId] = useState("");
  const [editSemesterId, setEditSemesterId] = useState("");
  const [editSubjectId, setEditSubjectId] = useState("");
  const [editUnitId, setEditUnitId] = useState("");

  const [editFilteredSemesters, setEditFilteredSemesters] = useState<Semester[]>([]);
  const [editFilteredSubjects, setEditFilteredSubjects] = useState<Subject[]>([]);
  const [editFilteredUnits, setEditFilteredUnits] = useState<Unit[]>([]);
  
  const queryClient = useQueryClient();

  // Fetch Degrees
  const { data: degrees = [] } = useQuery<Degree[]>({
    queryKey: ["degrees"],
    queryFn: async () => {
      const res = await fetch("/api/admin/degrees");
      if (!res.ok) throw new Error("Failed to fetch degrees");
      return res.json();
    },
  });

  // Fetch Semesters
  const { data: semesters = [] } = useQuery<Semester[]>({
    queryKey: ["semesters"],
    queryFn: async () => {
      const res = await fetch("/api/admin/semesters");
      if (!res.ok) throw new Error("Failed to fetch semesters");
      return res.json();
    },
  });

  // Fetch Subjects
  const { data: subjects = [] } = useQuery<Subject[]>({
    queryKey: ["subjects"],
    queryFn: async () => {
      const res = await fetch("/api/admin/subjects");
      if (!res.ok) throw new Error("Failed to fetch subjects");
      return res.json();
    },
  });

  // Fetch Units
  const { data: units = [] } = useQuery<Unit[]>({
    queryKey: ["units"],
    queryFn: async () => {
      const res = await fetch("/api/admin/units");
      if (!res.ok) throw new Error("Failed to fetch units");
      return res.json();
    },
  });

  // Fetch Content
  const { data: contentList = [], isLoading: isLoadingContent } = useQuery<Content[]>({
    queryKey: ["content"],
    queryFn: async () => {
      const res = await fetch("/api/admin/content");
      if (!res.ok) throw new Error("Failed to fetch content");
      return res.json();
    },
  });

  useEffect(() => {
    if (selectedDegree) {
      setFilteredSemesters(semesters.filter(s => s.degreeId === selectedDegree || (s.degreeId as any)._id === selectedDegree));
    } else {
        setFilteredSemesters([]);
    }
    // Only reset if needed, simplified for better UX
  }, [selectedDegree, semesters]);

  useEffect(() => {
      if (selectedSemester) {
          setFilteredSubjects(subjects.filter(s => s.semesterId === selectedSemester || (s.semesterId as any)._id === selectedSemester));
      } else {
          setFilteredSubjects([]);
      }
  }, [selectedSemester, subjects]);

  useEffect(() => {
      if (selectedSubject) {
          setFilteredUnits(units.filter(u => u.subjectId === selectedSubject || (u.subjectId as any)._id === selectedSubject));
      } else {
          setFilteredUnits([]);
      }
  }, [selectedSubject, units]);

  useEffect(() => {
    if (editDegreeId) {
      setEditFilteredSemesters(semesters.filter(s => s.degreeId === editDegreeId || (s.degreeId as any)._id === editDegreeId));
    } else {
      setEditFilteredSemesters([]);
    }
  }, [editDegreeId, semesters]);

  useEffect(() => {
      if (editSemesterId) {
          setEditFilteredSubjects(subjects.filter(s => s.semesterId === editSemesterId || (s.semesterId as any)._id === editSemesterId));
      } else {
          setEditFilteredSubjects([]);
      }
  }, [editSemesterId, subjects]);

  useEffect(() => {
      if (editSubjectId) {
          setEditFilteredUnits(units.filter(u => u.subjectId === editSubjectId || (u.subjectId as any)._id === editSubjectId));
      } else {
          setEditFilteredUnits([]);
      }
  }, [editSubjectId, units]);


  // Create Content
  const createMutation = useMutation({
    mutationFn: async ({
      title,
      type,
      url,
      unitId,
    }: {
      title: string;
      type: "video" | "pdf";
      url: string;
      unitId: string;
    }) => {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, type, url, unitId }),
      });
      if (!res.ok) throw new Error("Failed to create content");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content"] });
      setTitle("");
      setUrl("");
      setIsCreating(false);
    },
    onError: () => {
      alert("Failed to create content");
      setIsCreating(false);
    },
  });

  // Update Content
  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      title,
      type,
      url,
      unitId,
    }: {
      id: string;
      title: string;
      type: "video" | "pdf";
      url: string;
      unitId: string;
    }) => {
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, title, type, url, unitId }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to update content");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content"] });
      setEditingContent(null);
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  // Delete Content
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/content?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete content");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content"] });
    },
    onError: () => {
      alert("Failed to delete content");
    },
  });


  function handleCreate() {
    if (!title || !url || !selectedUnit) return;
    setIsCreating(true);
    createMutation.mutate({ title, type, url, unitId: selectedUnit });
  }

  function handleUpdate() {
    if (!editingContent || !editTitle || !editUrl || !editUnitId) return;
    updateMutation.mutate({
      id: editingContent._id,
      title: editTitle,
      type: editType,
      url: editUrl,
      unitId: editUnitId,
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this content item?")) return;
    deleteMutation.mutate(id);
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
                <Button onClick={handleCreate} disabled={createMutation.isPending || !selectedUnit || !title || !url}>
                    {createMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Add Content
                </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        {/* Edit Content Sheet */}
        <Sheet open={!!editingContent} onOpenChange={(open) => !open && setEditingContent(null)}>
          <SheetContent className="overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Edit Content</SheetTitle>
              <SheetDescription>
                Update reference links and associations.
              </SheetDescription>
            </SheetHeader>
            <div className="py-6 space-y-4">
               {/* Selection Hierarchy */}
               <div className="space-y-2">
                  <label className="text-sm font-medium">Degree</label>
                  <Select onValueChange={setEditDegreeId} value={editDegreeId}>
                    <SelectTrigger><SelectValue placeholder="Select Degree" /></SelectTrigger>
                    <SelectContent>
                      {degrees.map((d) => <SelectItem key={d._id} value={d._id}>{d.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
               </div>
               <div className="space-y-2">
                  <label className="text-sm font-medium">Semester</label>
                  <Select onValueChange={setEditSemesterId} value={editSemesterId} disabled={!editDegreeId}>
                    <SelectTrigger><SelectValue placeholder="Select Semester" /></SelectTrigger>
                    <SelectContent>
                      {editFilteredSemesters.map((s) => <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
               </div>
               <div className="space-y-2">
                  <label className="text-sm font-medium">Subject</label>
                  <Select onValueChange={setEditSubjectId} value={editSubjectId} disabled={!editSemesterId}>
                    <SelectTrigger><SelectValue placeholder="Select Subject" /></SelectTrigger>
                    <SelectContent>
                      {editFilteredSubjects.map((s) => <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
               </div>
               <div className="space-y-2">
                  <label className="text-sm font-medium">Unit</label>
                  <Select onValueChange={setEditUnitId} value={editUnitId} disabled={!editSubjectId}>
                    <SelectTrigger><SelectValue placeholder="Select Unit" /></SelectTrigger>
                    <SelectContent>
                      {editFilteredUnits.map((u) => <SelectItem key={u._id} value={u._id}>{u.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
               </div>

               {/* Content Details */}
               <div className="pt-4 border-t border-border/50 space-y-4">
                   <div className="space-y-2">
                      <label className="text-sm font-medium">Title</label>
                      <Input placeholder="Content Title" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                   </div>
                   <div className="space-y-2">
                      <label className="text-sm font-medium">Type</label>
                      <Select onValueChange={(v: any) => setEditType(v)} value={editType}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                             <SelectItem value="video">Video</SelectItem>
                             <SelectItem value="pdf">PDF</SelectItem>
                        </SelectContent>
                      </Select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-sm font-medium">Google Drive URL</label>
                      <Input placeholder="https://drive.google.com/..." value={editUrl} onChange={(e) => setEditUrl(e.target.value)} />
                   </div>
               </div>
            </div>
            <SheetFooter>
                <Button variant="outline" onClick={() => setEditingContent(null)}>Cancel</Button>
                <Button onClick={handleUpdate} disabled={updateMutation.isPending || !editUnitId || !editTitle || !editUrl}>
                    {updateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Update Content
                </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoadingContent ? (
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
                            <div className="flex items-center gap-1">
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-muted-foreground hover:text-blue-500"
                                    onClick={() => {
                                        setEditingContent(c);
                                        setEditTitle(c.title);
                                        setEditType(c.type);
                                        setEditUrl(c.url);
                                        setEditDegreeId(c.unitId?.subjectId?.semesterId?.degreeId?._id || "");
                                        setEditSemesterId(c.unitId?.subjectId?.semesterId?._id || "");
                                        setEditSubjectId(c.unitId?.subjectId?._id || "");
                                        setEditUnitId(c.unitId?._id || "");
                                    }}
                                >
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-muted-foreground hover:text-red-500"
                                    onClick={() => handleDelete(c._id)}
                                >
                                    <Trash className="h-4 w-4" />
                                </Button>
                            </div>
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
