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
import { Plus, Loader2, Trash, Pencil, Filter, X } from "lucide-react";
import { useDegrees, Degree } from "@/hooks/admin/use-degrees";
import { useSemesters, Semester } from "@/hooks/admin/use-semesters";
import { useSubjects, Subject } from "@/hooks/admin/use-subjects";
import { useUnits, useCreateUnit, useUpdateUnit, useDeleteUnit, Unit } from "@/hooks/admin/use-units";

export default function UnitsPage() {
  // Create State
  const [isCreating, setIsCreating] = useState(false);
  const [newUnitName, setNewUnitName] = useState("");
  const [selectedDegree, setSelectedDegree] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  // Edit State
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [editName, setEditName] = useState("");
  const [editDegreeId, setEditDegreeId] = useState("");
  const [editSemesterId, setEditSemesterId] = useState("");
  const [editSubjectId, setEditSubjectId] = useState("");

  // Filter State for List View
  const [selectedFilterDegree, setSelectedFilterDegree] = useState("all");
  const [selectedFilterSemester, setSelectedFilterSemester] = useState("all");
  const [selectedFilterSubject, setSelectedFilterSubject] = useState("all");

  // Fetch Degrees
  const { data: degrees = [] } = useDegrees();

  // Fetch Semesters
  const { data: semesters = [] } = useSemesters();

  // Fetch Subjects
  const { data: subjects = [] } = useSubjects();

  // Derived Filter Lists
  const filterSemesters = (selectedFilterDegree && selectedFilterDegree !== "all") 
    ? semesters.filter(s => s.degreeId === selectedFilterDegree || (s.degreeId as any)._id === selectedFilterDegree)
    : [];
    
  const filterSubjects = (selectedFilterSemester && selectedFilterSemester !== "all")
    ? subjects.filter(s => s.semesterId === selectedFilterSemester || (s.semesterId as any)._id === selectedFilterSemester)
    : [];

  // Fetch Units
  const { data: units = [], isLoading: isLoadingUnits } = useUnits({
    degreeId: selectedFilterDegree,
    semesterId: selectedFilterSemester,
    subjectId: selectedFilterSubject,
  });

  // Derived Lists for Create/Edit
  const createSemesters = selectedDegree
    ? semesters.filter(s => s.degreeId === selectedDegree || (s.degreeId as any)._id === selectedDegree)
    : [];
  const createSubjects = selectedSemester
    ? subjects.filter(s => s.semesterId === selectedSemester || (s.semesterId as any)._id === selectedSemester)
    : [];

  const editSemesters = editDegreeId
    ? semesters.filter(s => s.degreeId === editDegreeId || (s.degreeId as any)._id === editDegreeId)
    : [];
  const editSubjects = editSemesterId
    ? subjects.filter(s => s.semesterId === editSemesterId || (s.semesterId as any)._id === editSemesterId)
    : [];

  // Create Unit
  const createMutation = useCreateUnit();

  // Update Unit
  const updateMutation = useUpdateUnit();

  // Delete Unit
  const deleteMutation = useDeleteUnit();


  function handleCreate() {
    if (!newUnitName || !selectedSubject) return;
    setIsCreating(true);
    createMutation.mutate(
      { name: newUnitName, subjectId: selectedSubject },
      {
        onSuccess: () => {
          setNewUnitName("");
          setIsCreating(false);
        },
        onError: () => {
           alert("Failed to create unit");
           setIsCreating(false);
        }
      }
    );
  }

  const activeFiltersCount = [
    selectedFilterDegree !== "all",
    selectedFilterSemester !== "all",
    selectedFilterSubject !== "all"
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSelectedFilterDegree("all");
    setSelectedFilterSemester("all");
    setSelectedFilterSubject("all");
  };

  function handleUpdate() {
    if (!editingUnit || !editName || !editSubjectId) return;
    updateMutation.mutate(
      {
        id: editingUnit._id,
        name: editName,
        subjectId: editSubjectId,
      },
      {
        onSuccess: () => {
          setEditingUnit(null);
        },
        onError: (error) => {
           alert((error as Error).message);
        }
      }
    );
  }

  function handleDelete(id: string) {
    if (
      !confirm(
        "Are you sure you want to delete this unit? This will not delete actual content items but will break the structural link."
      )
    )
      return;
    deleteMutation.mutate(id, {
        onError: () => alert("Failed to delete unit")
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="hidden md:block">
           <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Units</h2>
           <p className="text-sm md:text-base text-muted-foreground">Manage units within subjects.</p>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" /> Add Unit
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Add New Unit</SheetTitle>
              <SheetDescription>
                Select Subject to add unit to.
              </SheetDescription>
            </SheetHeader>
            <div className="py-6 space-y-4">
               <div className="space-y-2">
                  <label className="text-sm font-medium">Degree</label>
                  <Select 
                    value={selectedDegree} 
                    onValueChange={(val) => {
                      setSelectedDegree(val);
                      setSelectedSemester("");
                      setSelectedSubject("");
                    }}
                  >
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
                  <Select 
                    value={selectedSemester} 
                    onValueChange={(val) => {
                      setSelectedSemester(val);
                      setSelectedSubject("");
                    }}
                    disabled={!selectedDegree}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Semester" />
                    </SelectTrigger>
                    <SelectContent>
                      {createSemesters.map((s) => (
                        <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
               </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject</label>
                  <Select onValueChange={setSelectedSubject} value={selectedSubject} disabled={!selectedSemester}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {createSubjects.map((s) => (
                        <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
               </div>
               <div className="space-y-2">
                  <label className="text-sm font-medium">Unit Name</label>
                  <Input 
                    placeholder="e.g. Unit 1" 
                    value={newUnitName}
                    onChange={(e) => setNewUnitName(e.target.value)}
                  />
               </div>
            </div>
            <SheetFooter>
                <SheetClose asChild>
                    <Button variant="outline">Cancel</Button>
                </SheetClose>
                <Button onClick={handleCreate} disabled={createMutation.isPending || !selectedSubject || !newUnitName}>
                    {createMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Create Unit
                </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        {/* Edit Unit Sheet */}
        <Sheet open={!!editingUnit} onOpenChange={(open) => !open && setEditingUnit(null)}>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Edit Unit</SheetTitle>
              <SheetDescription>
                Update unit details and associations.
              </SheetDescription>
            </SheetHeader>
            <div className="py-6 space-y-4">
               <div className="space-y-2">
                  <label className="text-sm font-medium">Degree</label>
                  <Select 
                    value={editDegreeId} 
                    onValueChange={(val) => {
                      setEditDegreeId(val);
                      setEditSemesterId("");
                      setEditSubjectId("");
                    }}
                  >
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
                  <Select 
                    value={editSemesterId} 
                    onValueChange={(val) => {
                      setEditSemesterId(val);
                      setEditSubjectId("");
                    }}
                    disabled={!editDegreeId}
                  >
                    <SelectTrigger><SelectValue placeholder="Select Semester" /></SelectTrigger>
                    <SelectContent>
                      {editSemesters.map((s) => (
                        <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
               </div>
               <div className="space-y-2">
                  <label className="text-sm font-medium">Subject</label>
                  <Select onValueChange={setEditSubjectId} value={editSubjectId} disabled={!editSemesterId}>
                    <SelectTrigger><SelectValue placeholder="Select Subject" /></SelectTrigger>
                    <SelectContent>
                      {editSubjects.map((s) => (
                        <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
               </div>
               <div className="space-y-2">
                  <label className="text-sm font-medium">Unit Name</label>
                  <Input 
                    placeholder="e.g. Unit 1" 
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
               </div>
            </div>
            <SheetFooter>
                <Button variant="outline" onClick={() => setEditingUnit(null)}>Cancel</Button>
                <Button onClick={handleUpdate} disabled={updateMutation.isPending || !editSubjectId || !editName}>
                    {updateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Update Unit
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
                    <span>Filter Units</span>
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
                        <SheetContent side="bottom" className="h-[70vh] rounded-t-[20px]">
                            <SheetHeader className="text-left">
                                <SheetTitle>Filters</SheetTitle>
                                <SheetDescription>Refine the units list</SheetDescription>
                            </SheetHeader>
                            <div className="py-6 space-y-6">
                                <FilterSection 
                                    label="Degree" 
                                    value={selectedFilterDegree} 
                                    onValueChange={(val) => {
                                        setSelectedFilterDegree(val);
                                        setSelectedFilterSemester("all");
                                        setSelectedFilterSubject("all");
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
                                    }}
                                    options={filterSemesters}
                                    placeholder="All Semesters"
                                    allValue="All Semesters"
                                    disabled={selectedFilterDegree === "all"}
                                />
                                <FilterSection 
                                    label="Subject" 
                                    value={selectedFilterSubject} 
                                    onValueChange={setSelectedFilterSubject}
                                    placeholder="All Subjects"
                                    allValue="All Subjects"
                                    options={filterSubjects}
                                    disabled={selectedFilterSemester === "all"}
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
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
                <FilterSection 
                    label="Degree" 
                    value={selectedFilterDegree} 
                    onValueChange={(val) => {
                        setSelectedFilterDegree(val);
                        setSelectedFilterSemester("all");
                        setSelectedFilterSubject("all");
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
                    }}
                    options={filterSemesters}
                    placeholder="All Semesters"
                    allValue="All Semesters"
                    disabled={selectedFilterDegree === "all"}
                />
                <FilterSection 
                    label="Subject" 
                    value={selectedFilterSubject} 
                    onValueChange={setSelectedFilterSubject}
                    placeholder="All Subjects"
                    allValue="All Subjects"
                    options={filterSubjects}
                    disabled={selectedFilterSemester === "all"}
                />
            </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoadingUnits ? (
            <p>Loading...</p>
        ) : units.length === 0 ? (
            <p className="text-muted-foreground col-span-full text-center py-10">No units found.</p>
        ) : (
            units.map((unit) => (
                <Card key={unit._id}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="font-semibold text-lg">{unit.name}</CardTitle>
                         <div className="flex items-center gap-1">
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-muted-foreground hover:text-blue-500"
                                onClick={() => {
                                    setEditingUnit(unit);
                                    setEditName(unit.name);
                                    setEditDegreeId(unit.subjectId?.semesterId?.degreeId?._id || "");
                                    setEditSemesterId(unit.subjectId?.semesterId?._id || "");
                                    setEditSubjectId(unit.subjectId?._id || "");
                                }}
                            >
                                <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-muted-foreground hover:text-red-500"
                                onClick={() => handleDelete(unit._id)}
                            >
                                 <Trash className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                         <div className="text-sm text-foreground/80 mb-1">
                             {unit.subjectId?.name}
                         </div>
                        <p className="text-xs text-muted-foreground">Slug: {unit.slug}</p>
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
