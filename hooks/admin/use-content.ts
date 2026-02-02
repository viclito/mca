import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Content {
  _id: string;
  title: string;
  type: "video" | "pdf" | "note";
  url: string;
  unitId: {
    _id: string;
    name: string;
    subjectId?: {
      _id: string;
      name: string;
      semesterId?: {
        _id: string;
        name: string;
        degreeId?: {
          _id: string;
          name: string;
        };
      };
    };
  };
}

interface ContentFilters {
  degreeId?: string;
  semesterId?: string;
  subjectId?: string;
  unitId?: string;
}

export function useContent(filters?: ContentFilters) {
  const { degreeId, semesterId, subjectId, unitId } = filters || {};

  return useQuery<Content[]>({
    queryKey: ["content", degreeId, semesterId, subjectId, unitId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (unitId && unitId !== "all") params.append("unitId", unitId);
      else if (subjectId && subjectId !== "all") params.append("subjectId", subjectId);
      else if (semesterId && semesterId !== "all") params.append("semesterId", semesterId);
      else if (degreeId && degreeId !== "all") params.append("degreeId", degreeId);

      const res = await fetch(`/api/admin/content?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch content");
      return res.json();
    },
  });
}

export function useCreateContent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      type,
      url,
      unitId,
    }: {
      title: string;
      type: "video" | "pdf" | "note";
      url: string;
      unitId: string;
    }) => {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, type, url, unitId }),
      });
      if (!res.ok) throw new Error("Failed to create content");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content"] });
    },
  });
}

export function useUpdateContent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      title,
      type,
      url,
      unitId,
    }: {
      id: string;
      title: string;
      type: "video" | "pdf" | "note";
      url: string;
      unitId: string;
    }) => {
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, title, type, url, unitId }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to update content");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content"] });
    },
  });
}

export function useDeleteContent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/content?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete content");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content"] });
    },
  });
}
