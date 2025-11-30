import express from "express";
import { getDB } from "../db.js";
import { ObjectId } from "mongodb";   // <<< IMPORTANT

const router = express.Router();
const ORDER_COLL = "order";

router.post("/", async (req, res) => {
  try {
    const db = getDB();
    const newOrder = req.body;

    if (!newOrder || Object.keys(newOrder).length === 0) {
      return res.status(400).json({ error: "Order data is required" });
    }

    // Convert items to final readable format
    if (Array.isArray(newOrder.items)) {
      newOrder.items = await Promise.all(
        newOrder.items.map(async (x) => {
          let lesson = null;

          try {
            lesson = await db.collection("lessons").findOne({ _id: new ObjectId(x.lessonId) });
          } catch {
            lesson = null;
          }

          return {
            lessonId: x.lessonId,
            subject: lesson?.subject || "Unknown",
            quantity: x.quantity || 1,
            price: lesson?.price || 0,
            total: ((lesson?.price || 0) * (x.quantity || 1)).toFixed(2)
          };
        })
      );

      newOrder.numberOfSpaces = newOrder.items.reduce((acc, i) => acc + i.quantity, 0);
    } else {
      newOrder.items = [];
      newOrder.numberOfSpaces = 0;
    }

    delete newOrder.productList;
    newOrder.createdAt = new Date();

    const result = await db.collection(ORDER_COLL).insertOne(newOrder);

    res.status(201).json({ message: "Order saved", orderId: result.insertedId });

  } catch (error) {
    res.status(500).json({ error: "Failed to save order" });
  }
});

export default router;



