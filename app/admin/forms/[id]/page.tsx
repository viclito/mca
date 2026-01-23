"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Download, Search, AlertCircle, CheckCircle, ArrowLeft, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

interface Submission {
    _id: string;
    studentName: string;
    studentId: {
        _id: string;
        name: string;
        email: string;
    };
    responses: Record<string, any>;
    submittedAt: string;
}

interface MissingStudent {
    _id: string;
    name: string;
    email: string;
}

export default function FormResultsPage() {
    const params = useParams();
    const id = params.id as string;
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

    const { data, isLoading } = useQuery({
        queryKey: ["form-results", id],
        queryFn: async () => {
            const res = await fetch(`/api/admin/forms/${id}/submissions`);
            if (!res.ok) throw new Error("Failed to fetch results");
            return res.json();
        }
    });

    const submissions: Submission[] = data?.submissions || [];
    const missingStudents: MissingStudent[] = data?.missingStudents || [];

    const filteredSubmissions = submissions.filter(s => 
        (s.studentName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (s.studentId?.email?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );

    const filteredMissing = missingStudents.filter(s => 
        (s.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (s.email?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );

    const handleExport = async () => {
        if (!data || !data.formFields) return;
        
        const workbook = new ExcelJS.Workbook();
        const submissionSheet = workbook.addWorksheet('Submissions');
        const missingSheet = workbook.addWorksheet('Missing Students');

        // 1. Setup Headers for Submissions
        const headerRow = ["Student Name", "Email", "Submitted At"];
        const fieldIds: string[] = [];
        data.formFields.forEach((f: any) => {
            headerRow.push(f.placeholder || f.label);
            fieldIds.push(f.id);
        });
        submissionSheet.addRow(headerRow);

        // Style header row
        const firstRow = submissionSheet.getRow(1);
        firstRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        firstRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4F46E5' } // Indigo color
        };
        firstRow.alignment = { vertical: 'middle', horizontal: 'center' };
        firstRow.height = 25;

        // 2. Add Data to Submissions
        submissions.forEach((s, i) => {
            const rowData: any[] = [
                s.studentName,
                s.studentId?.email || "N/A",
                new Date(s.submittedAt).toLocaleString()
            ];

            // Add placeholder for each field
            fieldIds.forEach(() => rowData.push(""));
            
            const currentRow = submissionSheet.addRow(rowData);
            const rowNumber = currentRow.number;
            currentRow.height = 20;
            currentRow.alignment = { vertical: 'middle' };

            fieldIds.forEach((fid, colIndex) => {
                const val = s.responses[fid];
                const colNum = colIndex + 4; // Start from 4th column

                if (typeof val === 'object' && val !== null && val.data && (val.type?.startsWith('image/') || val.data.startsWith('data:image/'))) {
                    // Embed Image
                    try {
                        const imageId = workbook.addImage({
                            base64: val.data,
                            extension: (val.type?.split('/')[1] || 'png').replace('jpeg', 'jpg') as any,
                        });
                        
                        submissionSheet.addImage(imageId, {
                            tl: { col: colNum - 1, row: rowNumber - 1 } as any,
                            br: { col: colNum, row: rowNumber } as any,
                            editAs: 'twoCell'
                        });

                        // Make row taller for image
                        currentRow.height = 80;
                    } catch (e) {
                         currentRow.getCell(colNum).value = `[Image: ${val.name}]`;
                    }
                } else if (typeof val === 'object' && val !== null && val.name) {
                    currentRow.getCell(colNum).value = `[File: ${val.name}]`;
                } else {
                    currentRow.getCell(colNum).value = val || "";
                }
            });
        });

        // 3. Setup Missing Students Sheet
        missingSheet.addRow(["Student Name", "Email", "Status"]);
        const mHeader = missingSheet.getRow(1);
        mHeader.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        mHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEF4444' } }; // Red color
        
        missingStudents.forEach(s => {
            missingSheet.addRow([s.name, s.email, "Not Submitted"]);
        });

        // 4. Auto-calculate widths
        [submissionSheet, missingSheet].forEach(sheet => {
            sheet.columns.forEach(column => {
                column.width = 25;
            });
        });

        // 5. Save the file
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, `${data.formTitle || 'Form'}_Results.xlsx`);
    };

    if (isLoading) return <div className="p-8">Loading results...</div>;

  return (
    <div className="space-y-6 md:space-y-8">
        {/* Header Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
                <Link href="/admin/forms">
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div className="hidden md:block">
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                        {data?.formTitle || "Form"} Results
                    </h2>
                    <p className="text-sm md:text-base text-muted-foreground">
                        Detailed overview of form submissions and participation status.
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                 <Button variant="outline" onClick={handleExport} className="w-full sm:w-auto h-11 px-6 shadow-sm">
                    <Download className="mr-2 h-4 w-4" /> Export Results
                </Button>
            </div>
        </div>

        {/* Stats Cards Section */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-none shadow-sm bg-blue-50/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-blue-600">Total Participants</CardTitle>
                    <Users className="h-4 w-4 text-blue-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-blue-900">{data?.totalStudents || 0}</div>
                </CardContent>
            </Card>
            <Card className="border-none shadow-sm bg-green-50/50 text-green-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Submitted</CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">{data?.submittedCount || 0}</div>
                </CardContent>
            </Card>
            <Card className="border-none shadow-sm bg-red-50/50 text-red-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Missing</CardTitle>
                    <AlertCircle className="h-4 w-4 text-red-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">{data?.missingCount || 0}</div>
                </CardContent>
            </Card>
             <Card className="border-none shadow-sm bg-purple-50/50 text-purple-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                    <div className="h-4 w-4 text-purple-400 font-bold text-xs">%</div>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">
                        {data?.totalStudents ? Math.round((data.submittedCount / data.totalStudents) * 100) : 0}%
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* Filters and Actions */}
        <div className="flex items-center justify-between gap-4 p-1 bg-muted/30 rounded-xl">
            <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Search by student name or email..." 
                    className="pl-9 h-11 border-none bg-transparent focus-visible:ring-0 text-base"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            {/* Additional filters can go here */}
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-12 items-start">
            {/* Submissions List */}
            <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        Submissions
                    </h3>
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{filteredSubmissions.length} Students</span>
                </div>
                
                <Card className="border-none shadow-md overflow-hidden bg-white">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-muted/30">
                                <TableRow>
                                    <TableHead className="font-semibold py-4">Student Info</TableHead>
                                    <TableHead className="font-semibold hidden sm:table-cell">Date</TableHead>
                                    <TableHead className="text-right font-semibold pr-6">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredSubmissions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center py-16 text-muted-foreground">
                                            <div className="flex flex-col items-center gap-2 opacity-40">
                                                <Search className="h-10 w-10 mb-2" />
                                                <p className="text-lg">No submissions found</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredSubmissions.map((sub) => (
                                        <TableRow key={sub._id} className="hover:bg-muted/20 transition-colors">
                                            <TableCell className="py-4">
                                                <div className="font-bold text-gray-900">{sub.studentName}</div>
                                                <div className="text-xs text-muted-foreground">{sub.studentId?.email}</div>
                                            </TableCell>
                                            <TableCell className="text-sm text-gray-600 hidden sm:table-cell">
                                                {new Date(sub.submittedAt).toLocaleDateString(undefined, {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </TableCell>
                                            <TableCell className="text-right pr-6">
                                                <Button 
                                                    size="sm" 
                                                    variant="secondary"
                                                    className="font-semibold h-9"
                                                    onClick={() => setSelectedSubmission(sub)}
                                                >
                                                    View Response
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* Missing Students List */}
            <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-xl font-semibold flex items-center gap-2 text-red-600">
                        <AlertCircle className="h-5 w-5" />
                        Awaiting
                    </h3>
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{filteredMissing.length} Unsubmitted</span>
                </div>

                <Card className="border-none shadow-md overflow-hidden bg-white">
                    <CardContent className="p-0">
                         <Table>
                            <TableHeader className="bg-red-50/10">
                                <TableRow>
                                    <TableHead className="font-semibold py-4">Student</TableHead>
                                    <TableHead className="font-semibold">Email</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredMissing.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={2} className="text-center py-16 text-muted-foreground">
                                            <div className="flex flex-col items-center gap-2">
                                                <CheckCircle className="h-10 w-10 text-green-500 mb-2" />
                                                <p className="text-lg font-semibold text-green-700">Perfect Completion!</p>
                                                <p className="text-sm">All students have submitted their responses.</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredMissing.map((student) => (
                                        <TableRow key={student._id} className="hover:bg-red-50/30 transition-colors">
                                            <TableCell className="font-bold py-4">{student.name}</TableCell>
                                            <TableCell className="text-xs text-muted-foreground truncate max-w-[150px]">{student.email}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>

        {/* View Response Modal */}
        <Dialog open={!!selectedSubmission} onOpenChange={(open) => !open && setSelectedSubmission(null)}>
            <DialogContent className="max-w-2xl gap-0 p-0 overflow-hidden border-none shadow-2xl">
                <div className="bg-primary p-8 text-primary-foreground">
                    <div className="flex items-center gap-3 mb-2">
                         <CheckCircle className="h-6 w-6 opacity-70" />
                         <span className="text-xs font-bold uppercase tracking-[0.2em] opacity-80">Form Submission</span>
                    </div>
                    <DialogTitle className="text-2xl font-bold text-primary-foreground">
                        {selectedSubmission?.studentName}
                    </DialogTitle>
                    <DialogDescription className="opacity-70 text-sm mt-1 text-primary-foreground">
                        {selectedSubmission?.studentId?.email}
                    </DialogDescription>
                </div>
                
                <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto bg-white">
                    {selectedSubmission && Object.entries(selectedSubmission.responses).map(([id, value]) => {
                        const field = data?.formFields?.find((f: any) => f.id === id);
                        const label = field?.placeholder || field?.label || id;
                        
                        return (
                            <div key={id} className="space-y-2 group">
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest group-hover:text-primary transition-colors">{label}</p>
                                <div className="p-4 rounded-xl bg-muted/40 border border-muted ring-offset-background group-hover:border-primary/20 transition-all">
                                    <span className="text-base font-medium leading-relaxed">
                                        {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : 
                                         typeof value === 'object' && value !== null && value.data ? (
                                             <div className="flex items-center justify-between gap-4">
                                                 <div className="flex items-center gap-2">
                                                     <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                                         <Download className="h-4 w-4" />
                                                     </div>
                                                     <div className="text-sm">
                                                         <p className="font-bold truncate max-w-[200px]">{value.name}</p>
                                                         <p className="text-xs text-muted-foreground">{(value.size / 1024).toFixed(1)} KB</p>
                                                     </div>
                                                 </div>
                                                 <a 
                                                     href={value.data} 
                                                     download={value.name}
                                                     className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4"
                                                 >
                                                     Download
                                                 </a>
                                             </div>
                                         ) : typeof value === 'object' && value !== null ? JSON.stringify(value) : 
                                         value || <span className="text-muted-foreground italic">No response</span>}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="p-6 bg-gray-50 flex justify-end">
                    <Button onClick={() => setSelectedSubmission(null)} className="rounded-xl px-8 h-11 transition-all">
                        Done Reading
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    </div>
  );
}
