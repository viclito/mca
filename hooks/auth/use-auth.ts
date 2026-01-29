import { useMutation } from "@tanstack/react-query";

interface UserRegistrationData {
  name: string;
  email: string;
  role: string;
}

interface StudentRegistrationData {
  name: string;
  email: string;
  registerNumber: string;
}

export function useRegisterUser() {
  return useMutation({
    mutationFn: async (data: UserRegistrationData) => {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to register");
      }
      return res.json();
    },
  });
}

export function useRegisterStudent() {
  return useMutation({
    mutationFn: async (data: StudentRegistrationData) => {
      const res = await fetch("/api/auth/student/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to register student");
      }
      return res.json();
    },
  });
}
