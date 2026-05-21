import "./config/dotenv.js";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import { corsOptions } from "./config/cors.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import transactionRoutes from "./routes/transaction.routes.js";
import userRoutes from "./routes/user.routes.js";
import notificationRoutes from "./routes/notification.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Inventory Management System API is running",
  });
});

if (process.env.NODE_ENV === "production") {
  const distPath = path.resolve(__dirname, "../../frontend/dist");
  const indexPath = path.resolve(distPath, "index.html");
  
  app.use(express.static(distPath));
  
  app.get("*", (req, res) => {
    res.sendFile(indexPath, (err) => {
      if (err) {
        res.status(404).json({
          success: false,
          message: "Page not found"
        });
      }
    });
  });
} else {
  app.get("/", (req, res) => {
    res.status(200).json({
      success: true,
      message: "Welcome to the Inventory Management System API",
    });
  });
}

app.use(errorHandler);

export default app;
