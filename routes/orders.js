import express from "express";
import { getDB } from "../db.js";

const router = express.Router();
const ORDER_COLL = "order";


//   POST /orders  
router.post("/", async (req, res) => {
  try {
    const db = getDB();
    const newOrder = req.body;

    if (!newOrder || !newOrder.items || newOrder.items.length === 0) {
      return res.status(400).json({ error: "Order must include items" });
    }

    // Build list of lesson IDs
    newOrder.lessonIDs = newOrder.items.map(i => i.lessonId);

    // Store Product Name + Quantity 
    newOrder.productList = newOrder.items.map(i => ({
      lessonId: i.lessonId,
      productName: i.subject,  // subject from frontend
      quantity: i.quantity
    }));

    // Count total quantity (spaces)
    newOrder.numberOfSpaces = newOrder.items.reduce(
      (acc, i) => acc + i.quantity,
      0
    );

    newOrder.createdAt = new Date();

    const result = await db.collection(ORDER_COLL).insertOne(newOrder);

    res.status(201).json({
      message: "Order saved successfully",
      orderId: result.insertedId,
      saved: newOrder
    });

  } catch (error) {
    console.error("Error saving order:", error);
    res.status(500).json({ error: "Failed to save order" });
  }
});


//   GET /orders (View all)
router.get("/", async (req, res) => {
  try {
    const db = getDB();
    const orders = await db.collection(ORDER_COLL).find({}).toArray();
    res.json(orders);
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    res.status(500).json({ error: "Cannot fetch orders" });
  }
});

export default router;
