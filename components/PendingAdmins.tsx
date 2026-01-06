"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PendingAdmin {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
}

export function PendingAdmins() {
  const [pendingAdmins, setPendingAdmins] = useState<PendingAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingAdmins();
  }, []);

  async function fetchPendingAdmins() {
    try {
      const res = await fetch("/api/admin/pending");
      if (res.ok) {
        const data = await res.json();
        setPendingAdmins(data);
      }
    } catch (error) {
      console.error("Failed to fetch pending admins", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleApprove(userId: string) {
    setProcessingId(userId);
    try {
      const res = await fetch("/api/admin/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (res.ok) {
        setPendingAdmins(pendingAdmins.filter((admin) => admin._id !== userId));
      } else {
        alert("Failed to approve admin");
      }
    } catch (error) {
      console.error(error);
      alert("Error approving admin");
    } finally {
      setProcessingId(null);
    }
  }

  async function handleReject(userId: string) {
    setProcessingId(userId);
    try {
      const res = await fetch("/api/admin/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (res.ok) {
        setPendingAdmins(pendingAdmins.filter((admin) => admin._id !== userId));
      } else {
        alert("Failed to reject admin");
      }
    } catch (error) {
      console.error(error);
      alert("Error rejecting admin");
    } finally {
      setProcessingId(null);
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Pending Admin Approvals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (pendingAdmins.length === 0) {
    return null; // Don't show the card if there are no pending admins
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Pending Admin Approvals
          <Badge variant="destructive" className="ml-auto">
            {pendingAdmins.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {pendingAdmins.map((admin) => (
            <div
              key={admin._id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border bg-card"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{admin.name}</p>
                <p className="text-sm text-muted-foreground truncate">{admin.email}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => handleApprove(admin._id)}
                  disabled={processingId === admin._id}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {processingId === admin._id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      Approve
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleReject(admin._id)}
                  disabled={processingId === admin._id}
                >
                  <X className="h-4 w-4 mr-1" />
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
