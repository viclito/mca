"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash, GripVertical, Save, ArrowLeft, Loader2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"; // using dnd for sorting
import { Badge } from "@/components/ui/badge";

interface FormField {
  id: string;
  label: string;
  type: "text" | "number" | "textarea" | "select" | "file" | "date";
  placeholder?: string;
  required: boolean;
  options?: string[]; // strings for simplicity
}

export default function FormBuilderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const formId = searchParams.get("id");
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"draft" | "active" | "closed">("draft");
  const [fields, setFields] = useState<FormField[]>([]);
  const [assignedStudents, setAssignedStudents] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [availableStudents, setAvailableStudents] = useState<any[]>([]);
  const [studentSearch, setStudentSearch] = useState("");

  // Fetch Logic if editing an existing form
  useEffect(() => {
    // Fetch available students
    fetch("/api/admin/students/eligible")
      .then(res => res.json())
      .then(data => setAvailableStudents(data));

    if (formId) {
      setLoading(true);
      fetch("/api/admin/forms")
        .then((res) => res.json())
        .then((forms) => {
          const form = forms.find((f: any) => f._id === formId);
          if (form) {
            setTitle(form.title);
            setDescription(form.description);
            setStatus(form.status);
            setFields(form.fields || []);
            setAssignedStudents(form.assignedStudents || []);
          }
           setLoading(false);
        });
    }
  }, [formId]);

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const method = formId ? "PUT" : "POST";
      const payload = { ...data, id: formId }; 
      
      const res = await fetch("/api/admin/forms", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: "Failed to save form" }));
        throw new Error(errData.error || "Failed to save form");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-forms"] });
      router.push("/admin/forms");
    },
  });

  const addField = () => {
    const newField: FormField = {
      id: Math.random().toString(36).substr(2, 9),
      label: "New Field",
      type: "text",
      required: false,
      placeholder: "",
    };
    setFields([...fields, newField]);
  };

  const removeField = (index: number) => {
    const newFields = [...fields];
    newFields.splice(index, 1);
    setFields(newFields);
  };

  const updateField = (index: number, key: keyof FormField, value: any) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], [key]: value };
    setFields(newFields);
  };

  const handleOnDragEnd = (result: any) => {
    if (!result.destination) return;
    const items = Array.from(fields);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setFields(items);
  };

  // Need to use session for createdBy?
  // Let's implement a quick session check or update the API to use the session user.
  // For now I will assume the API (from step 309) requires `createdBy` in body for POST.
  // I will fetch the session user to pass it.
  

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/forms">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{formId ? "Edit Form" : "Create Form"}</h1>
        </div>
        <Button onClick={() => saveMutation.mutate({ 
            title, 
            description, 
            status, 
            fields, 
            assignedStudents
        })} disabled={saveMutation.isPending || !title}>
          {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Form
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Sidebar Settings */}
        <div className="md:col-span-1 space-y-6">
           <Card>
            <CardHeader>
                <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label>Form Title</Label>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Student Survey" />
                </div>
                <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Briefly describe..." />
                </div>
                <div className="space-y-2">
                    <Label>Status</Label>
                     <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="draft">Draft (Hidden)</SelectItem>
                            <SelectItem value="active">Active (Visible)</SelectItem>
                            <SelectItem value="closed">Closed (No Submissions)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
           </Card>

           <Card>
            <CardHeader>
                <CardTitle className="text-sm">Target Students</CardTitle>
                <p className="text-[10px] text-muted-foreground">Select specific students or leave empty for all.</p>
            </CardHeader>
            <CardContent className="space-y-4">
                <Input 
                    placeholder="Search students..." 
                    value={studentSearch} 
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="h-8 text-xs"
                />
                
                <div className="max-h-[300px] overflow-y-auto space-y-2 border rounded-md p-2">
                    {availableStudents
                        .filter(s => 
                            (s.name?.toLowerCase() || "").includes(studentSearch.toLowerCase()) || 
                            (s.email?.toLowerCase() || "").includes(studentSearch.toLowerCase())
                        )
                        .map(student => (
                            <div key={student._id} className="flex items-center space-x-2">
                                <input 
                                    type="checkbox"
                                    id={student._id}
                                    checked={assignedStudents.includes(student._id)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setAssignedStudents([...assignedStudents, student._id]);
                                        } else {
                                            setAssignedStudents(assignedStudents.filter(id => id !== student._id));
                                        }
                                    }}
                                    className="h-3 w-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <label htmlFor={student._id} className="text-xs truncate cursor-pointer select-none">
                                    {student.name}
                                </label>
                            </div>
                        ))}
                </div>

                {assignedStudents.length > 0 && (
                    <div className="pt-2 border-t">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Selected ({assignedStudents.length})</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                            {assignedStudents.map(id => {
                                const student = availableStudents.find(s => s._id === id);
                                if (!student) return null;
                                return (
                                    <Badge key={id} variant="secondary" className="text-[9px] px-1 py-0 h-4">
                                        {student.name ? student.name.split(' ')[0] : student.email?.split('@')[0] || "Unnamed"}
                                        <button 
                                            onClick={() => setAssignedStudents(assignedStudents.filter(sid => sid !== id))}
                                            className="ml-1 hover:text-red-500"
                                        >
                                            ×
                                        </button>
                                    </Badge>
                                );
                            })}
                        </div>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-[10px] h-6 px-0 mt-2 text-red-500 hover:text-red-600 hover:bg-transparent"
                            onClick={() => setAssignedStudents([])}
                        >
                            Clear Selection (Target All)
                        </Button>
                    </div>
                )}
                {assignedStudents.length === 0 && (
                     <div className="p-2 bg-blue-50 text-blue-700 rounded text-[10px] font-medium text-center">
                        Visible to all students.
                    </div>
                )}
            </CardContent>
           </Card>
        </div>

        {/* Builder Area */}
        <div className="md:col-span-2 space-y-6">
            <DragDropContext onDragEnd={handleOnDragEnd}>
                <Droppable droppableId="fields">
                    {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4 min-h-[200px]">
                            {fields.map((field, index) => (
                                <Draggable key={field.id} draggableId={field.id} index={index}>
                                    {(provided) => (
                                        <Card ref={provided.innerRef} {...provided.draggableProps} className="relative group hover:border-blue-300 transition-colors">
                                            <div {...provided.dragHandleProps} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600 cursor-move p-2">
                                                <GripVertical className="h-4 w-4" />
                                            </div>
                                            <CardContent className="p-4 pl-12 space-y-4">
                                                <div className="flex gap-4">
                                                    <div className="flex-1 space-y-2">
                                                        <Input 
                                                            value={field.label} 
                                                            onChange={(e) => updateField(index, "label", e.target.value)}
                                                            className="font-semibold border-transparent hover:border-input focus:border-input px-0 h-auto py-1 text-base bg-transparent"
                                                        />
                                                    </div>
                                                    <Select value={field.type} onValueChange={(v: any) => updateField(index, "type", v)}>
                                                        <SelectTrigger className="w-[120px]">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="text">Text</SelectItem>
                                                            <SelectItem value="number">Number</SelectItem>
                                                            <SelectItem value="textarea">Long Text</SelectItem>
                                                            <SelectItem value="select">Dropdown</SelectItem>
                                                            <SelectItem value="date">Date</SelectItem>
                                                            <SelectItem value="file">File</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-500" onClick={() => removeField(index)}>
                                                        <Trash className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-1">
                                                        <Label className="text-xs text-muted-foreground">Placeholder</Label>
                                                        <Input value={field.placeholder} onChange={(e) => updateField(index, "placeholder", e.target.value)} className="h-8 text-xs" />
                                                    </div>
                                                    <div className="flex items-center space-x-2 pt-5">
                                                        <Switch checked={field.required} onCheckedChange={(c) => updateField(index, "required", c)} id={`req-${field.id}`} />
                                                        <Label htmlFor={`req-${field.id}`} className="text-xs">Required</Label>
                                                    </div>
                                                </div>

                                                {field.type === "select" && (
                                                    <div className="space-y-2 pt-2 border-t border-dashed">
                                                        <Label className="text-xs">Options (Reference Only - Comma separated)</Label>
                                                        <Input 
                                                            value={field.options?.join(", ") || ""} 
                                                            onChange={(e) => updateField(index, "options", e.target.value.split(",").map(s => s.trim()).filter(s => s !== ""))} 
                                                            placeholder="Option 1, Option 2, Option 3"
                                                            className="h-8 text-xs"
                                                        />
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>

            <Button onClick={addField} variant="outline" className="w-full border-dashed py-8">
                <Plus className="mr-2 h-4 w-4" /> Add Field
            </Button>
        </div>
      </div>
    </div>
  );
}
