import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { db } from '@/server/db';
import { users } from '@/shared/schema';
import { eq } from 'drizzle-orm';

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          // Check if user exists
          const existingUser = await db.select()
            .from(users)
            .where(eq(users.email, user.email!));

          if (existingUser.length === 0) {
            // Create new user
            await db.insert(users).values({
              googleId: user.id,
              email: user.email!,
              name: user.name!,
              avatar: user.image || '',
              isGuest: false,
            });
          }
          return true;
        } catch (error) {
          console.error('Error creating user:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        // Fetch user data from database
        const dbUser = await db.select()
          .from(users)
          .where(eq(users.email, user.email!));
          
        if (dbUser.length > 0) {
          token.dbUserId = dbUser[0].id;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token.dbUserId) {
        session.user.id = token.dbUserId as number;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
});

export { handler as GET, handler as POST };