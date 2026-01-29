import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface FormElement {
  id: string;
  type: string;
  label: string;
  options?: string[];
  required: boolean;
}

export interface Form {
  _id: string;
  title: string;
  elements: FormElement[];
  acceptingResponses: boolean;
  createdAt: string;
}

export function useAdminForms() {
  return useQuery<Form[]>({
    queryKey: ["forms"],
    queryFn: async () => {
      const res = await fetch("/api/admin/forms/templates");
      if (!res.ok) throw new Error("Failed to fetch forms");
      return res.json();
    },
  });
}

export function useAdminForm(id: string) {
  return useQuery<Form>({
    queryKey: ["form", id],
    queryFn: async () => {
      const res = await fetch(`/api/admin/forms/templates/${id}`);
      if (!res.ok) throw new Error("Failed to fetch form");
      return res.json();
    },
    enabled: !!id,
  });
}

export function useSaveForm() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, title, elements, acceptingResponses }: { id?: string, title: string, elements: FormElement[], acceptingResponses: boolean }) => {
            const method = id ? "PUT" : "POST";
            const body: any = { title, elements, acceptingResponses };
            if (id) body.id = id;

            const res = await fetch("/api/admin/forms/templates", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (!res.ok) throw new Error("Failed to save form");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["forms"] });
        }
    });
}

export function useDeleteForm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/forms/templates?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete form");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forms"] });
    },
  });
}

export function useFormSubmissions(formId: string) {
    return useQuery<any[]>({
        queryKey: ["formSubmissions", formId],
        queryFn: async () => {
            const res = await fetch(`/api/admin/forms/submissions?formId=${formId}`);
            if (!res.ok) throw new Error("Failed to fetch submissions");
            return res.json();
        },
        enabled: !!formId
    });
}
