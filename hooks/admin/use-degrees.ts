import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Degree {
  _id: string;
  name: string;
  slug: string;
  createdAt: string;
}

export function useDegrees() {
  return useQuery<Degree[]>({
    queryKey: ["degrees"],
    queryFn: async () => {
      const res = await fetch("/api/admin/degrees");
      if (!res.ok) throw new Error("Failed to fetch degrees");
      return res.json();
    },
  });
}

export function useCreateDegree() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch("/api/admin/degrees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Failed to create degree");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["degrees"] });
    },
  });
}

export function useUpdateDegree() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const res = await fetch("/api/admin/degrees", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, name }),
      });
      if (!res.ok) throw new Error("Failed to update degree");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["degrees"] });
    },
  });
}

export function useDeleteDegree() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/degrees?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete degree");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["degrees"] });
    },
  });
}
