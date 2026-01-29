import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Unit {
  _id: string;
  name: string;
  slug: string;
  subjectId: {
    _id: string;
    name: string;
    semesterId: {
      _id: string;
      name: string;
      degreeId: {
        _id: string;
        name: string;
      };
    };
  };
}

interface UnitFilters {
  degreeId?: string;
  semesterId?: string;
  subjectId?: string;
}

export function useUnits(filters?: UnitFilters) {
  const { degreeId, semesterId, subjectId } = filters || {};
  
  return useQuery<Unit[]>({
    queryKey: ["units", degreeId, semesterId, subjectId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (subjectId && subjectId !== "all") params.append("subjectId", subjectId);
      else if (semesterId && semesterId !== "all") params.append("semesterId", semesterId);
      else if (degreeId && degreeId !== "all") params.append("degreeId", degreeId);

      const res = await fetch(`/api/admin/units?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch units");
      return res.json();
    },
  });
}

export function useCreateUnit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, subjectId }: { name: string; subjectId: string }) => {
      const res = await fetch("/api/admin/units", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, subjectId }),
      });
      if (!res.ok) throw new Error("Failed to create unit");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["units"] });
    },
  });
}

export function useUpdateUnit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, name, subjectId }: { id: string; name: string; subjectId: string }) => {
      const res = await fetch("/api/admin/units", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, name, subjectId }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to update unit");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["units"] });
    },
  });
}

export function useDeleteUnit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/units?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete unit");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["units"] });
    },
  });
}
