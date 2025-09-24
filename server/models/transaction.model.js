import mongoose from "mongoose";

// Transaction Schema Definition
// This schema logs every transaction made with a virtual card.
const transactionSchema = new mongoose.Schema(
  {
    // Links the transaction to the specific card that was used.
    cardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Card",
      required: [true, "Card ID is required."],
    },
    amount: {
      type: Number,
      required: [true, "Transaction amount is required."],
      min: [0.01, "Transaction amount must be positive."],
    },
    merchant: {
      type: String,
      required: [true, "Merchant name is required."],
      trim: true,
    },
    // Example categories: 'Software', 'Travel', 'Food', 'Office Supplies'
    category: {
      type: String,
      required: [true, "Category is required."],
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now, // Automatically sets the transaction date to the current time.
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
