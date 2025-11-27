import express from "express";
import { getDB } from "../db.js";

const router = express.Router();
const ORDER_COLL = "order";

// POST /orders -save a new order
router.post("/", async (req, res) => {
  try {
    const db = getDB();
    const newOrder = req.body;

    if (!newOrder || Object.keys(newOrder).length === 0) {
      return res.status(400).json({ error: "Order data is required" });
    }

    // Generate lessonIDs + numberOfSpaces automatically
    if (Array.isArray(newOrder.items)) {
  // Use lessonId exactly as frontend sends it
  newOrder.lessonIDs = newOrder.items.map(item => item.lessonId);

  // Count number of spaces (quantities)
  newOrder.numberOfSpaces = newOrder.items.reduce(
    (acc, item) => acc + (item.quantity || 1),
    0
  );
}
    else {
      newOrder.lessonIDs = [];
      newOrder.numberOfSpaces = 0;
    }

    // Add timestamp
    newOrder.createdAt = new Date();

    // Insert into DB
    const result = await db.collection(ORDER_COLL).insertOne(newOrder);

    res.status(201).json({
      message: "Order saved successfully",
      orderId: result.insertedId,
    });

  } catch (error) {
    console.error("Error saving order:", error);
    res.status(500).json({ error: "Failed to save order" });
  }
});

export default router;
