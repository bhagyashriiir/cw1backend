import express from "express";
import { getDB } from "../db.js";

const router = express.Router();
const ORDER_COLL = "order";

// POST /orders → Save new order properly formatted
router.post("/", async (req, res) => {
  try {
    const db = getDB();
    const newOrder = req.body;

    if (!newOrder || Object.keys(newOrder).length === 0) {
      return res.status(400).json({ error: "Order data is required" });
    }

    // Convert items → readable format {subject , quantity}
    if (Array.isArray(newOrder.items)) {

      // Store subject + qty cleanly as main structure
      newOrder.items = newOrder.items.map(item => ({
        subject: item.subject || "Unknown Lesson",
        quantity: item.quantity || 1
      }));

      // Separate productList same format
      newOrder.productList = newOrder.items.map(item => ({
        subject: item.subject,
        quantity: item.quantity
      }));

      // Count total quantity purchased
      newOrder.numberOfSpaces = newOrder.items.reduce(
        (acc, item) => acc + item.quantity,
        0
      );
    } 
    else {
      newOrder.items = [];
      newOrder.productList = [];
      newOrder.numberOfSpaces = 0;
    }

    // Add date automatically
    newOrder.createdAt = new Date();

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

