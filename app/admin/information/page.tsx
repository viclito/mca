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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Loader2, Trash, Download, Upload, FileSpreadsheet, CheckCircle, XCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { parseCSV, validateCSV } from "@/lib/csvParser";
import { Badge } from "@/components/ui/badge";

interface Information {
  _id: string;
  title: string;
  description?: string;
  columns: string[];
  permissionMode: "view-only" | "editable" | "edit-with-proof";
  active: boolean;
  createdAt: string;
  createdBy?: { name: string; email: string };
}

interface ChangeRequestItem {
  _id: string;
  informationId: { _id: string; title: string };
  rowId: any;
  proposedChanges: Record<string, any>;
  proofImages: string[];
  requestedBy: { name: string; email: string };
  status: string;
  createdAt: string;
}

export default function InformationPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<{ columns: string[]; rows: Record<string, any>[] } | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [permissionMode, setPermissionMode] = useState<"view-only" | "editable" | "edit-with-proof">("view-only");
  const [uploading, setUploading] = useState(false);
  const [selectedChangeRequest, setSelectedChangeRequest] = useState<ChangeRequestItem | null>(null);

  const queryClient = useQueryClient();

  const { data: informationList = [], isLoading } = useQuery<Information[]>({
    queryKey: ["adminInformation"],
    queryFn: async () => {
      const res = await fetch("/api/admin/information");
      if (!res.ok) throw new Error("Failed to fetch information");
      return res.json();
    },
  });

  const { data: changeRequests = [] } = useQuery<ChangeRequestItem[]>({
    queryKey: ["changeRequests"],
    queryFn: async () => {
      const res = await fetch("/api/admin/change-requests");
      if (!res.ok) throw new Error("Failed to fetch change requests");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/admin/information", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create information");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminInformation"] });
      handleDialogClose();
    },
    onError: () => alert("Failed to create information"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/information?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminInformation"] });
    },
  });

  const changeRequestMutation = useMutation({
    mutationFn: async ({ id, action, reviewNotes }: { id: string; action: string; reviewNotes?: string }) => {
      const res = await fetch("/api/admin/change-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action, reviewNotes }),
      });
      if (!res.ok) throw new Error("Failed to process change request");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["changeRequests"] });
      setSelectedChangeRequest(null);
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setUploading(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csvContent = event.target?.result as string;
        const parsed = parseCSV(csvContent);
        const validation = validateCSV(parsed);

        if (!validation.valid) {
          alert(validation.error);
          setSelectedFile(null);
          setParsedData(null);
        } else {
          setParsedData(parsed);
        }
      } catch (error) {
        alert("Error parsing CSV file");
        console.error(error);
        setSelectedFile(null);
        setParsedData(null);
      } finally {
        setUploading(false);
      }
    };

    reader.readAsText(file);
  };

  const handleCreate = () => {
    if (!title || !parsedData) return;

    createMutation.mutate({
      title,
      description,
      columns: parsedData.columns,
      rows: parsedData.rows,
      permissionMode,
    });
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedFile(null);
    setParsedData(null);
    setTitle("");
    setDescription("");
    setPermissionMode("view-only");
  };

  const handleDownload = async (id: string, title: string) => {
    try {
      const res = await fetch(`/api/admin/information/${id}/export`);
      if (!res.ok) throw new Error("Failed to export");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${title}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      alert("Failed to download CSV");
      console.error(error);
    }
  };

  const handleChangeRequestAction = (action: "approve" | "reject") => {
    if (!selectedChangeRequest) return;
    changeRequestMutation.mutate({ id: selectedChangeRequest._id, action });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Information</h2>
          <p className="text-muted-foreground">Manage CSV-based information for students.</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Upload CSV
        </Button>
      </div>

      {changeRequests.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-900">Pending Change Requests ({changeRequests.length})</CardTitle>
            <CardDescription>Students have requested changes that require your approval.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {changeRequests.map((cr) => (
              <div key={cr._id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                <div>
                  <p className="font-medium">{cr.informationId.title}</p>
                  <p className="text-sm text-muted-foreground">Requested by {cr.requestedBy.name}</p>
                </div>
                <Button size="sm" onClick={() => setSelectedChangeRequest(cr)}>
                  Review
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <p>Loading...</p>
        ) : informationList.length === 0 ? (
          <p className="text-muted-foreground col-span-full text-center py-10">No information uploaded yet.</p>
        ) : (
          informationList.map((info) => (
            <Card key={info._id}>
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  {info.title}
                </CardTitle>
                <div className="mt-1">
                  <Badge variant={info.active ? "default" : "secondary"}>
                    {info.active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <CardDescription>{info.description || "No description"}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Mode:</span>{" "}
                    <Badge variant="outline">{info.permissionMode}</Badge>
                  </div>
                  <p className="text-muted-foreground">{info.columns.length} columns</p>
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" onClick={() => handleDownload(info._id, info.title)}>
                      <Download className="h-4 w-4 mr-1" /> CSV
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(info._id)}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload CSV Information</DialogTitle>
            <DialogDescription>Upload a CSV file to create a new information table for students.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Semester Results" />
            </div>
            <div className="space-y-2">
              <Label>Description (Optional)</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description..." />
            </div>
            <div className="space-y-2">
              <Label>Permission Mode</Label>
              <Select value={permissionMode} onValueChange={(v: any) => setPermissionMode(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view-only">View Only</SelectItem>
                  <SelectItem value="editable">Editable</SelectItem>
                  <SelectItem value="edit-with-proof">Edit with Proof</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>CSV File</Label>
              <div className="flex items-center gap-2">
                <Input type="file" accept=".csv" onChange={handleFileChange} disabled={uploading} />
                {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
              </div>
            </div>
            {parsedData && (
              <div className="border rounded-lg p-3 bg-green-50">
                <p className="text-sm font-medium text-green-900 flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  CSV parsed successfully: {parsedData.columns.length} columns, {parsedData.rows.length} rows
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleDialogClose}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!title || !parsedData || createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {selectedChangeRequest && (
        <Dialog open={!!selectedChangeRequest} onOpenChange={() => setSelectedChangeRequest(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Review Change Request</DialogTitle>
              <DialogDescription>
                {selectedChangeRequest.requestedBy.name} wants to update {selectedChangeRequest.informationId.title}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Proposed Changes:</Label>
                <div className="mt-2 border rounded-lg p-3 bg-gray-50 max-h-60 overflow-auto">
                  <pre className="text-sm">{JSON.stringify(selectedChangeRequest.proposedChanges, null, 2)}</pre>
                </div>
              </div>
              {selectedChangeRequest.proofImages.length > 0 && (
                <div>
                  <Label>Proof Images:</Label>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {selectedChangeRequest.proofImages.map((img, idx) => (
                      <img key={idx} src={img} alt={`Proof ${idx + 1}`} className="w-full h-32 object-cover rounded-md" />
                    ))}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => handleChangeRequestAction("reject")}>
                <XCircle className="mr-2 h-4 w-4" /> Reject
              </Button>
              <Button onClick={() => handleChangeRequestAction("approve")}>
                <CheckCircle className="mr-2 h-4 w-4" /> Approve
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
