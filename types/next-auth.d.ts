import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      tempPermissions?: {
        canEdit: boolean;
        canDelete: boolean;
        expiresAt?: Date;
      };
    } & DefaultSession["user"];
  }

  interface User {
    role: string;
    isApproved: boolean;
    tempPermissions?: {
      canEdit: boolean;
      canDelete: boolean;
      expiresAt?: Date;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    isApproved?: boolean;
    tempPermissions?: {
      canEdit: boolean;
      canDelete: boolean;
      expiresAt?: Date;
    };
  }
}
