import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login", // Error code passed in url query string as ?error=
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAdminPage = nextUrl.pathname.startsWith("/admin");
      const isStudentPage = nextUrl.pathname.startsWith("/student") && 
                           !nextUrl.pathname.startsWith("/student/login") && 
                           !nextUrl.pathname.startsWith("/student/register");
      
      if (isAdminPage) {
        if (isLoggedIn) {
          const user = auth.user as any;
          return user.role === 'admin' || user.role === 'super_admin';
        }
        return false; // Redirect unauthenticated users to login page (default /login)
      }

      if (isStudentPage) {
        if (isLoggedIn) {
          return true;
        }
        // Manual redirect for student pages to student login
        return Response.redirect(new URL("/student/login", nextUrl));
      }

      return true;
    },
    async session({ session, token }) {
        if (token.sub && session.user) {
            session.user.id = token.sub;
        }
        if (token.role && session.user) {
            session.user.role = token.role as string;
        }
        if (token.name && session.user) {
            session.user.name = token.name as string;
        }
        if (token.tempPermissions && session.user) {
            session.user.tempPermissions = token.tempPermissions as any;
        }
        return session;
    },
    async jwt({ token, user, trigger, session }) {
        if (user) {
            token.role = user.role;
            token.name = user.name;
            if (user.tempPermissions) {
               token.tempPermissions = user.tempPermissions;
            }
        }
        
        if (trigger === "update" && session?.name) {
            token.name = session.name;
        }
        
        if (trigger === "update" && session?.tempPermissions) {
            token.tempPermissions = session.tempPermissions;
        }

        return token;
    }
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
