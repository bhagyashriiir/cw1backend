import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = process.env.DB_NAME || "webstore";
const LESSON_COLL = "lesson";

if (!MONGO_URI) {
  console.error("MONGO_URI not set. Create a .env file or set environment variables.");
  process.exit(1);
}

// Static initial dataset for seeding lessons collection
const lessons = [
  { id: 1, subject: 'Mathematics', location: 'Edinburgh', price: 12.5, spaces: 5, icon: 'fa-solid fa-calculator', rating: 4 },
  { id: 2, subject: 'English', location: 'Oxford', price: 11.0, spaces: 5, icon: 'fa-solid fa-book', rating: 3 },
  { id: 3, subject: 'Physics', location: 'Cambridge', price: 15.0, spaces: 5, icon: 'fa-solid fa-atom', rating: 5 },
  { id: 4, subject: 'Chemistry', location: 'London', price: 11.5, spaces: 5, icon: 'fa-solid fa-flask', rating: 2 },
  { id: 5, subject: 'French', location: 'York', price: 13.5, spaces: 5, icon: 'fa-solid fa-language', rating: 4 },
  { id: 6, subject: 'Dance', location: 'Glasgow', price: 15.0, spaces: 5, icon: 'fa-solid fa-music', rating: 5 },
  { id: 7, subject: 'Music', location: 'Liverpool', price: 12.0, spaces: 5, icon: 'fa-solid fa-music', rating: 3 },
  { id: 8, subject: 'Geography', location: 'Manchester', price: 9.0, spaces: 5, icon: 'fa-solid fa-globe', rating: 4 },
  { id: 9, subject: 'Computer', location: 'Bath', price: 18.0, spaces: 5, icon: 'fa-solid fa-laptop-code', rating: 5 },
  { id: 10, subject: 'Art', location: 'Leicester', price: 10.0, spaces: 5, icon: 'fa-solid fa-paint-brush', rating: 2 }
];

async function seed() {
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const coll = db.collection(LESSON_COLL);

    console.log(`Clearing collection ${DB_NAME}.${LESSON_COLL}`);
    await coll.deleteMany({});

    const result = await coll.insertMany(lessons);
    console.log(`Inserted ${result.insertedCount} lessons`);
  } catch (err) {
    console.error("Seeding failed:", err);
  } finally {
    await client.close();
  }
}

seed();

