import express from "express";
import { getDB } from "../db.js";

const router = express.Router();
const ORDER_COLL = "order";

// POST /orders  Save order with subject + quantity 
router.post("/", async (req, res) => {
  try {
    const db = getDB();
    const newOrder = req.body;

    if (!newOrder || Object.keys(newOrder).length === 0) {
      return res.status(400).json({ error: "Order data is required" });
    }

    // Format items to readable form
    if (Array.isArray(newOrder.items)) {
      newOrder.items = await Promise.all(
        newOrder.items.map(async (x) => {
          const lesson = await db.collection("lessons").findOne({ _id: x.lessonId });

          return {
            lessonId: x.lessonId,
            subject: lesson?.subject || "Unknown",
            quantity: x.quantity || 1,
            total: ((lesson?.price || 0) * (x.quantity || 1)).toFixed(2)
          };
        })
      );

      newOrder.numberOfSpaces = newOrder.items.reduce(
        (acc, i) => acc + i.quantity,
        0
      );
    } else {
      newOrder.items = [];
      newOrder.numberOfSpaces = 0;
    }

    delete newOrder.productList;

    // Add timestamp
    newOrder.createdAt = new Date();

    // Insert in database
    const result = await db.collection(ORDER_COLL).insertOne(newOrder);

    res.status(201).json({
      message: "Order saved successfully",
      orderId: result.insertedId
    });

  } catch (error) {
    console.error("Error saving order:", error);
    res.status(500).json({ error: "Failed to save order" });
  }
});

export default router;


