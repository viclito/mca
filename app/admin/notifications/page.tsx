"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2, Trash, Pencil, Megaphone, CheckCircle, XCircle, CalendarClock } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface TimetableEntry {
  date: string;
  subject: string;
  time: string;
}

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: "exam" | "fees" | "general" | "seminar" | "viva" | "image";
  link?: string;
  image?: string;
  images?: string[];
  active: boolean;
  isMain: boolean;
  timetable?: TimetableEntry[];
  createdAt: string;
}

export default function NotificationsPage() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingNotification, setEditingNotification] = useState<Notification | null>(null);

  // Form States
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"exam" | "fees" | "general" | "seminar" | "viva" | "image">("general");
  const [link, setLink] = useState("");
  const [image, setImage] = useState("");
  const [images, setImages] = useState<string[]>([]); // Multiple images
  const [uploading, setUploading] = useState(false); // New state for upload status
  const [isActive, setIsActive] = useState(true);
  const [isMain, setIsMain] = useState(false);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);

  const queryClient = useQueryClient();

  // Fetch Notifications
  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await fetch("/api/admin/notifications");
      if (!res.ok) throw new Error("Failed to fetch notifications");
      return res.json();
    },
  });

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create notification");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["homeData"] });
      resetForm();
      setIsCreating(false);
    },
    onError: () => alert("Failed to create notification"),
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/admin/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update notification");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["homeData"] });
      setEditingNotification(null);
      resetForm();
    },
    onError: () => alert("Failed to update notification"),
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/notifications?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete notification");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["homeData"] });
    },
    onError: () => alert("Failed to delete notification"),
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    
    setUploading(true);
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    try {
        const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
        });
        const data = await res.json();
        if (data.success) {
            setImage(data.url);
        } else {
            alert("Upload failed");
        }
    } catch (err) {
        console.error("Error uploading file:", err);
        alert("Error uploading file");
    } finally {
        setUploading(false);
    }
  };

  // Handle multiple image uploads
  const handleMultipleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of Array.from(e.target.files)) {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (data.success) {
          uploadedUrls.push(data.url);
        }
      }

      setImages([...images, ...uploadedUrls]);
    } catch (err) {
      console.error("Error uploading files:", err);
      alert("Error uploading files");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  function resetForm() {
    setTitle("");
    setMessage("");
    setType("general");
    setLink("");
    setImage("");
    setImages([]);
    setIsActive(true);
    setIsMain(false);
    setTimetable([]);
  }

  function handleCreate() {
    // For image type, title and images are required
    // For other types, title and message are required
    if (!title) return;
    if (type === "image" && images.length === 0) {
      alert("Please upload at least one image for image notifications");
      return;
    }
    if (type !== "image" && !message) {
      alert("Message is required for non-image notifications");
      return;
    }
    
    setIsCreating(true);
    createMutation.mutate({ title, message, type, link, image, images, isMain, timetable });
  }

  function handleUpdate() {
    if (!editingNotification || !title) return;
    if (type === "image" && images.length === 0) {
      alert("Please upload at least one image for image notifications");
      return;
    }
    if (type !== "image" && !message) {
      alert("Message is required for non-image notifications");
      return;
    }
    
    updateMutation.mutate({
      id: editingNotification._id,
      title,
      message,
      type,
      link,
      image,
      images,
      active: isActive,
      isMain,
      timetable,
    });
  }

  function handleDelete(id: string) {
    if (confirm("Are you sure you want to delete this notification?")) {
      deleteMutation.mutate(id);
    }
  }

  function openEdit(n: Notification) {
    setEditingNotification(n);
    setTitle(n.title);
    setMessage(n.message);
    setType(n.type);
    setLink(n.link || "");
    setImage(n.image || "");
    setImages(n.images || []);
    setIsActive(n.active ?? true);
    setIsMain(n.isMain || false);
    setTimetable(n.timetable || []);
  }

  // Timetable Handlers
  function addTimetableRow() {
    setTimetable([...timetable, { date: "", subject: "", time: "" }]);
  }

  function updateTimetableRow(index: number, field: keyof TimetableEntry, value: string) {
    const newTimetable = [...timetable];
    newTimetable[index][field] = value;
    setTimetable(newTimetable);
  }

  function removeTimetableRow(index: number) {
    const newTimetable = [...timetable];
    newTimetable.splice(index, 1);
    setTimetable(newTimetable);
  }

  const renderTimetableSection = () => (
    <div className="space-y-3 pt-2 border-t">
      <div className="flex items-center justify-between">
        <Label>Exam Timetable</Label>
        <Button variant="outline" size="sm" onClick={addTimetableRow}>
          <Plus className="h-3 w-3 mr-1" /> Add Exam
        </Button>
      </div>
      <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
        {timetable.map((row, index) => (
          <div key={index} className="flex gap-2 items-center">
            <Input 
              placeholder="Date (e.g. 12 Jan)" 
              value={row.date} 
              onChange={(e: any) => updateTimetableRow(index, "date", e.target.value)}
              className="flex-1"
            />
             <Input 
              placeholder="Subject" 
              value={row.subject} 
              onChange={(e: any) => updateTimetableRow(index, "subject", e.target.value)}
              className="flex-[2]"
            />
             <Input 
              placeholder="Time" 
              value={row.time} 
              onChange={(e: any) => updateTimetableRow(index, "time", e.target.value)}
              className="flex-1"
            />
            <Button variant="ghost" size="icon" onClick={() => removeTimetableRow(index)} className="text-red-500">
               <XCircle className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {timetable.length === 0 && <p className="text-xs text-muted-foreground text-center py-2">No exam dates added.</p>}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Notifications</h2>
          <p className="text-muted-foreground">Manage announcements and alerts.</p>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" /> Add Notification
            </Button>
          </SheetTrigger>
          <SheetContent className="overflow-y-auto sm:max-w-md w-full">
            <SheetHeader>
              <SheetTitle>New Notification</SheetTitle>
              <SheetDescription>Create a new announcement.</SheetDescription>
            </SheetHeader>
            <div className="py-6 space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={title} onChange={(e: any) => setTitle(e.target.value)} placeholder="e.g. Exam Schedule Release" />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={type} onValueChange={(v: any) => setType(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="exam">Exam</SelectItem>
                    <SelectItem value="fees">Fees</SelectItem>
                    <SelectItem value="seminar">Seminar</SelectItem>
                    <SelectItem value="viva">Viva</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {type === "image" ? (
                // Image notification fields
                <div className="space-y-2">
                  <Label>Images (Required)</Label>
                  {images.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      {images.map((img, idx) => (
                        <div key={idx} className="relative group">
                          <img src={img} alt={`Upload ${idx + 1}`} className="w-full h-32 object-cover rounded-md border" />
                          <Button 
                            variant="destructive" 
                            size="icon" 
                            className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeImage(idx)}
                          >
                            <Trash className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2 items-center">
                    <Input 
                      type="file" 
                      accept="image/*"
                      multiple
                      onChange={handleMultipleImageUpload} 
                      disabled={uploading}
                    />
                    {uploading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                  </div>
                  <p className="text-xs text-muted-foreground">Upload multiple images (JPG, PNG)</p>
                </div>
              ) : (
                // Regular notification fields
                <div className="space-y-2">
                  <Label>Message (Required)</Label>
                  <Textarea value={message} onChange={(e: any) => setMessage(e.target.value)} placeholder="Enter detailed message..." />
                </div>
              )}

              {type === "exam" && renderTimetableSection()}

              <div className="space-y-2">
                <Label>Link (Optional)</Label>
                <Input value={link} onChange={(e: any) => setLink(e.target.value)} placeholder="https://..." />
              </div>
              {type !== "image" && (
                <div className="space-y-2">
                  <Label>Image URL (Optional)</Label>
                  <Input value={image} onChange={(e: any) => setImage(e.target.value)} placeholder="https://... (Image Link)" />
                </div>
              )}
               <div className="flex items-center space-x-2 pt-2">
                  <Switch checked={isMain} onCheckedChange={setIsMain} id="main-mode" />
                  <Label htmlFor="main-mode">Set as Main Notification</Label>
              </div>
            </div>
            <SheetFooter>
              <SheetClose asChild>
                 <Button variant="outline">Cancel</Button>
              </SheetClose>
              <Button onClick={handleCreate} disabled={createMutation.isPending || !title || (type === "image" && images.length === 0) || (type !== "image" && !message)}>
                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
        
        {/* Edit Sheet */}
        <Sheet open={!!editingNotification} onOpenChange={(open) => !open && setEditingNotification(null)}>
            <SheetContent className="overflow-y-auto sm:max-w-md w-full">
            <SheetHeader>
              <SheetTitle>Edit Notification</SheetTitle>
              <SheetDescription>Update announcement details.</SheetDescription>
            </SheetHeader>
            <div className="py-6 space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={title} onChange={(e: any) => setTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={type} onValueChange={(v: any) => setType(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="exam">Exam</SelectItem>
                    <SelectItem value="fees">Fees</SelectItem>
                    <SelectItem value="seminar">Seminar</SelectItem>
                     <SelectItem value="viva">Viva</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {type === "image" ? (
                // Image notification fields
                <div className="space-y-2">
                  <Label>Images (Required)</Label>
                  {images.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      {images.map((img, idx) => (
                        <div key={idx} className="relative group">
                          <img src={img} alt={`Upload ${idx + 1}`} className="w-full h-32 object-cover rounded-md border" />
                          <Button 
                            variant="destructive" 
                            size="icon" 
                            className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeImage(idx)}
                          >
                            <Trash className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2 items-center">
                    <Input 
                      type="file" 
                      accept="image/*"
                      multiple
                      onChange={handleMultipleImageUpload} 
                      disabled={uploading}
                    />
                    {uploading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                  </div>
                  <p className="text-xs text-muted-foreground">Upload multiple images (JPG, PNG)</p>
                </div>
              ) : (
                // Regular notification fields
                <div className="space-y-2">
                  <Label>Message (Required)</Label>
                  <Textarea value={message} onChange={(e: any) => setMessage(e.target.value)} />
                </div>
              )}

              {type === "exam" && renderTimetableSection()}

              <div className="space-y-2">
                <Label>Link (Optional)</Label>
                <Input value={link} onChange={(e: any) => setLink(e.target.value)} />
              </div>
              {type !== "image" && (
                <div className="space-y-2">
                  <Label>Image URL (Optional)</Label>
                  <Input value={image} onChange={(e: any) => setImage(e.target.value)} />
                </div>
              )}
              <div className="flex items-center space-x-2 pt-2">
                  <Switch checked={isActive} onCheckedChange={setIsActive} id="active-mode" />
                  <Label htmlFor="active-mode">Active Status</Label>
              </div>
               <div className="flex items-center space-x-2 pt-2">
                  <Switch checked={isMain} onCheckedChange={setIsMain} id="main-mode-edit" />
                  <Label htmlFor="main-mode-edit">Set as Main Notification</Label>
              </div>
            </div>
            <SheetFooter>
              <Button variant="outline" onClick={() => setEditingNotification(null)}>Cancel</Button>
              <Button onClick={handleUpdate} disabled={updateMutation.isPending || !title || (type === "image" && images.length === 0) || (type !== "image" && !message)}>
                {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <p>Loading...</p>
        ) : notifications.length === 0 ? (
          <p className="text-muted-foreground col-span-full text-center py-10">No notifications found.</p>
        ) : (
          notifications.map((n) => (
            <Card key={n._id} className={cn(!n.active ? "opacity-60" : "", n.isMain ? "border-primary border-2" : "")}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="space-y-1 pr-2">
                  <CardTitle className="text-base font-semibold leading-tight line-clamp-1 flex items-center gap-2">
                    {n.title}
                    {n.isMain && <Megaphone className="h-4 w-4 text-primary animate-pulse" />}
                  </CardTitle>
                  <CardDescription className="text-xs capitalize flex items-center gap-1">
                     {n.type} • {n.active ? <span className="text-green-600 flex items-center gap-0.5"><CheckCircle className="h-3 w-3"/> Active</span> : <span className="text-muted-foreground flex items-center gap-0.5"><XCircle className="h-3 w-3"/> Inactive</span>}
                  </CardDescription>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-blue-500" onClick={() => openEdit(n)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-500" onClick={() => handleDelete(n._id)}>
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-2">{n.message}</p>
                 {n.type === 'exam' && n.timetable && n.timetable.length > 0 && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-blue-600 font-medium">
                        <CalendarClock className="h-3 w-3" />
                        {n.timetable.length} exam dates scheduled
                    </div>
                )}
                {n.link && <a href={n.link} target="_blank" rel="noreferrer" className={cn("text-xs text-primary hover:underline break-all block truncate", n.type === 'exam' && n.timetable && n.timetable.length > 0 ? "mt-2" : "")}>{n.link}</a>}
                <div className="text-[10px] text-muted-foreground mt-3">
                    Created: {new Date(n.createdAt).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

