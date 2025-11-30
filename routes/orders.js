import express from "express";
import { getDB } from "../db.js";

const router = express.Router();
const ORDER_COLL = "order";
const LESSON_COLL = "lessons";   // <<—— Needed to fetch subjects & price

// POST /orders
router.post("/", async (req, res) => {
  try {
    const db = getDB();
    const newOrder = req.body;

    if (!newOrder || !Array.isArray(newOrder.items)) {
      return res.status(400).json({ error: "Invalid order format" });
    }

    // 📌 Convert order items into readable enriched format
    const enrichedItems = [];
    let totalAmount = 0;

    for (const item of newOrder.items) {
      const lesson = await db.collection(LESSON_COLL).findOne({ id: item.lessonId });

      enrichedItems.push({
        lessonId: item.lessonId,
        subject: lesson?.subject || "Unknown",
        price: lesson?.price || 0,
        quantity: item.quantity || 1,
        total: Number(lesson?.price || 0) * (item.quantity || 1)
      });

      totalAmount += Number(lesson?.price || 0) * (item.quantity || 1);
    }

    newOrder.items = enrichedItems;
    newOrder.totalAmount = totalAmount.toFixed(2);
    newOrder.numberOfSpaces = enrichedItems.reduce((a, b) => a + b.quantity, 0);
    newOrder.createdAt = new Date();

    const result = await db.collection(ORDER_COLL).insertOne(newOrder);

    res.status(201).json({ message: "Order stored", orderId: result.insertedId });

  } catch (err) {
    console.error("ORDER SAVE ERROR:", err);
    res.status(500).json({ error: "Could not save order" });
  }
});

export default router;



