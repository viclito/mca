import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Information {
  _id: string;
  name: string;
  description: string;
  type: string;
  url?: string;
  semesterId: { _id: string; name: string };
  subjectId: { _id: string; name: string };
}

interface ChangeRequestItem {
  _id: string;
  type: string;
  studentId: { name: string; email: string };
  data: any;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  requestId?: string;
}

export function useAdminInformation() {
  return useQuery<Information[]>({
    queryKey: ["information"],
    queryFn: async () => {
      const res = await fetch("/api/admin/information");
      if (!res.ok) throw new Error("Failed to fetch information");
      return res.json();
    },
  });
}

export function useChangeRequests() {
  return useQuery<ChangeRequestItem[]>({
    queryKey: ["changeRequests"],
    queryFn: async () => {
      const res = await fetch("/api/admin/pending");
      if (!res.ok) throw new Error("Failed to fetch change requests");
      return res.json();
    },
  });
}

export function useCreateInformation() {
  const queryClient = useQueryClient();
  return useMutation({
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
      queryClient.invalidateQueries({ queryKey: ["information"] });
    },
  });
}

export function useDeleteInformation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/information?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete information");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["information"] });
    },
  });
}

export function useChangeRequestMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "approved" | "rejected" }) => {
      const res = await fetch(`/api/admin/${status === "approved" ? "approve" : "reject"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: id }),
      });
      if (!res.ok) throw new Error(`Failed to ${status} request`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["changeRequests"] });
      queryClient.invalidateQueries({ queryKey: ["information"] });
    },
  });
}
