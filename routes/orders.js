import express from "express";
import { getDB } from "../db.js";
import { ObjectId } from "mongodb";

const router = express.Router();

// Your REAL collection name 👇
const ORDER_COLL = "order";
const LESSON_COLL = "lesson";  // <— THIS WAS THE REAL FIX

router.post("/", async (req, res) => {
  try {
    const db = getDB();
    const newOrder = req.body;

    if (!newOrder || !Array.isArray(newOrder.items)) {
      return res.status(400).json({ error: "Invalid order data" });
    }

    const finalItems = [];
    let totalCost = 0;

    for (const item of newOrder.items) {

      // Fetch lesson details properly
      const lesson = await db.collection(LESSON_COLL).findOne({
        _id: new ObjectId(item.lessonId)
      });

      finalItems.push({
        lessonId: item.lessonId,
        subject: lesson?.subject ?? "❗ NO SUBJECT FOUND",
        price: Number(lesson?.price ?? 0),
        quantity: Number(item.quantity ?? 1),
        total: Number(lesson?.price ?? 0) * Number(item.quantity ?? 1)
      });

      totalCost += Number(lesson?.price ?? 0) * Number(item.quantity ?? 1);
    }

    newOrder.items = finalItems;
    newOrder.total = totalCost.toFixed(2);
    newOrder.numberOfSpaces = finalItems.reduce((sum, i) => sum + i.quantity, 0);
    newOrder.createdAt = new Date();

    const response = await db.collection(ORDER_COLL).insertOne(newOrder);

    return res.status(201).json({
      message: "ORDER SAVED SUCCESSFULLY 🎉",
      orderId: response.insertedId
    });

  } catch (err) {
    console.log("❌ ORDER ERROR:", err);
    res.status(500).json({ error: "Order saving failed" });
  }
});

export default router;



