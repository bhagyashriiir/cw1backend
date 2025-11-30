import express from "express";
import { getDB } from "../db.js";
import { ObjectId } from "mongodb";  // <<— Required to search ObjectId

const router = express.Router();
const ORDER_COLL = "order";
const LESSON_COLL = "lessons";

// POST /orders
router.post("/", async (req, res) => {
  try {
    const db = getDB();
    const newOrder = req.body;

    if (!newOrder || !Array.isArray(newOrder.items)) {
      return res.status(400).json({ error: "Invalid order format" });
    }

    const finalItems = [];
    let finalTotal = 0;

    for (const item of newOrder.items) {

      let lesson = null;

      // Try match as numeric ID
      if (!isNaN(item.lessonId)) {
        lesson = await db.collection(LESSON_COLL).findOne({ id: Number(item.lessonId) });
      }

      // If still null → try match as MongoDB ObjectId
      if (!lesson) {
        try {
          lesson = await db.collection(LESSON_COLL).findOne({ _id: new ObjectId(item.lessonId) });
        } catch {}
      }

      finalItems.push({
        lessonId: item.lessonId,
        subject: lesson?.subject || "⚠ No Subject Found",
        price: Number(lesson?.price || 0),
        quantity: Number(item.quantity || 1),
        total: Number(lesson?.price || 0) * Number(item.quantity || 1)
      });

      finalTotal += Number(lesson?.price || 0) * Number(item.quantity || 1);
    }

    newOrder.items = finalItems;
    newOrder.totalAmount = finalTotal.toFixed(2);
    newOrder.numberOfSpaces = finalItems.reduce((a,b)=>a + b.quantity,0);
    newOrder.createdAt = new Date();

    const result = await db.collection(ORDER_COLL).insertOne(newOrder);

    res.status(201).json({ message:"ORDER SAVED", orderId:result.insertedId });

  } catch (err) {
    console.log("ORDER ERROR", err);
    res.status(500).json({ error:"Order save failed" });
  }
});

export default router;



