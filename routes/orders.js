import express from "express";
import { getDB } from "../db.js";

const router = express.Router();
const ORDER_COLL = "order";
const LESSON_COLL = "lesson";   // <── important

router.post("/", async (req, res) => {
  try {
    const db = getDB();
    const newOrder = req.body;

    if (!newOrder.items || newOrder.items.length === 0) {
      return res.status(400).json({ error: "Order must include items" });
    }

    // Fetch full lesson details for each item
    newOrder.items = await Promise.all(
      newOrder.items.map(async (item) => {
        const lesson = await db.collection(LESSON_COLL).findOne({ _id: item.lessonId });

        return {
          lessonId: item.lessonId,
          subject: lesson?.subject || "❗ Subject Not Found",
          price: lesson?.price || 0,
          quantity: item.quantity || 1,
          total: ((lesson?.price || 0) * (item.quantity || 1)).toFixed(2)
        };
      })
    );

    // Calculate total qty purchased
    newOrder.numberOfSpaces = newOrder.items.reduce((acc, i) => acc + i.quantity, 0);

    // Calculate full bill amount
    newOrder.totalAmount = newOrder.items.reduce((acc, i) => acc + Number(i.total), 0).toFixed(2);

    newOrder.createdAt = new Date();

    const result = await db.collection(ORDER_COLL).insertOne(newOrder);

    res.status(201).json({ message: "Order saved", orderId: result.insertedId });

  } catch (e) {
    res.status(500).json({ error: "Order failed", details: e });
  }
});

export default router;



