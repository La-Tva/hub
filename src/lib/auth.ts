import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "./mongo-client";
import dbConnect from "./db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise, {
    collections: {
      Users: 'hub',
      Accounts: 'hub_accounts',
      Sessions: 'hub_sessions',
    }
  }),
  providers: [
    CredentialsProvider({
      name: "Local Account",
      credentials: {
        username: { label: "Name", type: "text", placeholder: "Thomas" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        await dbConnect();
        const email = `${credentials.username.toLowerCase()}@local.com`;
        let user = await User.findOne({ email });
        
        if (!user) {
          const hashedPassword = await bcrypt.hash(credentials.password, 10);
          user = await User.create({
            name: credentials.username,
            email,
            password: hashedPassword,
            settings: { theme: 'dark' },
            apps: []
          });
        } else {
          if (user.password) {
            const isValid = await bcrypt.compare(credentials.password, user.password);
            if (!isValid) return null;
          } else {
            const hashedPassword = await bcrypt.hash(credentials.password, 10);
            user.password = hashedPassword;
            await user.save();
          }
        }
        
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
        };
      }
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID ?? "",
      clientSecret: process.env.GITHUB_SECRET ?? "",
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID ?? "",
      clientSecret: process.env.GOOGLE_SECRET ?? "",
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
};
