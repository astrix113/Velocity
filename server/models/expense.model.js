import mongoose from "mongoose";

// Expense Schema Definition
// This schema adds metadata to a transaction, turning it into a formal expense record.
const expenseSchema = new mongoose.Schema(
  {
    // Creates a one-to-one relationship with a transaction.
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
      required: true,
      unique: true, // Ensures one expense record per transaction.
    },
    // URL to the uploaded receipt image (e.g., from an S3 bucket or Cloudinary).
    receiptUrl: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notes cannot exceed 500 characters."],
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "approved", "rejected"],
        message: "{VALUE} is not a supported status.",
      },
      default: "pending",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Expense = mongoose.model("Expense", expenseSchema);

export default Expense;
