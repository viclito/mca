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
  SheetClose,
} from "@/components/ui/sheet";
import { Plus, Loader2, Trash, Pencil } from "lucide-react";
import { format } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Degree {
  _id: string;
  name: string;
  slug: string;
  createdAt: string;
}

export default function DegreesPage() {
  const [isCreating, setIsCreating] = useState(false);
  const [newDegreeName, setNewDegreeName] = useState("");
  const [editingDegree, setEditingDegree] = useState<Degree | null>(null);
  const [editName, setEditName] = useState("");

  const queryClient = useQueryClient();

  // Fetch Degrees
  const { data: degrees = [], isLoading } = useQuery<Degree[]>({
    queryKey: ["degrees"],
    queryFn: async () => {
      const res = await fetch("/api/admin/degrees");
      if (!res.ok) throw new Error("Failed to fetch degrees");
      return res.json();
    },
  });

  // Create Degree
  const createMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch("/api/admin/degrees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Failed to create degree");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["degrees"] });
      setNewDegreeName("");
      setIsCreating(false);
    },
    onError: () => {
      alert("Failed to create degree");
      setIsCreating(false);
    },
  });

  // Update Degree
  const updateMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const res = await fetch("/api/admin/degrees", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, name }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to update degree");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["degrees"] });
      setEditingDegree(null);
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  // Delete Degree
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/degrees?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete degree");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["degrees"] });
    },
    onError: () => {
      alert("Failed to delete degree");
    },
  });

  function handleCreate() {
    if (!newDegreeName) return;
    setIsCreating(true);
    createMutation.mutate(newDegreeName);
  }

  function handleUpdate() {
    if (!editingDegree || !editName) return;
    updateMutation.mutate({ id: editingDegree._id, name: editName });
  }

  function handleDelete(id: string) {
    if (
      !confirm(
        "Are you sure you want to delete this degree? This will not delete sub-items but may break references."
      )
    )
      return;
    deleteMutation.mutate(id);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="hidden md:block">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Degrees
          </h2>
          <p className="text-sm md:text-base text-muted-foreground">
            Manage the educational degrees available.
          </p>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" /> Add Degree
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Add New Degree</SheetTitle>
              <SheetDescription>
                Create a new degree program (e.g., MCA, BCA).
              </SheetDescription>
            </SheetHeader>
            <div className="py-6 space-y-4">
              <div className="space-y-2">
                <Input
                  placeholder="Degree Name (e.g. Master of Computer Applications)"
                  value={newDegreeName}
                  onChange={(e) => setNewDegreeName(e.target.value)}
                />
              </div>
            </div>
            <SheetFooter>
              <SheetClose asChild>
                <Button variant="outline">Cancel</Button>
              </SheetClose>
              <Button onClick={handleCreate} disabled={createMutation.isPending}>
                {createMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Create Degree
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        {/* Edit Degree Sheet */}
        <Sheet
          open={!!editingDegree}
          onOpenChange={(open) => !open && setEditingDegree(null)}
        >
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Edit Degree</SheetTitle>
              <SheetDescription>
                Update the degree program details.
              </SheetDescription>
            </SheetHeader>
            <div className="py-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Degree Name</label>
                <Input
                  placeholder="Degree Name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>
            </div>
            <SheetFooter>
              <Button variant="outline" onClick={() => setEditingDegree(null)}>
                Cancel
              </Button>
              <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Update Degree
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <p>Loading...</p>
        ) : degrees.length === 0 ? (
          <p className="text-muted-foreground col-span-full text-center py-10">
            No degrees found.
          </p>
        ) : (
          degrees.map((degree) => (
            <Card key={degree._id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="font-semibold text-lg">
                  {degree.name}
                </CardTitle>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-blue-500"
                    onClick={() => {
                      setEditingDegree(degree);
                      setEditName(degree.name);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-red-500"
                    onClick={() => handleDelete(degree._id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Slug: {degree.slug}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Added: {format(new Date(degree.createdAt), "PPP")}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
