import express from "express";
import { getDB } from "../db.js";

const router = express.Router();
const LESSON_COLL = "lesson";

// Perform case-insensitive text search and optional numeric search
// GET /search?q=term
router.get("/", async (req, res) => {
  try {
    const db = getDB();
    const raw = (req.query.q || "").trim();

    if (!raw) return res.json([]); // empty search returns empty list

    // Escape regex
    const safe = raw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(safe, "i");

    // Search in subject or location
    const textQuery = {
      $or: [
        { subject: { $regex: regex } },
        { location: { $regex: regex } }
      ]
    };

    const textResults = await db.collection(LESSON_COLL).find(textQuery).toArray();

    // If search is a number, also match price/spaces
    const num = Number(raw);
    if (!isNaN(num)) {
      const numericResults = await db.collection(LESSON_COLL)
        .find({ $or: [{ price: num }, { spaces: num }] })
        .toArray();

      // Merge unique docs
      const unique = new Map();
      [...textResults, ...numericResults].forEach(doc => {
        unique.set(String(doc._id), doc);
      });

      return res.json([...unique.values()]);
    }

    res.json(textResults);
  } catch (err) {
    console.error("GET /search error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
