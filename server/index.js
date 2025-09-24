import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./lib/db.js";

// Import Routes
import authRoutes from "./routes/auth.route.js";
// import userRoutes from "./routes/user.route.js";
// import cardRoutes from "./routes/card.route.js";
// import transactionRoutes from "./routes/transaction.route.js";
// import expenseRoutes from "./routes/expense.route.js";

// Load environment variables
dotenv.config();
console.log("JWT_SECRET =", process.env.JWT_SECRET);

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json()); // Body parser for JSON
app.use(express.urlencoded({ extended: true })); // Body parser for form data
app.use(cookieParser()); // To parse cookies from the request

// API Routes
app.use("/api/auth", authRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/cards", cardRoutes);
// app.use("/api/transactions", transactionRoutes);
// app.use("/api/expenses", expenseRoutes);

// Simple root route
app.get("/", (req, res) => {
  res.send("Velocity API is running...");
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
