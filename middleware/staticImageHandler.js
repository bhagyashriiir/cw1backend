import fs from "fs";

/**
 * Middleware that checks whether an image exists. If not it returns error.
 */
// Middleware to validate existence of requested image files
export function staticImageHandler(folderPath) {
  return (req, res, next) => {
    // Only check GET requests for images
    if (req.method !== "GET") return next();

    // Normalize request path to local file
    const reqPath = req.path.replace(/\?.*$/, ""); // strip query
    const filePath = folderPath + reqPath;

    // If file exists express.static already served it. If not, return error
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Image not found" });
    }

    next();
  };
}

