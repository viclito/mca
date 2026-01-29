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

interface InformationRow {
  label: string;
  value: string;
}

export function useStudentInformation() {
  return useQuery<Information[]>({
    queryKey: ["studentInformation"],
    queryFn: async () => {
      const res = await fetch("/api/student/information");
      if (!res.ok) throw new Error("Failed to fetch information");
      return res.json();
    },
  });
}

export function useStudentInformationDetail(id: string) {
  return useQuery<{ information: Information; rows: InformationRow[] }>({
    queryKey: ["studentInformationDetail", id],
    queryFn: async () => {
      const res = await fetch(`/api/student/information/${id}`);
      if (!res.ok) throw new Error("Failed to fetch information detail");
      return res.json();
    },
    enabled: !!id,
  });
}

export function useUpdateStudentInformationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data, type }: { id: string; data: any; type: string }) => {
      const res = await fetch(`/api/student/information/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data, type }),
      });
      if (!res.ok) throw new Error("Failed to update information");
      return res.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["studentInformationDetail", variables.id] });
    },
  });
}
