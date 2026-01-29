"use client";

import { useState } from "react";
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
import { useDegrees, Degree } from "@/hooks/admin/use-degrees";
import { useSemesters, useCreateSemester, useUpdateSemester, useDeleteSemester, Semester } from "@/hooks/admin/use-semesters";

export default function SemestersPage() {
  const [newSemesterName, setNewSemesterName] = useState("");
  const [selectedDegree, setSelectedDegree] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [editingSemester, setEditingSemester] = useState<Semester | null>(null);
  const [editName, setEditName] = useState("");
  const [editDegreeId, setEditDegreeId] = useState("");

  const { data: degrees = [] } = useDegrees();
  const { data: semesters = [], isLoading: isLoadingSemesters } = useSemesters();
  const createMutation = useCreateSemester();
  const updateMutation = useUpdateSemester();
  const deleteMutation = useDeleteSemester();

  function handleCreate() {
    if (!newSemesterName.trim() || !selectedDegree) return;
    setIsCreating(true);
    createMutation.mutate({ name: newSemesterName, degreeId: selectedDegree }, {
      onSuccess: () => {
        setNewSemesterName("");
        setIsCreating(false);
      },
      onError: () => {
        alert("Failed to create semester");
        setIsCreating(false);
      }
    });
  }

  function handleUpdate() {
    if (!editingSemester || !editName.trim() || !editDegreeId) return;
    updateMutation.mutate({
      id: editingSemester._id,
      name: editName,
      degreeId: editDegreeId,
    }, {
      onSuccess: () => {
        setEditingSemester(null);
      },
      onError: (error) => {
        alert((error as Error).message);
      }
    });
  }

  function handleDelete(id: string) {
    if (
      !confirm(
        "Are you sure you want to delete this semester? This will cascade to all related subjects and units."
      )
    )
      return;
    deleteMutation.mutate(id, {
      onError: () => alert("Failed to delete semester")
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="hidden md:block">
           <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Semesters</h2>
           <p className="text-sm md:text-base text-muted-foreground">Manage semesters within degrees.</p>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button className="w-full sm:w-auto">
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
                <Button onClick={handleCreate} disabled={createMutation.isPending || !selectedDegree || !newSemesterName}>
                    {createMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
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
                <Button onClick={handleUpdate} disabled={updateMutation.isPending || !editDegreeId || !editName}>
                    {updateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Update Semester
                </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoadingSemesters ? (
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
                                    setEditDegreeId(typeof sem.degreeId === 'string' ? sem.degreeId : sem.degreeId?._id || "");
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
                         <p className="text-sm font-medium text-foreground/80 mb-2">{typeof sem.degreeId === 'object' ? sem.degreeId?.name : ''}</p>
                        <p className="text-xs text-muted-foreground">Slug: {sem.slug}</p>
                    </CardContent>
                </Card>
            ))
        )}
      </div>
    </div>
  );
}
