"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  Edit2, 
  Save, 
  X, 
  Check, 
  Loader2, 
  Image as ImageIcon, 
  ArrowLeft,
  FileSpreadsheet,
  Trash2
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { generateCSV, downloadCSV } from "@/lib/csvGenerator";
import { cn } from "@/lib/utils";

interface Information {
  _id: string;
  title: string;
  description?: string;
  columns: string[];
  permissionMode: "view-only" | "editable" | "edit-with-proof";
  active: boolean;
}

interface InformationRow {
  _id: string;
  data: Record<string, any>;
  lastEditedBy?: { name: string };
  lastEditedAt?: string;
}

export default function StudentInformationDetailPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editedData, setEditedData] = useState<Record<string, any>>({});
  const [proofDialogOpen, setProofDialogOpen] = useState(false);
  const [proofImages, setProofImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const { data, isLoading } = useQuery<{ information: Information; rows: InformationRow[] }>({
    queryKey: ["studentInformationDetail", id],
    queryFn: async () => {
      const res = await fetch(`/api/student/information/${id}`);
      if (!res.ok) throw new Error("Failed to fetch information");
      return res.json();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch(`/api/student/information/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["studentInformationDetail", id] });
      if (data.requiresApproval) {
        alert("Your change request has been submitted for admin approval.");
      }
      setEditingRowId(null);
      setProofDialogOpen(false);
      setProofImages([]);
      setEditedData({});
    },
    onError: (err: any) => alert(err.message || "Failed to update"),
  });

  const handleExport = () => {
    if (!data) return;
    const csvContent = generateCSV(data.information.columns, data.rows.map(r => r.data));
    downloadCSV(`${data.information.title}.csv`, csvContent);
  };

  const startEditing = (row: InformationRow) => {
    setEditingRowId(row._id);
    setEditedData({ ...row.data });
  };

  const handleSave = () => {
    if (!editingRowId || !data) return;
    
    if (data.information.permissionMode === "editable") {
      updateMutation.mutate({ rowId: editingRowId, data: editedData });
    } else if (data.information.permissionMode === "edit-with-proof") {
      setProofDialogOpen(true);
    }
  };

  const submitWithProof = () => {
    if (!editingRowId || proofImages.length === 0) {
      alert("Proof images are required");
      return;
    }
    updateMutation.mutate({ 
      rowId: editingRowId, 
      data: editedData, 
      proofImages 
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append("file", files[i]);
      }

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      const urls = await res.json();
      setProofImages([...proofImages, ...(Array.isArray(urls) ? urls : [urls])]);
    } catch (error) {
      console.error(error);
      alert("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const removeProofImage = (index: number) => {
    setProofImages(proofImages.filter((_, i) => i !== index));
  };

  if (isLoading) {
    return <div className="container py-10 flex flex-col items-center gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      <p className="text-muted-foreground animate-pulse">Loading table data...</p>
    </div>;
  }

  if (!data) return <div className="container py-10">Table not found.</div>;

  const { information, rows } = data;

  return (
    <div className="container py-6 lg:py-10 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link href="/student/information" className="text-sm text-blue-600 hover:underline flex items-center gap-1 mb-2">
            <ArrowLeft className="h-3 w-3" /> Back to tables
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{information.title}</h1>
            <Badge variant="outline" className="capitalize">
              {information.permissionMode.replace(/-/g, ' ')}
            </Badge>
          </div>
          {information.description && (
            <p className="text-muted-foreground">{information.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport} className="rounded-full">
            <Download className="mr-2 h-4 w-4" /> Download CSV
          </Button>
        </div>
      </div>

      <Card className="rounded-[2rem] border-black/5 shadow-xl overflow-hidden bg-white">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow>
                  {information.columns.map((col) => (
                    <TableHead key={col} className="font-bold text-black py-4 uppercase text-[10px] tracking-widest whitespace-nowrap">
                      {col}
                    </TableHead>
                  ))}
                  {information.permissionMode !== "view-only" && (
                    <TableHead className="text-right py-4 uppercase text-[10px] tracking-widest">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={information.columns.length + (information.permissionMode !== "view-only" ? 1 : 0)} className="h-32 text-center text-muted-foreground">
                      No data rows found.
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row) => (
                    <TableRow key={row._id} className="hover:bg-gray-50/50 transition-colors group">
                      {information.columns.map((col) => (
                        <TableCell key={col} className="py-4 whitespace-nowrap">
                          {editingRowId === row._id ? (
                            <Input 
                              value={editedData[col] || ""} 
                              onChange={(e) => setEditedData({ ...editedData, [col]: e.target.value })}
                              className="h-8 text-sm min-w-[120px]"
                            />
                          ) : (
                            <span className="text-sm text-gray-700">{row.data[col]}</span>
                          )}
                        </TableCell>
                      ))}
                      {information.permissionMode !== "view-only" && (
                        <TableCell className="text-right py-4">
                          {editingRowId === row._id ? (
                            <div className="flex justify-end gap-1">
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600 hover:bg-green-50" onClick={handleSave}>
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600 hover:bg-red-50" onClick={() => setEditingRowId(null)}>
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <Button size="icon" variant="ghost" className="h-8 w-8 group-hover:bg-blue-50 group-hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-all" onClick={() => startEditing(row)}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
         <p className="text-[10px] text-gray-400 italic">
           * Tables are generated dynamically from CSV data. {information.permissionMode === 'edit-with-proof' && 'Changes require administrative approval.'}
         </p>
      </div>

      <Dialog open={proofDialogOpen} onOpenChange={setProofDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-[2rem]">
          <DialogHeader>
            <DialogTitle>Verification Required</DialogTitle>
            <DialogDescription>
              To change this record, you must provide photo proof for administrative verification.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
             <div className="space-y-2">
                <Label>Upload Identification/Proof Photos</Label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  {proofImages.map((img, idx) => (
                    <div key={idx} className="relative group rounded-xl overflow-hidden border aspect-video">
                      <img src={img} alt="Proof" className="w-full h-full object-cover" />
                      <Button 
                        variant="destructive" 
                        size="icon" 
                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeProofImage(idx)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 items-center">
                  <Input 
                    type="file" 
                    accept="image/*" 
                    multiple 
                    onChange={handleFileUpload} 
                    disabled={uploading}
                    className="rounded-xl"
                  />
                  {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
                </div>
             </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-full" onClick={() => setProofDialogOpen(false)}>Cancel</Button>
            <Button 
              className="rounded-full bg-blue-600 hover:bg-blue-700" 
              onClick={submitWithProof} 
              disabled={proofImages.length === 0 || updateMutation.isPending}
            >
              {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
