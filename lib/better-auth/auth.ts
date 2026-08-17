import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient, Db } from "mongodb";
import { nextCookies } from "better-auth/next-js";

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://saurabh28102006_db_user:NPw51CHMGxE5j1hW@cluster0.bsoubcb.mongodb.net/signalist?retryWrites=true&w=majority&appName=Cluster0";

declare global {
  var _mongoClientForAuth: MongoClient | undefined;
}

const client = global._mongoClientForAuth || new MongoClient(MONGODB_URI);
if (process.env.NODE_ENV !== "production") {
  global._mongoClientForAuth = client;
}

const db: Db = client.db();

export const auth = betterAuth({
  database: mongodbAdapter(db),
  secret: process.env.BETTER_AUTH_SECRET || "NPw51CHMGxE5j1hW_trade_pulse_auth_key_2026",
  baseURL:
    process.env.BETTER_AUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://tradepulse-stock-tracker.netlify.app",
  emailAndPassword: {
    enabled: true,
    disableSignUp: false,
    requireEmailVerification: false,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: true,
  },
  plugins: [nextCookies()],
});