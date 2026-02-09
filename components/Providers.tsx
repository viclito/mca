"use client";

import { SessionProvider } from "next-auth/react";
import GoogleAnalyticsTracker from "@/components/GoogleAnalyticsTracker";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import CompleteProfileModal from "@/components/CompleteProfileModal";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            gcTime: 5 * 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <SessionProvider>
      <GoogleAnalyticsTracker />
      <QueryClientProvider client={queryClient}>
        <CompleteProfileModal />
        {children}
      </QueryClientProvider>
    </SessionProvider>
  );
}
