// MongoDB connection utility functions
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = process.env.DB_NAME || "webstore"; // DB name

if (!MONGO_URI) {
  throw new Error("MONGO_URI missing in .env");
}

let client = null;
let db = null;

export async function connectDB() {
  if (db) return db;

  client = new MongoClient(MONGO_URI);
  await client.connect();

  db = client.db(DB_NAME);
  console.log(`Connected to MongoDB → DB: ${DB_NAME}`);

  return db;
}

export function getDB() {
  if (!db) throw new Error("Database not connected. Run connectDB() first.");
  return db;
}

export async function closeDB() {
  if (client) await client.close();
  db = null;
  client = null;
}
