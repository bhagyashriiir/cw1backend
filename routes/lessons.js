import express from "express";
import { getDB } from "../db.js";
import { ObjectId } from "mongodb";

const router = express.Router();
const LESSON_COLL = "lesson"; // collection name 

// Fetch all lessons with optional sort query
// GET /lessons  
router.get("/", async (req, res) => {
  try {
    const db = getDB();
    const { sort, order } = req.query;
    let sortOption = {};
    if (sort) {
      const ord = order === "desc" ? -1 : 1;
      // allow mapping
      sortOption[sort] = ord;
    }
    const lessons = await db.collection(LESSON_COLL).find({}).sort(sortOption).toArray();
    res.json(lessons);
  } catch (err) {
    console.error("GET /lessons error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Retrieve a single lesson by numeric or ObjectId
// GET /lessons/:id  
router.get("/:id", async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;

    let query = null;
    if (/^[0-9]+$/.test(id)) {
      query = { id: Number(id) };
    } else {
      try {
        query = { _id: new ObjectId(id) };
      } catch (e) {
        return res.status(400).json({ error: "Invalid id format" });
      }
    }

    const lesson = await db.collection(LESSON_COLL).findOne(query);
    if (!lesson) return res.status(404).json({ error: "Lesson not found" });
    res.json(lesson);
  } catch (err) {
    console.error("GET /lessons/:id error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /lessons/:id  
router.put("/:id", async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const update = req.body || {};

    let query = null;
    if (/^[0-9]+$/.test(id)) {
      query = { id: Number(id) };
    } else {
      try {
        query = { _id: new ObjectId(id) };
      } catch (e) {
        return res.status(400).json({ error: "Invalid id format" });
      }
    }

    // If update contains numeric strings for price/spaces, convert to numbers
    if (update.price && typeof update.price === "string" && !isNaN(Number(update.price))) {
      update.price = Number(update.price);
    }
    if (update.spaces && typeof update.spaces === "string" && !isNaN(Number(update.spaces))) {
      update.spaces = Number(update.spaces);
    }

    const result = await db.collection(LESSON_COLL).updateOne(query, { $set: update });
    if (result.matchedCount === 0) return res.status(404).json({ error: "Lesson not found" });

    const updated = await db.collection(LESSON_COLL).findOne(query);
    res.json({ message: "Lesson updated", lesson: updated });
  } catch (err) {
    console.error("PUT /lessons/:id error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;