"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { sendGAEvent } from "@next/third-parties/google";

export default function GoogleAnalyticsTracker() {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user?.id) {
      // Set the user_id for Google Analytics
      // Note: We are using window.gtag directly if available, or we could use sendGAEvent
      // However, for setting 'config' with user_id, direct gtag access is often needed or the explicit config component.
      // @next/third-parties initializes GA. To set user_id globally, we often assume 'gtag' is on window.
      
      if (typeof window !== "undefined" && (window as any).gtag) {
          (window as any).gtag("config", process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
              user_id: session.user.id,
          });
      }
    }
  }, [session]);

  return null;
}
