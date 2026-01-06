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

interface Degree { _id: string; name: string; }
interface Semester { _id: string; name: string; degreeId: string; }
interface Subject { _id: string; name: string; semesterId: string; }
interface Unit {
    _id: string;
    name: string;
    slug: string;
    subjectId: {
        _id: string;
        name: string;
        semesterId: {
            _id: string;
            name: string;
            degreeId: Degree;
        }
    }
}

export default function UnitsPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [degrees, setDegrees] = useState<Degree[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  
  const [filteredSemesters, setFilteredSemesters] = useState<Semester[]>([]);
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const [newUnitName, setNewUnitName] = useState("");
  const [selectedDegree, setSelectedDegree] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [editName, setEditName] = useState("");
  const [editDegreeId, setEditDegreeId] = useState("");
  const [editSemesterId, setEditSemesterId] = useState("");
  const [editSubjectId, setEditSubjectId] = useState("");
  
  const [editFilteredSemesters, setEditFilteredSemesters] = useState<Semester[]>([]);
  const [editFilteredSubjects, setEditFilteredSubjects] = useState<Subject[]>([]);

  useEffect(() => {
    fetchDegrees();
    fetchSemesters();
    fetchSubjects();
    fetchUnits();
  }, []);

  useEffect(() => {
    if (selectedDegree) {
      setFilteredSemesters(semesters.filter(s => s.degreeId === selectedDegree || (s.degreeId as any)._id === selectedDegree));
    } else {
        setFilteredSemesters([]);
    }
    setSelectedSemester("");
    setSelectedSubject("");
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
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/units");
      setUnits(await res.json());
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreate() {
    if (!newUnitName || !selectedSubject) return;
    setIsCreating(true);
    try {
      const res = await fetch("/api/admin/units", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newUnitName, subjectId: selectedSubject }),
      });
      if (res.ok) {
        setNewUnitName("");
        fetchUnits();
      } else {
          alert("Failed to create unit");
      }
    } finally {
      setIsCreating(false);
    }
  }

  async function handleUpdate() {
    if (!editingUnit || !editName || !editSubjectId) return;
    setIsUpdating(true);
    try {
      const res = await fetch("/api/admin/units", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            id: editingUnit._id, 
            name: editName, 
            subjectId: editSubjectId 
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setUnits(units.map(u => u._id === updated._id ? updated : u));
        setEditingUnit(null);
      } else {
        const err = await res.json();
        alert(err.message || "Failed to update unit");
      }
    } catch (error) {
       console.error(error);
       alert("Error updating unit");
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this unit? This will not delete actual content items but will break the structural link.")) return;
    
    try {
      const res = await fetch(`/api/admin/units?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setUnits(units.filter(u => u._id !== id));
      } else {
        alert("Failed to delete unit");
      }
    } catch (error) {
      console.error(error);
      alert("Error deleting unit");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
           <h2 className="text-3xl font-bold tracking-tight">Units</h2>
           <p className="text-muted-foreground">Manage units within subjects.</p>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button>
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
                  <label className="text-sm font-medium">Subject</label>
                  <Select onValueChange={setSelectedSubject} value={selectedSubject} disabled={!selectedSemester}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredSubjects.map((s) => (
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
                <Button onClick={handleCreate} disabled={isCreating || !selectedSubject || !newUnitName}>
                    {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
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
                  <label className="text-sm font-medium">Subject</label>
                  <Select onValueChange={setEditSubjectId} value={editSubjectId} disabled={!editSemesterId}>
                    <SelectTrigger><SelectValue placeholder="Select Subject" /></SelectTrigger>
                    <SelectContent>
                      {editFilteredSubjects.map((s) => (
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
                <Button onClick={handleUpdate} disabled={isUpdating || !editSubjectId || !editName}>
                    {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Update Unit
                </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
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
