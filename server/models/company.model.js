import mongoose from "mongoose";

// Company Schema Definition
// This schema defines the structure for company documents.
const companySchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: [true, "Company name is required."],
      trim: true,
      unique: true,
    },
    // Establishes a relationship between a company and its owner (a user).
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Creates a reference to the 'User' model.
      required: [true, "Owner ID is required."],
    },
  },
  {
    // Adds createdAt and updatedAt timestamps.
    timestamps: true,
  }
);

const Company = mongoose.model("Company", companySchema);

export default Company;
