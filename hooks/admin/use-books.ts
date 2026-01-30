import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Book {
  _id: string;
  title: string;
  url: string;
  subjectId: {
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
}

interface BookFilters {
  degreeId?: string;
  semesterId?: string;
  subjectId?: string;
}

export function useBooks(filters?: BookFilters) {
  const { degreeId, semesterId, subjectId } = filters || {};

  return useQuery<Book[]>({
    queryKey: ["books", degreeId, semesterId, subjectId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (subjectId && subjectId !== "all") params.append("subjectId", subjectId);
      else if (semesterId && semesterId !== "all") params.append("semesterId", semesterId);
      else if (degreeId && degreeId !== "all") params.append("degreeId", degreeId);

      const res = await fetch(`/api/admin/books?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch books");
      return res.json();
    },
  });
}

export function useCreateBook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      url,
      subjectId,
    }: {
      title: string;
      url: string;
      subjectId: string;
    }) => {
      const res = await fetch("/api/admin/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, url, subjectId }),
      });
      if (!res.ok) throw new Error("Failed to create book");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
    },
  });
}

export function useUpdateBook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      title,
      url,
      subjectId,
    }: {
      id: string;
      title: string;
      url: string;
      subjectId: string;
    }) => {
      const res = await fetch("/api/admin/books", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, title, url, subjectId }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to update book");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
    },
  });
}

export function useDeleteBook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/books?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete book");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
    },
  });
}
