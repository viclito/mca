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
import { Download, Search, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import * as XLSX from 'xlsx'; // Import sheetjs for export

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
        s.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.studentId.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredMissing = missingStudents.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleExport = () => {
        if (!data) return;
        
        // 1. Export Submissions
        const submissionData = submissions.map(s => ({
            "Student Name": s.studentName,
            "Email": s.studentId.email,
            "Submitted At": new Date(s.submittedAt).toLocaleString(),
            ...s.responses // Flatten responses
        }));

        // 2. Export Missing Students
        const missingData = missingStudents.map(s => ({
            "Student Name": s.name,
            "Email": s.email,
            "Status": "Not Submitted"
        }));

        const wb = XLSX.utils.book_new();
        
        if (submissionData.length > 0) {
            const ws1 = XLSX.utils.json_to_sheet(submissionData);
            XLSX.utils.book_append_sheet(wb, ws1, "Submissions");
        }

        if (missingData.length > 0) {
            const ws2 = XLSX.utils.json_to_sheet(missingData);
            XLSX.utils.book_append_sheet(wb, ws2, "Missing Students");
        }

        XLSX.writeFile(wb, `${data.formTitle || 'Form'}_Results.xlsx`);
    };

    if (isLoading) return <div className="p-8">Loading results...</div>;

  return (
    <div className="space-y-6">
       <div className="flex items-center gap-4">
        <Link href="/admin/forms">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{data?.formTitle} Results</h1>
           <div className="flex gap-4 text-sm text-muted-foreground mt-1">
               <span className="flex items-center gap-1 text-green-600"><CheckCircle className="h-3 w-3" /> {data?.submittedCount} Submitted</span>
               <span className="flex items-center gap-1 text-red-500 font-medium"><AlertCircle className="h-3 w-3" /> {data?.missingCount} Missing</span>
           </div>
        </div>
        <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" /> Export Excel
        </Button>
      </div>

        <div className="flex items-center gap-2 max-w-sm">
            <Search className="h-4 w-4 text-gray-400" />
            <Input 
                placeholder="Search students..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>

      <div className="grid gap-6 md:grid-cols-2">
            {/* Submissions Table */}
            <Card className="md:col-span-1">
                <CardHeader>
                    <CardTitle>Submissions</CardTitle>
                    <CardDescription>Students who have completed the form.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="max-h-[500px] overflow-y-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredSubmissions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">No submissions found</TableCell>
                                    </TableRow>
                                ) : (
                                    filteredSubmissions.map((sub) => (
                                        <TableRow key={sub._id}>
                                            <TableCell>
                                                <div className="font-medium">{sub.studentName}</div>
                                                <div className="text-xs text-muted-foreground">{sub.studentId.email}</div>
                                            </TableCell>
                                            <TableCell className="text-xs">
                                                {new Date(sub.submittedAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                {/* Could add view details modal here later */}
                                                <Button size="sm" variant="ghost">View</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Missing Students Table */}
            <Card className="md:col-span-1 border-red-100">
                <CardHeader>
                    <CardTitle className="text-red-600">Missing Students</CardTitle>
                     <CardDescription>Students who have NOT submitted yet.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="max-h-[500px] overflow-y-auto">
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Email</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredMissing.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={2} className="text-center py-8 text-muted-foreground">All students submitted!</TableCell>
                                    </TableRow>
                                ) : (
                                    filteredMissing.map((student) => (
                                        <TableRow key={student._id}>
                                            <TableCell className="font-medium">{student.name}</TableCell>
                                            <TableCell className="text-muted-foreground">{student.email}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
      </div>
    </div>
  );
}
