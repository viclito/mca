import { useQuery, useMutation } from "@tanstack/react-query";

interface FormResponse {
  formId: string;
  data: any;
}

export function useStudentForms() {
  return useQuery<any[]>({
    queryKey: ["studentForms"],
    queryFn: async () => {
      const res = await fetch("/api/student/forms");
      if (!res.ok) throw new Error("Failed to fetch forms");
      return res.json();
    },
  });
}

export function useStudentForm(id: string) {
  return useQuery<any>({
    queryKey: ["studentForm", id],
    queryFn: async () => {
      const res = await fetch(`/api/student/forms/${id}`);
      if (!res.ok) throw new Error("Failed to fetch form");
      return res.json();
    },
    enabled: !!id,
  });
}

export function useSubmitForm() {
  return useMutation({
    mutationFn: async ({ formId, data }: FormResponse) => {
      const res = await fetch("/api/forms/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formId, data }),
      });
      if (!res.ok) throw new Error("Failed to submit form");
      return res.json();
    },
  });
}
