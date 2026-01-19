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
      
      if (isAdminPage) {
        if (isLoggedIn) {
             const user = auth.user as any;
             return user.role === 'admin' || user.role === 'super_admin';
        }
        return false; // Redirect unauthenticated users to login page
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
        return session;
    },
    async jwt({ token, user }) {
        if (user) {
            token.role = user.role;
        }
        return token;
    }
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
