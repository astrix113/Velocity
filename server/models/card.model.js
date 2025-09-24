import mongoose from "mongoose";

// Card Schema Definition
// This schema represents the virtual corporate cards issued to users.
const cardSchema = new mongoose.Schema(
  {
    // Establishes a relationship between a card and its cardholder (a user).
    cardholderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Cardholder ID is required."],
    },
    // NOTE: This would be the virtual card number provided by a service like Stripe Issuing.
    cardNumber: {
      type: String,
      required: [true, "Card number is required."],
      unique: true,
    },
    // NOTE: In a real application, this should be encrypted at rest.
    cvv: {
      type: String,
      required: [true, "CVV is required."],
    },
    // Stored as a string in 'MM/YY' format for simplicity.
    expiryDate: {
      type: String,
      required: [true, "Expiry date is required."],
    },
    spendLimit: {
      type: Number,
      required: true,
      default: 0, // Default to no limit unless specified.
      min: [0, "Spend limit cannot be negative."],
    },
    status: {
      type: String,
      enum: {
        values: ["active", "frozen"],
        message: "{VALUE} is not a supported status.",
      },
      default: "active",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Card = mongoose.model("Card", cardSchema);

export default Card;
