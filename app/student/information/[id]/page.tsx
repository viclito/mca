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
  Trash2,
  Users,
  Clock as ClockIcon,
  ShieldCheck
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { generateCSV, downloadCSV } from "@/lib/csvGenerator";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

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

  // Sorting logic for the first column (usually Serial Number)
  const sortedRows = useMemo(() => {
    const rows = data?.rows;
    const information = data?.information;
    if (!rows || rows.length === 0 || !information?.columns?.[0]) return rows || [];
    
    const firstCol = information.columns[0];
    return [...rows].sort((a, b) => {
      const valA = a.data[firstCol];
      const valB = b.data[firstCol];
      
      // Try numeric sort first
      const numA = parseFloat(String(valA));
      const numB = parseFloat(String(valB));
      
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      }
      
      // Fallback to string sort
      return String(valA || "").localeCompare(String(valB || ""), undefined, { numeric: true, sensitivity: 'base' });
    });
  }, [data]);

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
      const result = await res.json();
      const url = result.url;
      setProofImages([...proofImages, url]);
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
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex flex-col items-center justify-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-black" />
        <p className="text-gray-400 text-[10px] font-bold tracking-tight uppercase">Syncing...</p>
      </div>
    );
  }

  if (!data) return <div className="container py-20 text-center font-semibold text-lg">Table not found.</div>;

  const { information, rows } = data;

  return (
    <div className="min-h-screen bg-[#F5F5F7] pb-10">
      <div className="container py-4 lg:py-6 max-w-[1400px] mx-auto px-4 md:px-6 space-y-4">
        
        {/* Navigation & Title Section */}
        <motion.div 
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-1"
        >
          <div className="space-y-2">
            <Link 
              href="/student/information" 
              className="group flex items-center gap-1.5 text-[8px] font-black text-gray-400 hover:text-black transition-colors uppercase tracking-[0.2em]"
            >
              <ArrowLeft className="h-2.5 w-2.5 group-hover:-translate-x-0.5 transition-transform text-gray-300" /> 
              Directory
            </Link>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl md:text-3xl font-bold tracking-tight text-gray-900 leading-none">{information.title}</h1>
                <Badge variant="outline" className="rounded-full px-2 py-0 bg-gray-100 text-gray-600 border-gray-200 text-[8px] font-black uppercase tracking-widest shadow-none">
                  {information.permissionMode.replace(/-/g, ' ')}
                </Badge>
              </div>
              {information.description && (
                <p className="text-xs text-gray-500 font-medium leading-tight max-w-xl">
                  {information.description}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleExport} 
              className="rounded-full h-8 px-4 text-[10px] font-bold border hover:bg-white bg-white/50 backdrop-blur-md shadow-none transition-all active:scale-95"
            >
              <Download className="mr-1.5 h-3 w-3 text-gray-400" /> Export CSV
            </Button>
          </div>
        </motion.div>

        {/* Dynamic Table Card */}
        <motion.div
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.05 }}
        >
          <Card className="rounded-[1.5rem] border-0 shadow-lg bg-white/95 backdrop-blur-2xl overflow-hidden ring-1 ring-black/5">
            <CardContent className="p-0">
              <div className="relative overflow-x-auto">
                <Table className="border-collapse">
                  <TableHeader>
                    <TableRow className="border-b border-gray-100 bg-gray-50/50">
                      {information.columns.map((col) => (
                        <TableHead key={col} className="font-black text-black/40 py-3 uppercase text-[8px] tracking-[0.2em] whitespace-nowrap pl-6 pr-3">
                          {col}
                        </TableHead>
                      ))}
                      {information.permissionMode !== "view-only" && (
                        <TableHead className="sticky right-0 z-20 bg-gray-50/90 backdrop-blur shadow-[-4px_0_4px_-2px_rgba(0,0,0,0.02)] text-right py-3 uppercase text-[8px] font-black tracking-[0.2em] pr-6 text-black/40">
                          Actions
                        </TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence mode="popLayout">
                      {sortedRows.length === 0 ? (
                        <TableRow key="empty">
                          <TableCell colSpan={information.columns.length + (information.permissionMode !== "view-only" ? 1 : 0)} className="h-32 text-center">
                            <div className="flex flex-col items-center gap-1.5 text-gray-400 font-bold text-[10px]">
                              <FileSpreadsheet className="h-6 w-6 opacity-10" />
                              EMPTY DATASET
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        sortedRows.map((row, index) => (
                          <motion.tr 
                            key={row._id}
                            initial={{ opacity: 0, y: 2 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.02 }}
                            className="hover:bg-gray-50/30 transition-colors group border-b border-gray-50/50 last:border-0"
                          >
                            {information.columns.map((col, cIdx) => (
                              <TableCell key={col} className={cn("py-2.5 whitespace-nowrap", cIdx === 0 && "pl-6")}>
                                {editingRowId === row._id ? (
                                  <Input 
                                    value={editedData[col] || ""} 
                                    onChange={(e) => setEditedData({ ...editedData, [col]: e.target.value })}
                                    className="h-7 text-[10px] font-bold rounded border-gray-200 focus-visible:ring-black min-w-[100px] shadow-none bg-white p-2"
                                  />
                                ) : (
                                  <div className="flex flex-col">
                                    <span className="font-bold text-gray-900 group-hover:text-black transition-colors text-[10px] tracking-tight">{row.data[col]}</span>
                                    {cIdx === 0 && (row.lastEditedBy || row.lastEditedAt) && (
                                      <div className="flex items-center gap-1.5 mt-0.5 text-[7px] font-black text-gray-300 uppercase tracking-widest leading-none">
                                        {row.lastEditedBy && <span className="flex items-center gap-0.5"><Users className="h-1.5 w-1.5" /> {row.lastEditedBy.name}</span>}
                                        {row.lastEditedAt && <span className="flex items-center gap-0.5"><ClockIcon className="h-1.5 w-1.5" /> {format(new Date(row.lastEditedAt), "MMM d")}</span>}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </TableCell>
                            ))}
                            {information.permissionMode !== "view-only" && (
                              <TableCell className="sticky right-0 z-10 bg-white group-hover:bg-gray-50/90 transition-colors shadow-[-4px_0_4px_-2px_rgba(0,0,0,0.02)] text-right py-2 pr-6">
                                {editingRowId === row._id ? (
                                  <div className="flex justify-end gap-1">
                                    <Button size="icon" className="h-6 w-6 rounded bg-black text-white hover:bg-zinc-800 shadow-none" onClick={handleSave}>
                                      <Check className="h-3 w-3" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-6 w-6 rounded text-gray-400 hover:bg-gray-50" onClick={() => setEditingRowId(null)}>
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ) : (
                                  <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-7 w-7 rounded-lg text-gray-400 hover:bg-black hover:text-white transition-all duration-200 shadow-none border border-transparent" 
                                    onClick={() => startEditing(row)}
                                  >
                                    <Edit2 className="h-3 w-3" />
                                  </Button>
                                )}
                              </TableCell>
                            )}
                          </motion.tr>
                        ))
                      )}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>


        {/* Footer info */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col md:flex-row items-center justify-between gap-6 px-10"
        >
          <div className="flex items-center gap-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">
            <ShieldCheck className="h-4 w-4 text-green-500" />
            Verified data hub • SECURE ENDPOINT
          </div>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter text-center md:text-right">
             Tables are generated dynamically. {information.permissionMode === 'edit-with-proof' && 'Changes require verification proof for administrative safety.'}
          </p>
        </motion.div>
      </div>

      {/* Proof Modal */}
      <Dialog open={proofDialogOpen} onOpenChange={setProofDialogOpen}>
        <DialogContent className="sm:max-w-xl rounded-[3rem] border-0 shadow-3xl bg-white/95 backdrop-blur-2xl p-0 overflow-hidden ring-1 ring-black/5">
          <div className="p-10 space-y-8">
            <DialogHeader>
               <div className="h-14 w-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                  <ShieldCheck className="h-8 w-8" />
               </div>
              <DialogTitle className="text-3xl font-bold tracking-tight">Security Verification</DialogTitle>
              <DialogDescription className="text-lg font-medium text-gray-500 leading-relaxed">
                To maintain data integrity, please provide photo evidence (Identification, Form Proof, etc.) for administrative review.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
               <div className="space-y-4">
                  <Label className="text-xs font-black uppercase tracking-widest text-gray-400 pl-1">Documentation Proof</Label>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {proofImages.map((img, idx) => (
                      <motion.div 
                        key={idx} 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative group rounded-2xl overflow-hidden border-2 border-gray-100 aspect-square shadow-sm"
                      >
                        <img src={img} alt="Proof" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button 
                            variant="destructive" 
                            size="icon" 
                            className="h-10 w-10 rounded-xl"
                            onClick={() => removeProofImage(idx)}
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                    <label className={cn(
                      "cursor-pointer flex flex-col items-center justify-center border-3 border-dashed rounded-3xl transition-all duration-300 aspect-square group",
                      uploading ? "opacity-50 pointer-events-none" : "hover:bg-blue-50 hover:border-blue-200 border-gray-100"
                    )}>
                      {uploading ? <Loader2 className="h-8 w-8 animate-spin text-blue-600" /> : <ImageIcon className="h-8 w-8 text-gray-300 group-hover:text-blue-500" />}
                      <span className="text-[10px] font-black uppercase text-gray-400 mt-2 group-hover:text-blue-600">Add Image</span>
                      <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileUpload} />
                    </label>
                  </div>
               </div>
            </div>
            
            <DialogFooter className="pt-4 border-t border-gray-100">
              <Button variant="ghost" className="rounded-2xl h-14 font-bold text-gray-500 hover:text-black" onClick={() => setProofDialogOpen(false)}>Cancel</Button>
              <Button 
                className="rounded-2xl bg-black text-white hover:bg-zinc-800 h-14 px-10 font-bold shadow-2xl flex-1 md:flex-none" 
                onClick={submitWithProof} 
                disabled={proofImages.length === 0 || updateMutation.isPending}
              >
                {updateMutation.isPending && <Loader2 className="mr-3 h-5 w-5 animate-spin" />}
                Transmit Request
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
