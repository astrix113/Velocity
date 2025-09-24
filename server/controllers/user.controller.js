import User from "../models/user.model";
import crypto from "crypto";
import bcrypt from "bcryptjs";

export const getCompanyUsers = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const users = await User.find({ companyId }).select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

export const inviteUser = async (req, res) => {
  const { name, email, role } = req.body;
  try {
    const companyId = req.user.companyId;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ message: "User with this email already exists." });
    }

    const temporaryPassword = crypto.randomBytes(10).toString("hex");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(temporaryPassword, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "employee",
      companyId,
    });

    await newUser.save();
    res
      .status(201)
      .json({ message: `${email} has been invited successfully.` });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error inviting user.", error: error.message });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, role } = req.body;
  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.companyId.toString() !== req.user.companyId.toString()) {
      return res.status(403).json({ message: "Forbidden action." });
    }

    user.name = name || user.name;
    user.role = role || user.role;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error updating user.", error: error.message });
  }
};
