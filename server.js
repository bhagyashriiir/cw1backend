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

// Middleware
app.use(cors());
app.use(express.json());
app.use(logger);

// Always convert :id params to Number 
app.param("id", (req, res, next, id) => {
  const numericId = Number(id);
  if (isNaN(numericId)) {
    return res.status(400).json({ error: "Invalid id format" });
  }
  req.id = numericId;
  next();
});

// Static Image Middleware

// First: Serve images that exist
app.use("/images", express.static(path.join(process.cwd(), "images")));

// Second: Custom handler for images that do not exist
app.use("/images", (req, res, next) => {
  const reqPath = req.path.replace(/\?.*$/, ""); // remove query params
  const filePath = path.join(process.cwd(), reqPath);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "Image not found" });
  }

  next(); // exists then static already served it
});

// DB connect + Routes 
connectDB()
  .then(() => {
    console.log("MongoDB connected successfully.");

    // API routes
    app.use("/lessons", lessonsRouter);
    app.use("/orders", ordersRouter);
    app.use("/search", searchRouter);

    // Serve frontend static files (CSS, JS, images, etc)
    app.use(express.static(process.cwd()));

    // Frontend root route
    app.get("/", (req, res) => {
      res.sendFile(path.join(process.cwd(), "index.html"));
    });

    // Fallback for unmatched routes
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
