import Log from "@/lib/models/Log";
import connectDB from "@/lib/db";
import { auth } from "@/auth"; // Use existing auth configuration
import { headers } from "next/headers";

type LogLevel = "INFO" | "WARN" | "ERROR";

interface LogOptions {
  details?: any;
  user?: string; // User ID
  path?: string;
  method?: string;
  ip?: string;
  userAgent?: string;
  category?: string;
  restricted?: boolean;
}

export class Logger {
  private async log(level: LogLevel, message: string, options: LogOptions = {}) {
    try {
      // Ensure DB connection
      await connectDB();

      // Attempt to gather context if not provided
      let context: any = {
        path: options.path,
        method: options.method,
        ip: options.ip,
        userAgent: options.userAgent,
      };

      let userId = options.user;

      // Try to get server-side context if running on server
      if (typeof window === "undefined") {
        try {
          const headersList = await headers();
          
          if (!context.ip) {
              const forwardedFor = headersList.get("x-forwarded-for");
              context.ip = forwardedFor ? forwardedFor.split(',')[0] : "unknown";
          }
          
          if (!context.userAgent) {
              context.userAgent = headersList.get("user-agent") || "unknown";
          }

          if (!context.path) {
             // Cannot easily get path from headers in all environments, usually passed from middleware or page
             const referer = headersList.get("referer");
             if(referer) {
                try {
                    const url = new URL(referer);
                    context.path = url.pathname;
                } catch(e) {}
             }
          }

          // Try to get user if not provided
          if (!userId) {
            try {
               const session = await auth();
               if (session?.user?.id) {
                 userId = session.user.id;
               }
            } catch (e) {
               // Auth might not be available or initialized in all contexts
            }
          }

        } catch (e) {
          // Headers or auth might fail in some contexts (e.g. static generation)
        }
      }

      const newLog = new Log({
        level,
        message,
        details: options.details,
        user: userId,
        context,
        category: options.category || "SYSTEM",
        restricted: options.restricted || false,
        timestamp: new Date(),
      });

      await newLog.save();

      // Also log to console for development
      if (process.env.NODE_ENV !== "production") {
        const color = level === "ERROR" ? "\x1b[31m" : level === "WARN" ? "\x1b[33m" : "\x1b[32m";
        console.log(`${color}[${level}] ${message}\x1b[0m`, options.details || "");
      }

    } catch (error) {
      // Fallback: don't let logging crash the app
      console.error("FAILED TO LOG TO MONGODB:", error);
      console.error("ORIGINAL LOG:", level, message, options);
    }
  }

  async info(message: string, options?: LogOptions) {
    return this.log("INFO", message, options);
  }

  async warn(message: string, options?: LogOptions) {
    return this.log("WARN", message, options);
  }

  async error(message: string, options?: LogOptions) {
    return this.log("ERROR", message, options);
  }
  static getDiff(previous: any, current: any) {
    const changes: any = {};
    const allKeys = new Set([...Object.keys(previous), ...Object.keys(current)]);

    allKeys.forEach(key => {
        // Skip internal mongoose fields and timestamps
        if (['_id', '__v', 'createdAt', 'updatedAt', 'unitId', 'subjectId', 'semesterId', 'degreeId'].includes(key)) return;
        
        const prevVal = previous[key];
        const currVal = current[key];

        // Simple comparison for primitives and strings
        if (JSON.stringify(prevVal) !== JSON.stringify(currVal)) {
            changes[key] = { from: prevVal, to: currVal };
        }
    });

    return Object.keys(changes).length > 0 ? changes : null;
  }
}

export const logger = new Logger();
