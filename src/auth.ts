
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [Google],
    callbacks: {
        async session({ session, user }) {
            // Add role to session if user has it
            // Note: With PrismaAdapter, the 'user' object in session callback 
            // usually contains the db record if using 'database' strategy (default for adapter)
            if (session.user) {
                // @ts-ignore // We will fix types later
                session.user.role = user.role || "user";
                session.user.id = user.id;
            }
            return session;
        }
    },
    pages: {
        signIn: '/login',
    }
})
