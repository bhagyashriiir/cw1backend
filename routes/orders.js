import express from "express";
import { getDB } from "../db.js";
import { ObjectId } from "mongodb";

const router = express.Router();
const ORDER_COLL = "order";

// POST /orders  (Now fetches subject + price securely)
router.post("/", async (req, res) => {
  try {
    const db = getDB();
    const order = req.body;

    if (!order.items || order.items.length === 0) {
      return res.status(400).json({ error: "Cart cannot be empty" });
    }

    // Convert lessonId into object details directly from DB
    const finalItems = [];

    for (let item of order.items) {
      const lesson = await db.collection("lesson").findOne({ 
        _id: new ObjectId(item.lessonId) 
      });

      finalItems.push({
        lessonId: item.lessonId,
        subject: lesson?.subject || "⚠ No Subject Found",
        price: lesson?.price || 0,
        quantity: item.quantity || 1,
        total: (lesson?.price || 0) * (item.quantity || 1)
      });
    }

    // Replace items with fully populated version
    order.items = finalItems;
    order.numberOfSpaces = finalItems.reduce((s,i)=>s+i.quantity,0);
    order.totalAmount = finalItems.reduce((s,i)=>s+i.total,0);
    order.createdAt = new Date();

    const result = await db.collection(ORDER_COLL).insertOne(order);

    res.status(201).json({
      message:"Order saved with full product info 🎉",
      orderId: result.insertedId
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error:"Order save failed" });
  }
});

export default router;



