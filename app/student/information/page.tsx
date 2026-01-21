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
import { FileSpreadsheet, ArrowRight, Table as TableIcon, Loader2, Info } from "lucide-react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";

interface Information {
  _id: string;
  title: string;
  description?: string;
  columns: string[];
  permissionMode: "view-only" | "editable" | "edit-with-proof";
  active: boolean;
  createdAt: string;
}

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      type: "spring" as const, 
      stiffness: 300, 
      damping: 24 
    } 
  }
};

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
      <div className="min-h-screen bg-[#F5F5F7] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-6 w-6 animate-spin text-black" />
        <p className="text-gray-500 text-xs font-bold tracking-tight uppercase">Loading Hub...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <div className="container py-8 lg:py-12 max-w-6xl mx-auto px-6 space-y-8">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-3 max-w-2xl"
        >
          <div className="flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-gray-200/50 text-gray-600 w-fit backdrop-blur-sm border border-gray-300/30">
            <Info className="h-3 w-3" />
            <span className="text-[9px] font-black tracking-[0.2em] uppercase">Information Hub</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-black">
            Administrative <br className="hidden md:inline" /> Resources
          </h1>
          <p className="text-sm md:text-base text-gray-500 font-medium leading-relaxed">
            Direct access to shared data tables provided by the administration.
          </p>
        </motion.div>

        {/* Content Section */}
        {informationList.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-white/50 rounded-[2rem] border border-gray-200/50 backdrop-blur-xl"
          >
            <div className="p-4 rounded-2xl bg-gray-100/50">
              <FileSpreadsheet className="h-10 w-10 text-gray-300" />
            </div>
            <div className="space-y-1">
              <p className="text-lg font-bold text-gray-900">No resources shared yet</p>
              <p className="text-xs text-gray-500 max-w-sm">When tables are shared, they will appear here.</p>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {informationList.map((info) => (
              <motion.div key={info._id} variants={item}>
                <Card className="group hover:shadow-xl transition-all duration-300 rounded-[2rem] border-0 bg-white/80 backdrop-blur-xl shadow-sm overflow-hidden h-full flex flex-col">
                  <CardHeader className="p-6 pb-2">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 rounded-xl bg-gray-50 text-gray-400 group-hover:bg-black group-hover:text-white transition-all duration-300">
                        <TableIcon className="h-5 w-5" />
                      </div>
                      <Badge variant="outline" className="rounded-full px-3 py-0.5 text-[9px] uppercase font-black tracking-widest bg-gray-100/50 border-gray-200/50 text-gray-500 shadow-none">
                        {info.permissionMode.replace(/-/g, ' ')}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg font-bold tracking-tight text-gray-900 group-hover:text-black transition-colors">
                      {info.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 mt-2 text-xs font-medium leading-relaxed text-gray-500">
                      {info.description || "View relevant administrative data shared with you in this dedicated space."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 pt-0 mt-auto">
                    <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest leading-none mb-1">Fields</span>
                        <span className="text-xs font-bold text-gray-900">
                          {info.columns.length} Columns
                        </span>
                      </div>
                      <Link href={`/student/information/${info._id}`}>
                        <Button className="rounded-full bg-black text-white hover:bg-zinc-800 h-10 px-5 text-xs font-bold group/btn shadow-md">
                          Open Table 
                          <ArrowRight className="ml-1.5 h-3.5 w-3.5 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
