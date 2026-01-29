import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Semester {
  _id: string;
  name: string;
  slug: string;
  degreeId: string | { _id: string; name: string };
  createdAt: string;
}

export function useSemesters() {
  return useQuery<Semester[]>({
    queryKey: ["semesters"],
    queryFn: async () => {
      const res = await fetch("/api/admin/semesters");
      if (!res.ok) throw new Error("Failed to fetch semesters");
      return res.json();
    },
  });
}

export function useCreateSemester() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, degreeId }: { name: string; degreeId: string }) => {
      const res = await fetch("/api/admin/semesters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, degreeId }),
      });
      if (!res.ok) throw new Error("Failed to create semester");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["semesters"] });
    },
  });
}

export function useUpdateSemester() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, name, degreeId }: { id: string; name: string; degreeId: string }) => {
      const res = await fetch("/api/admin/semesters", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, name, degreeId }),
      });
      if (!res.ok) throw new Error("Failed to update semester");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["semesters"] });
    },
  });
}

export function useDeleteSemester() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/semesters?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete semester");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["semesters"] });
    },
  });
}
