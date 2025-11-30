import express from "express";
import { getDB } from "../db.js";

const router = express.Router();
const ORDER_COLL = "order";

// POST /orders
router.post("/", async (req, res) => {
  try {
    const db = getDB();
    const newOrder = req.body;

    if (!newOrder || !Array.isArray(newOrder.items) || newOrder.items.length === 0)
      return res.status(400).json({ error: "Invalid Order" });

    // Clean items and enforce fallback values
    newOrder.items = newOrder.items.map(item => ({
      lessonId: item.lessonId,
      subject: item.subject || "No Subject Found",
      price: item.price ?? 0,
      quantity: item.quantity ?? 1,
      total: item.price * item.quantity
    }));

    // Count total purchased quantity
    newOrder.numberOfSpaces = newOrder.items.reduce((s, x) => s + x.quantity, 0);

    newOrder.createdAt = new Date();

    await db.collection(ORDER_COLL).insertOne(newOrder);

    res.status(201).json({ message: "Order saved successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Order failed to save" });
  }
});

export default router;



