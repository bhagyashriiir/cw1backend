// Main Express server configuration file
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

import { connectDB } from "./db.js";
import lessonsRouter from "./routes/lessons.js";
import ordersRouter from "./routes/orders.js";
import searchRouter from "./routes/search.js";
import logger from "./middleware/logger.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// MIDDLEWARE 
app.use(cors());
app.use(express.json());
app.use(logger);

// Convert :id params to numbers 
app.param("id", (req, res, next, id) => {
  const numericId = Number(id);

  if (isNaN(numericId)) {
    return res.status(400).json({ error: "Invalid id format" });
  }

  req.id = numericId;
  next();
});

// Static image serving

// 1. Serve images normally
app.use("/images", express.static(path.join(process.cwd(), "images")));

// 2. 404 for missing images
app.use("/images", (req, res, next) => {
  const reqPath = req.path.replace(/\?.*$/, "");
  const filePath = path.join(process.cwd(), "images", reqPath);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "Image not found" });
  }

  next();
});

// Database + Routes
connectDB()
  .then(() => {
    console.log("MongoDB connected successfully.");

    // API routes
    app.use("/lessons", lessonsRouter);
    app.use("/orders", ordersRouter);
    app.use("/search", searchRouter);

    // ===== SERVE FRONTEND STATIC FILES =====
    // app.use(express.static(path.join(process.cwd(), "../cw1frontend")));

    // app.get("/", (req, res) => {
     //  res.sendFile(path.join(process.cwd(), "../cw1frontend/index.html"));
    // });

    // 404 fallback
    app.use((req, res) => {
      res.status(404).send("Route not found");
    });

    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  });

