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
import { Badge } from "@/components/ui/badge";
import { Plus, Loader2, Trash, Pencil, FileText, Video as VideoIcon, Filter, X, StickyNote } from "lucide-react";
import { useDegrees, Degree } from "@/hooks/admin/use-degrees";
import { useSemesters, Semester } from "@/hooks/admin/use-semesters";
import { useSubjects, Subject } from "@/hooks/admin/use-subjects";
import { useUnits, Unit } from "@/hooks/admin/use-units";
import { useContent, useCreateContent, useUpdateContent, useDeleteContent, Content } from "@/hooks/admin/use-content";

export default function ContentPage() {
  // Create State
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"video"|"pdf"|"note">("video");
  const [url, setUrl] = useState("");
  const [selectedDegree, setSelectedDegree] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("");

  // Edit State
  const [editingContent, setEditingContent] = useState<Content | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editType, setEditType] = useState<"video"|"pdf"|"note">("video");
  const [editUrl, setEditUrl] = useState("");
  const [editDegreeId, setEditDegreeId] = useState("");
  const [editSemesterId, setEditSemesterId] = useState("");
  const [editSubjectId, setEditSubjectId] = useState("");
  const [editUnitId, setEditUnitId] = useState("");
  

  // Filter State for List View
  const [selectedFilterDegree, setSelectedFilterDegree] = useState("all");
  const [selectedFilterSemester, setSelectedFilterSemester] = useState("all");
  const [selectedFilterSubject, setSelectedFilterSubject] = useState("all");
  const [selectedFilterUnit, setSelectedFilterUnit] = useState("all");

  // Fetch Degrees
  const { data: degrees = [] } = useDegrees();

  // Fetch Semesters
  const { data: semesters = [] } = useSemesters();

  // Fetch Subjects
  const { data: subjects = [] } = useSubjects();

  // Fetch Units
  const { data: units = [] } = useUnits();

  // Derived filter lists based on selections
  const filteredSemesters = selectedFilterDegree !== "all"
    ? semesters.filter((s: Semester) =>(s.degreeId as any) === selectedFilterDegree || (s.degreeId as any)?._id === selectedFilterDegree)
    : semesters;

  const filteredSubjects = selectedFilterSemester !== "all"
    ? subjects.filter((s: Subject) => (s.semesterId as any) === selectedFilterSemester || (s.semesterId as any)?._id === selectedFilterSemester)
    : subjects;

  const filteredUnits = selectedFilterSubject !== "all"
    ? units.filter((u: Unit) => (u.subjectId as any) === selectedFilterSubject || (u.subjectId as any)?._id === selectedFilterSubject)
    : units;

  // Fetch Content
  const { data: contentList = [], isLoading: isLoadingContent } = useContent({
    degreeId: selectedFilterDegree,
    semesterId: selectedFilterSemester,
    subjectId: selectedFilterSubject,
    unitId: selectedFilterUnit,
  });

  // Derived Lists for Create
  const createSemesters = selectedDegree
    ? semesters.filter((s: Semester) => (s.degreeId as any) === selectedDegree || (s.degreeId as any)?._id === selectedDegree)
    : [];
  const createSubjects = selectedSemester
    ? subjects.filter((s: Subject) => (s.semesterId as any) === selectedSemester || (s.semesterId as any)?._id === selectedSemester)
    : [];
  const createUnits = selectedSubject
    ? units.filter((u: Unit) => (u.subjectId as any) === selectedSubject || (u.subjectId as any)?._id === selectedSubject)
    : [];

  // Derived Lists for Edit
  const editSemesters = editDegreeId
    ? semesters.filter((s: Semester) => (s.degreeId as any) === editDegreeId || (s.degreeId as any)?._id === editDegreeId)
    : [];
  const editSubjects = editSemesterId
    ? subjects.filter((s: Subject) => (s.semesterId as any) === editSemesterId || (s.semesterId as any)?._id === editSemesterId)
    : [];
  const editUnits = editSubjectId
    ? units.filter((u: Unit) => (u.subjectId as any) === editSubjectId || (u.subjectId as any)?._id === editSubjectId)
    : [];


  // Create Content
  const createMutation = useCreateContent();

  // Update Content
  const updateMutation = useUpdateContent();

  // Delete Content
  const deleteMutation = useDeleteContent();


  function handleCreate() {
    if (!title || !url || !selectedUnit) return;
    setIsCreating(true);
    createMutation.mutate(
      { title, type, url, unitId: selectedUnit },
      {
        onSuccess: () => {
          setTitle("");
          setUrl("");
          setIsCreating(false);
        },
        onError: () => {
           alert("Failed to create content");
           setIsCreating(false);
        }
      }
    );
  }

  const activeFiltersCount = [
    selectedFilterDegree !== "all",
    selectedFilterSemester !== "all",
    selectedFilterSubject !== "all",
    selectedFilterUnit !== "all"
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSelectedFilterDegree("all");
    setSelectedFilterSemester("all");
    setSelectedFilterSubject("all");
    setSelectedFilterUnit("all");
  };

  function handleUpdate() {
    if (!editingContent || !editTitle || !editUrl || !editUnitId) return;
    updateMutation.mutate(
      {
        id: editingContent._id,
        title: editTitle,
        type: editType,
        url: editUrl,
        unitId: editUnitId,
      },
      {
         onSuccess: () => {
             setEditingContent(null);
         },
         onError: (error) => {
             alert((error as Error).message);
         }
      }
    );
  }

  function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this content item?")) return;
    deleteMutation.mutate(id, {
        onError: () => alert("Failed to delete content")
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
           <h2 className="text-3xl font-bold tracking-tight">Content</h2>
           <p className="text-muted-foreground">Manage videos (Google Drive / YouTube) and PDFs.</p>
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
                   <Select 
                     value={selectedDegree} 
                     onValueChange={(val) => {
                       setSelectedDegree(val);
                       setSelectedSemester("");
                       setSelectedSubject("");
                       setSelectedUnit("");
                     }}
                   >
                     <SelectTrigger><SelectValue placeholder="Select Degree" /></SelectTrigger>
                     <SelectContent>
                       {degrees.map((d) => <SelectItem key={d._id} value={d._id}>{d.name}</SelectItem>)}
                     </SelectContent>
                   </Select>
                </div>
                <div className="space-y-2">
                   <label className="text-sm font-medium">Semester</label>
                   <Select 
                     value={selectedSemester} 
                     onValueChange={(val) => {
                       setSelectedSemester(val);
                       setSelectedSubject("");
                       setSelectedUnit("");
                     }}
                     disabled={!selectedDegree}
                   >
                     <SelectTrigger><SelectValue placeholder="Select Semester" /></SelectTrigger>
                     <SelectContent>
                       {createSemesters.map((s) => <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>)}
                     </SelectContent>
                   </Select>
                </div>
                <div className="space-y-2">
                   <label className="text-sm font-medium">Subject</label>
                   <Select 
                     value={selectedSubject} 
                     onValueChange={(val) => {
                        setSelectedSubject(val);
                        setSelectedUnit("");
                     }}
                     disabled={!selectedSemester}
                   >
                     <SelectTrigger><SelectValue placeholder="Select Subject" /></SelectTrigger>
                     <SelectContent>
                       {createSubjects.map((s) => <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>)}
                     </SelectContent>
                   </Select>
                </div>
                <div className="space-y-2">
                   <label className="text-sm font-medium">Unit</label>
                   <Select 
                     value={selectedUnit} 
                     onValueChange={setSelectedUnit}
                     disabled={!selectedSubject}
                   >
                     <SelectTrigger><SelectValue placeholder="Select Unit" /></SelectTrigger>
                     <SelectContent>
                       {createUnits.map((u) => <SelectItem key={u._id} value={u._id}>{u.name}</SelectItem>)}
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
                             <SelectItem value="note">Note</SelectItem>
                        </SelectContent>
                      </Select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-sm font-medium">Video URL (Google Drive / YouTube)</label>
                      <Input placeholder="https://drive.google.com/... or https://youtube.com/..." value={url} onChange={(e) => setUrl(e.target.value)} />
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
                   <Select 
                     value={editDegreeId} 
                     onValueChange={(val) => {
                        setEditDegreeId(val);
                        setEditSemesterId("");
                        setEditSubjectId("");
                        setEditUnitId("");
                     }}
                   >
                     <SelectTrigger><SelectValue placeholder="Select Degree" /></SelectTrigger>
                     <SelectContent>
                       {degrees.map((d) => <SelectItem key={d._id} value={d._id}>{d.name}</SelectItem>)}
                     </SelectContent>
                   </Select>
                </div>
                <div className="space-y-2">
                   <label className="text-sm font-medium">Semester</label>
                   <Select 
                     value={editSemesterId} 
                     onValueChange={(val) => {
                        setEditSemesterId(val);
                        setEditSubjectId("");
                        setEditUnitId("");
                     }}
                     disabled={!editDegreeId}
                   >
                     <SelectTrigger><SelectValue placeholder="Select Semester" /></SelectTrigger>
                     <SelectContent>
                       {editSemesters.map((s) => <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>)}
                     </SelectContent>
                   </Select>
                </div>
                <div className="space-y-2">
                   <label className="text-sm font-medium">Subject</label>
                   <Select 
                     value={editSubjectId} 
                     onValueChange={(val) => {
                        setEditSubjectId(val);
                        setEditUnitId("");
                     }}
                     disabled={!editSemesterId}
                   >
                     <SelectTrigger><SelectValue placeholder="Select Subject" /></SelectTrigger>
                     <SelectContent>
                       {editSubjects.map((s) => <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>)}
                     </SelectContent>
                   </Select>
                </div>
                <div className="space-y-2">
                   <label className="text-sm font-medium">Unit</label>
                   <Select 
                     value={editUnitId} 
                     onValueChange={setEditUnitId}
                     disabled={!editSubjectId}
                   >
                     <SelectTrigger><SelectValue placeholder="Select Unit" /></SelectTrigger>
                     <SelectContent>
                       {editUnits.map((u) => <SelectItem key={u._id} value={u._id}>{u.name}</SelectItem>)}
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
                             <SelectItem value="note">Note</SelectItem>
                        </SelectContent>
                      </Select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-sm font-medium">Video URL (Google Drive / YouTube)</label>
                      <Input placeholder="https://drive.google.com/... or https://youtube.com/..." value={editUrl} onChange={(e) => setEditUrl(e.target.value)} />
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

      {/* Filters */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="pb-3 bg-slate-50/50">
            <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Filter className="h-4 w-4 text-blue-600" /> 
                    <span>Filter Content</span>
                    {activeFiltersCount > 0 && (
                        <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700 border-blue-200">
                            {activeFiltersCount}
                        </Badge>
                    )}
                </CardTitle>
                <div className="flex items-center gap-2">
                    {activeFiltersCount > 0 && (
                        <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-8 text-muted-foreground hover:text-foreground hidden sm:flex"
                            onClick={clearFilters}
                        >
                            <X className="mr-2 h-3 w-3" /> Clear
                        </Button>
                    )}
                    
                    {/* Mobile Filter Trigger */}
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="sm" className="sm:hidden h-9">
                                <Filter className="mr-2 h-4 w-4" /> Filters
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="bottom" className="h-[80vh] rounded-t-[20px]">
                            <SheetHeader className="text-left">
                                <SheetTitle>Filters</SheetTitle>
                                <SheetDescription>Refine the content list</SheetDescription>
                            </SheetHeader>
                            <div className="py-6 space-y-6">
                                <FilterSection 
                                    label="Degree" 
                                    value={selectedFilterDegree} 
                                    onValueChange={(val) => {
                                        setSelectedFilterDegree(val);
                                        setSelectedFilterSemester("all");
                                        setSelectedFilterSubject("all");
                                        setSelectedFilterUnit("all");
                                    }}
                                    options={degrees}
                                    placeholder="All Degrees"
                                    allValue="All Degrees"
                                />
                                <FilterSection 
                                    label="Semester" 
                                    value={selectedFilterSemester} 
                                    onValueChange={(val) => {
                                        setSelectedFilterSemester(val);
                                        setSelectedFilterSubject("all");
                                        setSelectedFilterUnit("all");
                                    }}
                                    options={filteredSemesters}
                                    placeholder="All Semesters"
                                    allValue="All Semesters"
                                    disabled={selectedFilterDegree === "all"}
                                />
                                <FilterSection 
                                    label="Subject" 
                                    value={selectedFilterSubject} 
                                    onValueChange={(val) => {
                                        setSelectedFilterSubject(val);
                                        setSelectedFilterUnit("all");
                                    }}
                                    placeholder="All Subjects"
                                    allValue="All Subjects"
                                    options={filteredSubjects}
                                    disabled={selectedFilterSemester === "all"}
                                />
                                <FilterSection 
                                    label="Unit" 
                                    value={selectedFilterUnit} 
                                    onValueChange={setSelectedFilterUnit}
                                    placeholder="All Units"
                                    allValue="All Units"
                                    options={filteredUnits}
                                    disabled={selectedFilterSubject === "all"}
                                />
                            </div>
                            <SheetFooter className="pt-4 flex-row gap-2 pb-8">
                                <Button variant="outline" className="flex-1" onClick={clearFilters}>Clear All</Button>
                                <SheetClose asChild>
                                    <Button className="flex-1">Apply Filters</Button>
                                </SheetClose>
                            </SheetFooter>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </CardHeader>
        <CardContent className="hidden sm:block pt-6">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <FilterSection 
                    label="Degree" 
                    value={selectedFilterDegree} 
                    onValueChange={(val) => {
                        setSelectedFilterDegree(val);
                        setSelectedFilterSemester("all");
                        setSelectedFilterSubject("all");
                        setSelectedFilterUnit("all");
                    }}
                    options={degrees}
                    placeholder="All Degrees"
                    allValue="All Degrees"
                />
                <FilterSection 
                    label="Semester" 
                    value={selectedFilterSemester} 
                    onValueChange={(val) => {
                        setSelectedFilterSemester(val);
                        setSelectedFilterSubject("all");
                        setSelectedFilterUnit("all");
                    }}
                    options={filteredSemesters}
                    placeholder="All Semesters"
                    allValue="All Semesters"
                    disabled={selectedFilterDegree === "all"}
                />
                <FilterSection 
                    label="Subject" 
                    value={selectedFilterSubject} 
                    onValueChange={(val) => {
                        setSelectedFilterSubject(val);
                        setSelectedFilterUnit("all");
                    }}
                    placeholder="All Subjects"
                    allValue="All Subjects"
                    options={filteredSubjects}
                    disabled={selectedFilterSemester === "all"}
                />
                <FilterSection 
                    label="Unit" 
                    value={selectedFilterUnit} 
                    onValueChange={setSelectedFilterUnit}
                    placeholder="All Units"
                    allValue="All Units"
                    options={filteredUnits}
                    disabled={selectedFilterSubject === "all"}
                />
            </div>
        </CardContent>
      </Card>

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
                            {c.type === "video" ? <VideoIcon className="h-4 w-4 text-blue-500" /> : c.type === "note" ? <StickyNote className="h-4 w-4 text-yellow-500" /> : <FileText className="h-4 w-4 text-red-500" />}
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

function FilterSection({ 
    label, 
    value, 
    onValueChange, 
    options, 
    disabled, 
    placeholder,
    allValue 
}: { 
    label: string, 
    value: string, 
    onValueChange: (val: string) => void, 
    options: any[], 
    disabled?: boolean,
    placeholder: string,
    allValue: string
}) {
    return (
        <div className="space-y-1.5 flex-1">
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider ml-1">{label}</label>
            <Select 
                value={value} 
                onValueChange={onValueChange} 
                disabled={disabled}
            >
                <SelectTrigger className="h-10 bg-white border-slate-200">
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">{allValue}</SelectItem>
                    {options.map((opt) => (
                        <SelectItem key={opt._id} value={opt._id}>{opt.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
