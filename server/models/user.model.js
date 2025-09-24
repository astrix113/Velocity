import mongoose from "mongoose"

// User Schema Definition
// This schema defines the structure for user documents in the database.
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "User name is required."],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true, // Ensures every email is unique in the collection.
      lowercase: true, // Converts email to lowercase before saving.
      trim: true,
      match: [/.+\@.+\..+/, "Please fill a valid email address."], // Regex for basic email validation.
    },
    // IMPORTANT: The password will be hashed by a pre-save hook in the model logic before it's saved.
    // We don't store plain text passwords.
    password: {
      type: String,
      required: [true, "Password is required."],
      minlength: [6, "Password must be at least 6 characters long."],
    },
    role: {
      type: String,
      enum: {
        values: ["admin", "employee"], // The role must be one of these values.
        message: "{VALUE} is not a supported role.",
      },
      default: "employee",
      required: true,
    },
    // Establishes a relationship between a user and their company.
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company", // This creates a reference to the 'Company' model.
      required: false,
    },
  },
  {
    // Adds createdAt and updatedAt timestamps to the document.
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User
