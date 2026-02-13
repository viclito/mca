"use client";

import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Search, AlertCircle, Info, AlertTriangle, Eye, RefreshCw, Shield, User, Settings, Lock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Define Log Interface
interface Log {
  _id: string;
  level: "INFO" | "WARN" | "ERROR";
  message: string;
  category: string;
  details?: any;
  user?: {
    name: string;
    email: string;
  };
  context?: {
    path?: string;
    method?: string;
    ip?: string;
    userAgent?: string;
  };
  timestamp: string;
}

interface LogResponse {
  logs: Log[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function LogsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get state from URL
  const page = Number(searchParams.get("page")) || 1;
  const level = searchParams.get("level") || "ALL";
  const category = searchParams.get("category") || "ALL";
  const search = searchParams.get("search") || "";

  // Local state for debounced search input to avoid updating URL on every keystroke
  const [searchInput, setSearchInput] = useState(search);
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);

  // Create a query string helper
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      
      // Reset page to 1 when filters change (except when changing page itself)
      if (name !== "page") {
        params.set("page", "1");
      }
      
      return params.toString();
    },
    [searchParams]
  );

  // Debounce search URL update
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchInput !== search) {
        router.push(pathname + "?" + createQueryString("search", searchInput));
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [searchInput, search, router, pathname, createQueryString]);

  const { data, isLoading, isError, refetch } = useQuery<LogResponse>({
    queryKey: ["logs", page, level, category, search], // use search (from URL) not searchInput
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        level,
        category,
        search,
      });
      const res = await fetch(`/api/admin/logs?${params}`);
      if (!res.ok) throw new Error("Failed to fetch logs");
      return res.json();
    },
    // Refetch every 30 seconds to keep logs fresh
    refetchInterval: 30000, 
  });

  const getLevelBadge = (level: string) => {
    switch (level) {
      case "ERROR":
        return <Badge variant="destructive" className="items-center gap-1"><AlertCircle className="h-3 w-3" /> ERROR</Badge>;
      case "WARN":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-500 items-center gap-1"><AlertTriangle className="h-3 w-3" /> WARN</Badge>;
      default:
        return <Badge variant="outline" className="items-center gap-1"><Info className="h-3 w-3" /> INFO</Badge>;
    }
  };

  const getCategoryIcon = (cat: string) => {
      switch(cat) {
          case "AUTH": return <Lock className="h-3 w-3 mr-1" />;
          case "ADMIN": return <Shield className="h-3 w-3 mr-1" />;
          case "SYSTEM": return <Settings className="h-3 w-3 mr-1" />;
          default: return <Info className="h-3 w-3 mr-1" />;
      }
  }

  // Helper to update URL
  const updateFilter = (key: string, value: string) => {
      router.push(pathname + "?" + createQueryString(key, value));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">System Logs</h2>
          <p className="text-muted-foreground">Monitor application events, errors, and user activities.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
        </Button>
      </div>

      <Tabs defaultValue={category} value={category} onValueChange={(val) => updateFilter("category", val)} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
          <TabsTrigger value="ALL">All Logs</TabsTrigger>
          <TabsTrigger value="ADMIN">Admin</TabsTrigger>
          <TabsTrigger value="AUTH">Auth</TabsTrigger>
          <TabsTrigger value="SYSTEM">System</TabsTrigger>
        </TabsList>
        
        {/* We use the same content for all tabs, the query key handles the filtering */}
        <div className="mt-4">
            <Card>
                <CardHeader className="py-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-2">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                        placeholder="Search logs..."
                        className="pl-9"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        />
                    </div>
                    <Select value={level} onValueChange={(val) => updateFilter("level", val)}>
                        <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Level" />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="ALL">All Levels</SelectItem>
                        <SelectItem value="INFO">Info</SelectItem>
                        <SelectItem value="WARN">Warning</SelectItem>
                        <SelectItem value="ERROR">Error</SelectItem>
                        </SelectContent>
                    </Select>
                    </div>
                    {data && (
                        <div className="text-sm text-muted-foreground">
                            Total: {data.pagination.total} events
                        </div>
                    )}
                </div>
                </CardHeader>
                <CardContent>
                {isLoading ? (
                    <div className="flex h-64 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : isError ? (
                    <div className="flex h-64 flex-col items-center justify-center text-red-500">
                    <AlertCircle className="h-8 w-8 mb-2" />
                    <p>Failed to load logs. Please try again.</p>
                    <Button variant="outline" onClick={() => refetch()} className="mt-4">Retry</Button>
                    </div>
                ) : (
                    <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">Level</TableHead>
                            <TableHead className="w-[100px] hidden md:table-cell">Category</TableHead>
                            <TableHead>Message</TableHead>
                            <TableHead className="hidden md:table-cell">User</TableHead>
                            <TableHead className="w-[180px]">Timestamp</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {data?.logs.length === 0 ? (
                            <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center">
                                No logs found matching your criteria.
                            </TableCell>
                            </TableRow>
                        ) : (
                            data?.logs.map((log) => (
                            <TableRow key={log._id} className="group cursor-pointer hover:bg-muted/50" onClick={() => setSelectedLog(log)}>
                                <TableCell>{getLevelBadge(log.level)}</TableCell>
                                <TableCell className="hidden md:table-cell">
                                    <Badge variant="outline" className="text-xxs font-mono">
                                        {getCategoryIcon(log.category || "SYSTEM")}
                                        {log.category || "SYSTEM"}
                                    </Badge>
                                </TableCell>
                                <TableCell className="font-medium max-w-[200px] md:max-w-md truncate" title={log.message}>
                                    {log.message}
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                {log.user ? (
                                    <div className="flex flex-col">
                                        <span className="text-xs font-medium">{log.user.email}</span>
                                    </div>
                                ) : (
                                    <span className="text-xs text-muted-foreground">-</span>
                                )}
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                {format(new Date(log.timestamp), "MMM dd, HH:mm:ss")}
                                </TableCell>
                                <TableCell>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Eye className="h-4 w-4" />
                                        <span className="sr-only">View Details</span>
                                    </Button>
                                </TableCell>
                            </TableRow>
                            ))
                        )}
                        </TableBody>
                    </Table>
                    </div>
                )}

                {/* Pagination */}
                {data && data.pagination.totalPages > 1 && (
                    <div className="flex items-center justify-end space-x-2 py-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateFilter("page", (page - 1).toString())}
                        disabled={page <= 1}
                    >
                        Previous
                    </Button>
                    <div className="text-sm text-muted-foreground">
                        Page {page} of {data.pagination.totalPages}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateFilter("page", (page + 1).toString())}
                        disabled={page >= data.pagination.totalPages}
                    >
                        Next
                    </Button>
                    </div>
                )}
                </CardContent>
            </Card>
        </div>
      </Tabs>

      {/* Detail Sheet */}
      <Sheet open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <SheetContent className="sm:max-w-xl w-full overflow-y-auto">
          <SheetHeader className="pb-4 border-b">
            <SheetTitle className="flex items-center gap-2 text-xl">
                Log Details
            </SheetTitle>
            <SheetDescription>
                <div className="flex flex-wrap gap-2 mt-2">
                    {selectedLog && getLevelBadge(selectedLog.level)}
                    {selectedLog && (
                         <Badge variant="outline" className="text-xs font-mono">
                            {getCategoryIcon(selectedLog.category || "SYSTEM")}
                            {selectedLog.category || "SYSTEM"}
                        </Badge>
                    )}
                </div>
            </SheetDescription>
          </SheetHeader>
          
          {selectedLog && (
              <div className="space-y-6 py-6">
                  <div className="space-y-4">
                      {selectedLog.details && (selectedLog.details.resourceName || selectedLog.details.name || selectedLog.details.title) && (
                          <div className="space-y-1">
                              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Resource</h4>
                              <div className="p-3 bg-muted/40 border rounded-lg shadow-sm">
                                <p className="text-base font-semibold text-primary">
                                    {selectedLog.details.resourceName || selectedLog.details.name || selectedLog.details.title}
                                </p>
                              </div>
                          </div>
                      )}

                      <div className="space-y-1">
                          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Message</h4>
                          <div className="p-4 bg-muted/40 border rounded-lg shadow-sm">
                            <p className="text-base font-semibold leading-relaxed">{selectedLog.message}</p>
                          </div>
                      </div>
                  </div>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-2 gap-4">
                      
                      <div className="space-y-1">
                          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Timestamp</h4>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{format(new Date(selectedLog.timestamp), "MMM dd, yyyy")}</span>
                            <span className="text-xs text-muted-foreground">{format(new Date(selectedLog.timestamp), "pp")}</span>
                          </div>
                      </div>

                      <div className="space-y-1">
                          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Log ID</h4>
                          <p className="text-xs font-mono text-muted-foreground truncate bg-muted/50 p-1.5 rounded select-all">
                            {selectedLog._id}
                          </p>
                      </div>
                  </div>

                  {/* User Context */}
                  {selectedLog.user && (
                      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                          <div className="p-4 flex items-center gap-4">
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                  <User className="h-5 w-5" />
                              </div>
                              <div className="flex-1">
                                  <h4 className="text-sm font-semibold">{selectedLog.user.name}</h4>
                                  <p className="text-xs text-muted-foreground">{selectedLog.user.email}</p>
                              </div>
                              <Badge variant="secondary" className="text-xs">User</Badge>
                          </div>
                      </div>
                  )}

                  {/* Diff View for Updates */}
                  {selectedLog.details && selectedLog.details.changes && typeof selectedLog.details.changes === 'object' && (
                      <div className="space-y-4">
                          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider border-t pt-4">Changes</h4>
                          <div className="rounded-md border bg-muted/20">
                              <Table>
                                  <TableHeader>
                                      <TableRow>
                                          <TableHead className="w-[120px]">Field</TableHead>
                                          <TableHead className="text-red-500">From</TableHead>
                                          <TableHead className="text-green-600">To</TableHead>
                                      </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                      {Object.entries(selectedLog.details.changes).map(([key, value]: [string, any]) => (
                                          <TableRow key={key}>
                                              <TableCell className="font-medium font-mono text-xs">{key}</TableCell>
                                              <TableCell className="text-red-600/80 text-xs font-mono break-all">
                                                  {typeof value.from === 'object' ? JSON.stringify(value.from) : String(value.from)}
                                              </TableCell>
                                              <TableCell className="text-green-700/80 text-xs font-mono break-all">
                                                  {typeof value.to === 'object' ? JSON.stringify(value.to) : String(value.to)}
                                              </TableCell>
                                          </TableRow>
                                      ))}
                                  </TableBody>
                              </Table>
                          </div>
                      </div>
                  )}

                  {/* Details Section (Fallback/Other) */}
                  {(selectedLog.context || (selectedLog.details && !selectedLog.details.changes)) && (
                    <div className="space-y-4">
                        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider border-t pt-4">Technical Details</h4>
                        
                        {selectedLog.context && Object.keys(selectedLog.context).length > 0 && (
                            <div className="space-y-2">
                                <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                    <Shield className="h-3 w-3" /> Request Context
                                </span>
                                <div className="rounded-md border bg-muted/30 p-3">
                                    <code className="text-xs font-mono whitespace-pre-wrap word-break-break-all">
                                        {JSON.stringify(selectedLog.context, null, 2)}
                                    </code>
                                </div>
                            </div>
                        )}

                        {selectedLog.details && !selectedLog.details.changes && (
                             <div className="space-y-2">
                                <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                    <Info className="h-3 w-3" /> Additional Data
                                </span>
                                <div className="rounded-md border bg-muted/30 p-3">
                                    <code className="text-xs font-mono whitespace-pre-wrap word-break-break-all">
                                        {JSON.stringify(selectedLog.details, null, 2)}
                                    </code>
                                </div>
                            </div>
                        )}
                        
                        {/* Show IDs if changes exist but we still want to see other details like IDs */}
                        {selectedLog.details && selectedLog.details.changes && (
                             <div className="space-y-2">
                                <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                    <Info className="h-3 w-3" /> Metadata
                                </span>
                                <div className="rounded-md border bg-muted/30 p-3">
                                    <code className="text-xs font-mono whitespace-pre-wrap word-break-break-all">
                                        {JSON.stringify({ ...selectedLog.details, changes: undefined }, null, 2)}
                                    </code>
                                </div>
                            </div>
                        )}
                    </div>
                  )}
              </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
