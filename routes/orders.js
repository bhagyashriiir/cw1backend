import express from "express";
import { getDB } from "../db.js";

const router = express.Router();
const ORDER_COLL = "order";

// POST /orders  ---> Save order in readable structured format
router.post("/", async (req, res) => {
  try {
    const db = getDB();
    const order = req.body;

    if (!order || !order.items || order.items.length === 0) {
      return res.status(400).json({ error: "Order items required" });
    }

    // ---> Convert items into readable structure
    order.items = order.items.map(i => ({
      subject: i.subject,          // product name
      price: i.price,              // price per item
      quantity: i.quantity,        // qty requested
      total: (i.price * i.quantity).toFixed(2)
    }));

    // Lesson IDs only for reference
    order.lessonIDs = order.items.map(i => i.lessonId);

    // Count total quantity
    order.numberOfSpaces = order.items.reduce((a, i) => a + i.quantity, 0);

    // Add timestamp
    order.createdAt = new Date();

    // Save final order
    const result = await db.collection(ORDER_COLL).insertOne(order);

    res.status(201).json({
      message: "Order saved successfully",
      orderId: result.insertedId
    });

  } catch (error) {
    console.error("Order save failed:", error);
    res.status(500).json({ error: "Order save failed" });
  }
});

export default router;


