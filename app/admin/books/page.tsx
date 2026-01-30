"use client";

import { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Plus, Loader2, Trash, Pencil, Book as BookIcon, Filter, X } from "lucide-react";
import { useDegrees, Degree } from "@/hooks/admin/use-degrees";
import { useSemesters, Semester } from "@/hooks/admin/use-semesters";
import { useSubjects, Subject } from "@/hooks/admin/use-subjects";
import { useBooks, useCreateBook, useUpdateBook, useDeleteBook, Book } from "@/hooks/admin/use-books";

export default function BooksPage() {
  // Create State
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [selectedDegree, setSelectedDegree] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  // Edit State
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [editDegreeId, setEditDegreeId] = useState("");
  const [editSemesterId, setEditSemesterId] = useState("");
  const [editSubjectId, setEditSubjectId] = useState("");

  // Filter State for List View
  const [selectedFilterDegree, setSelectedFilterDegree] = useState("all");
  const [selectedFilterSemester, setSelectedFilterSemester] = useState("all");
  const [selectedFilterSubject, setSelectedFilterSubject] = useState("all");

  // Fetch Base Data
  const { data: degrees = [] } = useDegrees();
  const { data: semesters = [] } = useSemesters();
  const { data: subjects = [] } = useSubjects();

  // Derived filter lists
  const filteredSemesters = selectedFilterDegree !== "all"
    ? semesters.filter((s: Semester) => (s.degreeId as any) === selectedFilterDegree || (s.degreeId as any)?._id === selectedFilterDegree)
    : semesters;

  const filteredSubjects = selectedFilterSemester !== "all"
    ? subjects.filter((s: Subject) => (s.semesterId as any) === selectedFilterSemester || (s.semesterId as any)?._id === selectedFilterSemester)
    : subjects;

  // Fetch Books
  const { data: booksList = [], isLoading: isLoadingBooks } = useBooks({
    degreeId: selectedFilterDegree,
    semesterId: selectedFilterSemester,
    subjectId: selectedFilterSubject,
  });

  // Derived Lists for Create
  const createSemesters = selectedDegree
    ? semesters.filter((s: Semester) => (s.degreeId as any) === selectedDegree || (s.degreeId as any)?._id === selectedDegree)
    : [];
  const createSubjects = selectedSemester
    ? subjects.filter((s: Subject) => (s.semesterId as any) === selectedSemester || (s.semesterId as any)?._id === selectedSemester)
    : [];

  // Derived Lists for Edit
  const editSemesters = editDegreeId
    ? semesters.filter((s: Semester) => (s.degreeId as any) === editDegreeId || (s.degreeId as any)?._id === editDegreeId)
    : [];
  const editSubjects = editSemesterId
    ? subjects.filter((s: Subject) => (s.semesterId as any) === editSemesterId || (s.semesterId as any)?._id === editSemesterId)
    : [];

  // Mutations
  const createMutation = useCreateBook();
  const updateMutation = useUpdateBook();
  const deleteMutation = useDeleteBook();

  function handleCreate() {
    if (!title || !url || !selectedSubject) return;
    createMutation.mutate(
      { title, url, subjectId: selectedSubject },
      {
        onSuccess: () => {
          setTitle("");
          setUrl("");
          // Keep subject selected for bulk adding if needed, or clear it
        },
        onError: () => alert("Failed to create book")
      }
    );
  }

  function handleUpdate() {
    if (!editingBook || !editTitle || !editUrl || !editSubjectId) return;
    updateMutation.mutate(
      {
        id: editingBook._id,
        title: editTitle,
        url: editUrl,
        subjectId: editSubjectId,
      },
      {
         onSuccess: () => setEditingBook(null),
         onError: (error) => alert(error.message)
      }
    );
  }

  function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this book?")) return;
    deleteMutation.mutate(id, {
        onError: () => alert("Failed to delete book")
    });
  }

  const activeFiltersCount = [
    selectedFilterDegree !== "all",
    selectedFilterSemester !== "all",
    selectedFilterSubject !== "all",
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSelectedFilterDegree("all");
    setSelectedFilterSemester("all");
    setSelectedFilterSubject("all");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
           <h2 className="text-3xl font-bold tracking-tight">Books</h2>
           <p className="text-muted-foreground">Manage reference books (Google Drive PDF links).</p>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Book
            </Button>
          </SheetTrigger>
          <SheetContent className="overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Add New Book</SheetTitle>
              <SheetDescription>Add a PDF link from Google Drive.</SheetDescription>
            </SheetHeader>
            <div className="py-6 space-y-4">
                <div className="space-y-2">
                   <label className="text-sm font-medium">Degree</label>
                   <Select value={selectedDegree} onValueChange={(val) => {
                       setSelectedDegree(val); setSelectedSemester(""); setSelectedSubject("");
                   }}>
                     <SelectTrigger><SelectValue placeholder="Select Degree" /></SelectTrigger>
                     <SelectContent>
                       {degrees.map((d) => <SelectItem key={d._id} value={d._id}>{d.name}</SelectItem>)}
                     </SelectContent>
                   </Select>
                </div>
                <div className="space-y-2">
                   <label className="text-sm font-medium">Semester</label>
                   <Select value={selectedSemester} onValueChange={(val) => {
                       setSelectedSemester(val); setSelectedSubject("");
                   }} disabled={!selectedDegree}>
                     <SelectTrigger><SelectValue placeholder="Select Semester" /></SelectTrigger>
                     <SelectContent>
                       {createSemesters.map((s) => <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>)}
                     </SelectContent>
                   </Select>
                </div>
                <div className="space-y-2">
                   <label className="text-sm font-medium">Subject</label>
                   <Select value={selectedSubject} onValueChange={setSelectedSubject} disabled={!selectedSemester}>
                     <SelectTrigger><SelectValue placeholder="Select Subject" /></SelectTrigger>
                     <SelectContent>
                       {createSubjects.map((s) => <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>)}
                     </SelectContent>
                   </Select>
                </div>
                <div className="pt-4 border-t space-y-4">
                    <div className="space-y-2">
                       <label className="text-sm font-medium">Book Title</label>
                       <Input placeholder="Engineering Physics Vol 1" value={title} onChange={(e) => setTitle(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                       <label className="text-sm font-medium">PDF URL (Google Drive)</label>
                       <Input placeholder="https://drive.google.com/..." value={url} onChange={(e) => setUrl(e.target.value)} />
                    </div>
                </div>
            </div>
            <SheetFooter>
                <SheetClose asChild><Button variant="outline">Cancel</Button></SheetClose>
                <Button onClick={handleCreate} disabled={createMutation.isPending || !selectedSubject || !title || !url}>
                    {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Add Book
                </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        {/* Edit Sheet */}
        <Sheet open={!!editingBook} onOpenChange={(open) => !open && setEditingBook(null)}>
          <SheetContent className="overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Edit Book</SheetTitle>
              <SheetDescription>Update book link and association.</SheetDescription>
            </SheetHeader>
            <div className="py-6 space-y-4">
                <div className="space-y-2">
                   <label className="text-sm font-medium">Degree</label>
                   <Select value={editDegreeId} onValueChange={(v: string) => { setEditDegreeId(v); setEditSemesterId(""); setEditSubjectId(""); }}>
                     <SelectTrigger><SelectValue /></SelectTrigger>
                     <SelectContent>
                       {degrees.map((d) => <SelectItem key={d._id} value={d._id}>{d.name}</SelectItem>)}
                     </SelectContent>
                   </Select>
                </div>
                <div className="space-y-2">
                   <label className="text-sm font-medium">Semester</label>
                   <Select value={editSemesterId} onValueChange={(v: string) => { setEditSemesterId(v); setEditSubjectId(""); }} disabled={!editDegreeId}>
                     <SelectTrigger><SelectValue /></SelectTrigger>
                     <SelectContent>
                       {editSemesters.map((s) => <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>)}
                     </SelectContent>
                   </Select>
                </div>
                <div className="space-y-2">
                   <label className="text-sm font-medium">Subject</label>
                   <Select value={editSubjectId} onValueChange={setEditSubjectId} disabled={!editSemesterId}>
                     <SelectTrigger><SelectValue /></SelectTrigger>
                     <SelectContent>
                       {editSubjects.map((s) => <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>)}
                     </SelectContent>
                   </Select>
                </div>
                <div className="pt-4 border-t space-y-4">
                    <div className="space-y-2">
                       <label className="text-sm font-medium">Title</label>
                       <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                       <label className="text-sm font-medium">URL</label>
                       <Input value={editUrl} onChange={(e) => setEditUrl(e.target.value)} />
                    </div>
                </div>
            </div>
            <SheetFooter>
                <Button variant="outline" onClick={() => setEditingBook(null)}>Cancel</Button>
                <Button onClick={handleUpdate} disabled={updateMutation.isPending || !editSubjectId || !editTitle || !editUrl}>
                    {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Update Book
                </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      <Card>
        <CardHeader className="pb-3 bg-slate-50/50">
            <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Filter className="h-4 w-4 text-emerald-600" /> Filter Books
                </CardTitle>
                {activeFiltersCount > 0 && <Button variant="ghost" size="sm" onClick={clearFilters}><X className="mr-2 h-3 w-3" /> Clear</Button>}
            </div>
        </CardHeader>
        <CardContent className="pt-6">
            <div className="grid gap-6 sm:grid-cols-3">
                <FilterSection label="Degree" value={selectedFilterDegree} onValueChange={(v: string) => { setSelectedFilterDegree(v); setSelectedFilterSemester("all"); setSelectedFilterSubject("all"); }} options={degrees} placeholder="All Degrees" allValue="All Degrees" />
                <FilterSection label="Semester" value={selectedFilterSemester} onValueChange={(v: string) => { setSelectedFilterSemester(v); setSelectedFilterSubject("all"); }} options={filteredSemesters} placeholder="All Semesters" allValue="All Semesters" disabled={selectedFilterDegree === "all"} />
                <FilterSection label="Subject" value={selectedFilterSubject} onValueChange={(v: string) => setSelectedFilterSubject(v)} options={filteredSubjects} placeholder="All Subjects" allValue="All Subjects" disabled={selectedFilterSemester === "all"} />
            </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoadingBooks ? <p>Loading...</p> : booksList.length === 0 ? <p className="text-muted-foreground col-span-full text-center py-10">No books found.</p> : (
            booksList.map((b) => (
                <Card key={b._id}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="font-semibold text-lg line-clamp-1">{b.title}</CardTitle>
                        <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-emerald-600" onClick={() => {
                                setEditingBook(b);
                                setEditTitle(b.title);
                                setEditUrl(b.url);
                                setEditDegreeId(b.subjectId?.semesterId?.degreeId?._id || "");
                                setEditSemesterId(b.subjectId?.semesterId?._id || "");
                                setEditSubjectId(b.subjectId?._id || "");
                            }}><Pencil className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-500" onClick={() => handleDelete(b._id)}><Trash className="h-4 w-4" /></Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                         <p className="text-xs text-muted-foreground mb-1 break-all line-clamp-1">{b.url}</p>
                         <div className="text-xs font-medium bg-muted px-2 py-1 rounded inline-block mt-2">
                             {b.subjectId?.name}
                         </div>
                    </CardContent>
                </Card>
            ))
        )}
      </div>
    </div>
  );
}

function FilterSection({ label, value, onValueChange, options, disabled, placeholder, allValue }: any) {
    return (
        <div className="space-y-1.5 flex-1">
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider ml-1">{label}</label>
            <Select value={value} onValueChange={onValueChange} disabled={disabled}>
                <SelectTrigger className="h-10"><SelectValue placeholder={placeholder} /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">{allValue}</SelectItem>
                    {options.map((opt: any) => <SelectItem key={opt._id} value={opt._id}>{opt.name}</SelectItem>)}
                </SelectContent>
            </Select>
        </div>
    );
}
