// app/api/auth/[...nextauth]/route.ts
import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcrypt";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import jwt from "jsonwebtoken";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required");
        }

        await connectDB();

        const user = await User.findOne({ email: credentials.email });
        if (!user) {
          throw new Error("No user found with this email");
        }

        // ✅ Check if email is verified
        if (!user.isVerified) {
          throw new Error("Please verify your email before logging in");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid password");
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
 
  callbacks: {
    async signIn({ user, account, profile }) {
      // ✅ Handle Google OAuth sign-in
      if (account?.provider === "google") {
        try {
          await connectDB();
          
          // Check if user exists
          let existingUser = await User.findOne({ email: user.email });
          
          if (!existingUser) {
            // Create new user for Google sign-in
            existingUser = await User.create({
              email: user.email,
              name: user.name,
              profileImage: user.image,
              isVerified: true, // Google users are auto-verified
              authProvider: "google",
              googleId: account.providerAccountId,
            });
          } else if (!existingUser.googleId) {
            // Link Google account to existing user
            existingUser.googleId = account.providerAccountId;
            existingUser.authProvider = "google";
            existingUser.isVerified = true;
            await existingUser.save();
          }
          
          // Update user object with DB info
          user.id = existingUser._id.toString();
          user.profileImage = existingUser.profileImage;
          user.bio = existingUser.bio;
          
          return true;
        } catch (error) {
          console.error("Error in Google sign-in:", error);
          return false;
        }
      }
      
      return true;
    },
    async jwt({ token, user, account, trigger, session }) {
      try {
        if (user) {
          token.id = user.id;
          token.name = user.name;
          token.profileImage = user.profileImage;
          token.bio = user.bio;
          // Use provider access token if available, otherwise generate your own
          token.accessToken =
            account?.access_token ||
            jwt.sign(
              { id: user.id, email: user.email },
              process.env.AUTH_SECRET!,
              { expiresIn: "7d" }
            );
        }

        // ✅ Handle manual session updates
        if (trigger === "update" && session) {
          // Merge the updated session data
          if (session.user.name !== undefined) {
            token.name = session.user.name; // ✅ Update name
          }
          if (session.user?.profileImage) {
            token.profileImage = session.user.profileImage;
          }
          if (session.user?.bio) {
            token.bio = session.user.bio;
          }
        }
        return token;
      } catch (error) {
        console.error("Error in JWT callback:", error);
        return token;
      }
    },

    async session({ session, token }) {
      try {
        if (session.user && token.id) {
          session.user.id = token.id;
          session.user.name = token.name;
          session.user.profileImage = token.profileImage;
          session.user.bio = token.bio;
        }

        if (token.accessToken) {
          session.accessToken = token.accessToken;
        }

        return session;
      } catch (error) {
        console.error("Session callback error:", error);
        return session;
      }
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
