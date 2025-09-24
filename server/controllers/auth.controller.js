import User from "../models/user.model.js";
import Company from "../models/company.model.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import generateToken from "../lib/generateToken.js";

export const registerUser = async (req, res) => {
  const { companyName, name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ message: "User with this email already exists." });
    }

    const session = await User.startSession();
    session.startTransaction();

    let newCompany;
    let newUser;

    try {
      // 1️⃣ Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // 2️⃣ Create user first
      const user = new User({
        name,
        email,
        password: hashedPassword,
        role: "admin",
      });
      [newUser] = await User.create([user], { session });

      // 3️⃣ Create company with ownerId = newUser._id
      const company = new Company({
        companyName,
        ownerId: newUser._id,
      });
      [newCompany] = await Company.create([company], { session });

      // 4️⃣ Link user to company
      newUser.companyId = newCompany._id;
      await newUser.save({ session });

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }

    // 5️⃣ Generate token
    const token = generateToken(newUser._id);

    res.status(201).json({
      message: "Company and admin user registered successfully.",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        companyId: newUser.companyId,
      },
      company: {
        id: newCompany._id,
        companyName: newCompany.companyName,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error during registration.",
      error: error.message,
    });
  }
};



export const loginUser= async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = generateToken(user._id, user.role, user.companyId);

    res.json({
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error during login.", error: error.message });
  }
};

export const logoutUser = (req, res) => {
  res
    .status(200)
    .json({
      message: "Logout successful. Please clear the token on client side.",
    });
};


export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "User with that email not found." });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");

    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await user.save();

    console.log(`Password reset token for ${email}: ${resetToken}`);

    res.json({ message: `Password reset link sent to ${email}.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  try {
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token." });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ message: "Password has been reset successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};
