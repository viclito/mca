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
import { Plus, Loader2, Trash, Pencil } from "lucide-react";
import { useDegrees, Degree } from "@/hooks/admin/use-degrees";
import { useSemesters, Semester } from "@/hooks/admin/use-semesters";
import { useSubjects, useCreateSubject, useUpdateSubject, useDeleteSubject, Subject } from "@/hooks/admin/use-subjects";

export default function SubjectsPage() {
  const [filteredSemesters, setFilteredSemesters] = useState<Semester[]>([]);
  
  const [newSubjectName, setNewSubjectName] = useState("");
  const [selectedDegree, setSelectedDegree] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [editName, setEditName] = useState("");
  const [editDegreeId, setEditDegreeId] = useState("");
  const [editSemesterId, setEditSemesterId] = useState("");
  const [editFilteredSemesters, setEditFilteredSemesters] = useState<Semester[]>([]);

  const { data: degrees = [] } = useDegrees();
  const { data: semesters = [] } = useSemesters();
  const { data: subjects = [], isLoading: isLoadingSubjects } = useSubjects();
  const createMutation = useCreateSubject();
  const updateMutation = useUpdateSubject();
  const deleteMutation = useDeleteSubject();

  useEffect(() => {
    if (selectedDegree) {
      setFilteredSemesters(semesters.filter(s => s.degreeId === selectedDegree || (s.degreeId as any)._id === selectedDegree));
    } else {
      setFilteredSemesters([]);
    }
  }, [selectedDegree, semesters]);

  useEffect(() => {
    if (editDegreeId) {
      setEditFilteredSemesters(semesters.filter(s => s.degreeId === editDegreeId || (s.degreeId as any)._id === editDegreeId));
    } else {
      setEditFilteredSemesters([]);
    }
  }, [editDegreeId, semesters]);

  function handleCreate() {
    if (!newSubjectName.trim() || !selectedSemester) return;
    setIsCreating(true);
    createMutation.mutate({ name: newSubjectName, semesterId: selectedSemester }, {
      onSuccess: () => {
        setNewSubjectName("");
        setIsCreating(false);
      },
      onError: () => {
        alert("Failed to create subject");
        setIsCreating(false);
      }
    });
  }

  function handleUpdate() {
    if (!editingSubject || !editName.trim() || !editSemesterId) return;
    updateMutation.mutate({
      id: editingSubject._id,
      name: editName,
      semesterId: editSemesterId,
    }, {
      onSuccess: () => {
        setEditingSubject(null);
      },
      onError: (error) => {
        alert((error as Error).message);
      }
    });
  }

  function handleDelete(id: string) {
    if (
      !confirm(
        "Are you sure you want to delete this subject? This will cascade to all related units."
      )
    )
      return;
    deleteMutation.mutate(id, {
      onError: () => alert("Failed to delete subject")
    });
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
                <Button onClick={handleCreate} disabled={createMutation.isPending || !selectedSemester || !newSubjectName}>
                    {createMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Create Subject
                </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        {/* Edit Subject Sheet */}
        <Sheet open={!!editingSubject} onOpenChange={(open) => !open && setEditingSubject(null)}>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Edit Subject</SheetTitle>
              <SheetDescription>
                Update subject details and associations.
              </SheetDescription>
            </SheetHeader>
            <div className="py-6 space-y-4">
               <div className="space-y-2">
                  <label className="text-sm font-medium">Degree</label>
                  <Select onValueChange={setEditDegreeId} value={editDegreeId}>
                    <SelectTrigger><SelectValue placeholder="Select Degree" /></SelectTrigger>
                    <SelectContent>
                      {degrees.map((d) => (
                        <SelectItem key={d._id} value={d._id}>{d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
               </div>
               <div className="space-y-2">
                  <label className="text-sm font-medium">Semester</label>
                  <Select onValueChange={setEditSemesterId} value={editSemesterId} disabled={!editDegreeId}>
                    <SelectTrigger><SelectValue placeholder="Select Semester" /></SelectTrigger>
                    <SelectContent>
                      {editFilteredSemesters.map((s) => (
                        <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
               </div>
               <div className="space-y-2">
                  <label className="text-sm font-medium">Subject Name</label>
                  <Input 
                    placeholder="e.g. Data Structures" 
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
               </div>
            </div>
            <SheetFooter>
                <Button variant="outline" onClick={() => setEditingSubject(null)}>Cancel</Button>
                <Button onClick={handleUpdate} disabled={updateMutation.isPending || !editSemesterId || !editName}>
                    {updateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Update Subject
                </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoadingSubjects ? (
            <p>Loading...</p>
        ) : subjects.length === 0 ? (
            <p className="text-muted-foreground col-span-full text-center py-10">No subjects found.</p>
        ) : (
            subjects.map((sub) => (
                <Card key={sub._id}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="font-semibold text-lg">{sub.name}</CardTitle>
                         <div className="flex items-center gap-1">
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-muted-foreground hover:text-blue-500"
                                onClick={() => {
                                    setEditingSubject(sub);
                                    setEditName(sub.name);
                                    const semId = typeof sub.semesterId === 'string' ? sub.semesterId : sub.semesterId;
                                    setEditDegreeId(typeof semId === 'object' && semId?.degreeId ? (typeof semId.degreeId === 'string' ? semId.degreeId : semId.degreeId._id) : "");
                                    setEditSemesterId(typeof semId === 'string' ? semId : semId?._id || "");
                                }}
                            >
                                <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-muted-foreground hover:text-red-500"
                                onClick={() => handleDelete(sub._id)}
                            >
                                 <Trash className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                         <div className="text-sm text-foreground/80 mb-1">
                             {typeof sub.semesterId === 'object' && sub.semesterId?.degreeId ? (typeof sub.semesterId.degreeId === 'object' ? sub.semesterId.degreeId.name : '') : ''} &gt; {typeof sub.semesterId === 'object' ? sub.semesterId?.name : ''}
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
