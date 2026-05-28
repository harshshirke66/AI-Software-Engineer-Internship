import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

// Extend session user types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const emailStr = credentials.email as string;
        const passwordStr = credentials.password as string;

        try {
          const user = await db.user.findUnique({
            where: { email: emailStr }
          });

          if (!user) {
            // Fallback for offline usage
            return authorizeFallback(emailStr, passwordStr);
          }

          const passwordMatch = await bcrypt.compare(passwordStr, user.password);
          if (!passwordMatch) return null;

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image
          };
        } catch (error) {
          console.warn("Auth database query failed. Trying fallback options.");
          return authorizeFallback(emailStr, passwordStr);
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    }
  },
  pages: {
    signIn: "/auth/signin"
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback_long_secret_value_for_auth_testing",
  session: {
    strategy: "jwt"
  }
});

// Helper for local mock user authorization
function authorizeFallback(email: string, password: string) {
  if (email === "alex@example.com" && password === "password123") {
    return {
      id: "alex-id",
      name: "Alex Johnson",
      email: "alex@example.com",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&h=200&fit=crop"
    };
  }
  if (email === "priya@example.com" && password === "student2026") {
    return {
      id: "priya-id",
      name: "Priya Sharma",
      email: "priya@example.com",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&h=200&fit=crop"
    };
  }
  return null;
}
