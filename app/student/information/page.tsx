"use client";

import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, ArrowRight, Table as TableIcon, Loader2 } from "lucide-react";
import Link from "next/link";

interface Information {
  _id: string;
  title: string;
  description?: string;
  columns: string[];
  permissionMode: "view-only" | "editable" | "edit-with-proof";
  active: boolean;
  createdAt: string;
}

export default function StudentInformationListPage() {
  const { data: informationList = [], isLoading } = useQuery<Information[]>({
    queryKey: ["studentInformation"],
    queryFn: async () => {
      const res = await fetch("/api/student/information");
      if (!res.ok) throw new Error("Failed to fetch information");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="container py-10 flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-muted-foreground animate-pulse">Loading tables...</p>
      </div>
    );
  }

  return (
    <div className="container py-10 space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Information Tables</h1>
        <p className="text-muted-foreground text-lg">
          View and interact with data tables shared by the administration.
        </p>
      </div>

      {informationList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-muted/20 rounded-[2rem] border-2 border-dashed">
          <FileSpreadsheet className="h-12 w-12 text-muted-foreground opacity-20" />
          <div className="space-y-1">
            <p className="text-xl font-medium text-muted-foreground">No tables available</p>
            <p className="text-sm text-muted-foreground">Admin hasn't shared any information tables yet.</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {informationList.map((info) => (
            <Card key={info._id} className="group hover:shadow-lg transition-all duration-300 rounded-[2rem] border-black/5 overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                    <TableIcon className="h-5 w-5" />
                  </div>
                  <Badge variant="outline" className="capitalize text-[10px] font-bold tracking-wide">
                    {info.permissionMode.replace(/-/g, ' ')}
                  </Badge>
                </div>
                <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                  {info.title}
                </CardTitle>
                <CardDescription className="line-clamp-2 mt-2">
                  {info.description || "View relevant administrative data shared with you."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mt-2 pt-4 border-t">
                  <span className="text-xs font-semibold text-gray-400">
                    {info.columns.length} columns
                  </span>
                  <Link href={`/student/information/${info._id}`}>
                    <Button variant="ghost" size="sm" className="rounded-full group/btn">
                      View Table 
                      <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
