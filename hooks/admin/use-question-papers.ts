import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface QuestionPaper {
  _id: string;
  title: string;
  year: string;
  link: string;
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

interface QuestionPaperFilters {
  degreeId?: string;
  semesterId?: string;
  subjectId?: string;
}

export function useQuestionPapers(filters?: QuestionPaperFilters) {
  const { degreeId, semesterId, subjectId } = filters || {};

  return useQuery<QuestionPaper[]>({
    queryKey: ["question-papers", degreeId, semesterId, subjectId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (subjectId && subjectId !== "all") params.append("subjectId", subjectId);
      else if (semesterId && semesterId !== "all") params.append("semesterId", semesterId);
      else if (degreeId && degreeId !== "all") params.append("degreeId", degreeId);

      const res = await fetch(`/api/admin/question-papers?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch question papers");
      return res.json();
    },
  });
}

export function useCreateQuestionPaper() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      year,
      link,
      subjectId,
    }: {
      title: string;
      year: string; // e.g., "Apr 2023"
      link: string;
      subjectId: string;
    }) => {
      const res = await fetch("/api/admin/question-papers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, year, link, subjectId }),
      });
      if (!res.ok) throw new Error("Failed to create question paper");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["question-papers"] });
    },
  });
}

export function useUpdateQuestionPaper() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      title,
      year,
      link,
      subjectId,
    }: {
      id: string;
      title: string;
      year: string;
      link: string;
      subjectId: string;
    }) => {
      const res = await fetch("/api/admin/question-papers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, title, year, link, subjectId }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to update question paper");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["question-papers"] });
    },
  });
}

export function useDeleteQuestionPaper() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/question-papers?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete question paper");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["question-papers"] });
    },
  });
}
