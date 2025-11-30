import express from "express";
import { getDB } from "../db.js";
import { ObjectId } from "mongodb";

const router = express.Router();
const ORDER_COLL = "order";
const LESSON_COLL = "lessons";

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

      // DIRECT MATCH WITH ObjectId ONLY (your frontend sends this)
      try {
        lesson = await db.collection(LESSON_COLL).findOne({ _id: new ObjectId(item.lessonId) });
      } catch (e) {
        console.log("Invalid ObjectId format");
      }

      finalItems.push({
        lessonId: item.lessonId,
        subject: lesson?.subject || "❗ Subject Not Found",
        price: Number(lesson?.price || 0),
        quantity: Number(item.quantity || 1),
        total: (Number(lesson?.price || 0) * Number(item.quantity || 1)).toFixed(2)
      });

      finalTotal += Number(lesson?.price || 0) * Number(item.quantity || 1);
    }

    newOrder.items = finalItems;
    newOrder.total = finalTotal.toFixed(2);
    newOrder.numberOfSpaces = finalItems.reduce((a,b)=>a + b.quantity,0);
    newOrder.createdAt = new Date();

    const result = await db.collection(ORDER_COLL).insertOne(newOrder);
    res.status(201).json({ message:"Order Saved 🎉", orderId: result.insertedId });

  } catch (err) {
    console.log("ORDER ERROR ❌", err);
    res.status(500).json({ error:"Order save failed" });
  }
});

export default router;



