import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import Company from "../models/company.model.js";
import generateToken from "../lib/generateToken.js";

// @desc    Register a new user and company
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password, companyName } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);



  // 1. Create the user first
  const user = await User.create({
    name,
    email,
    password:hashedPassword,
    role: "admin",
  });

  // 2. Create company with ownerId
  const company = await Company.create({
    companyName,
    ownerId: user._id,
  });

  // 3. Link company back to user
  user.companyId = company._id;
  await user.save();

  // 4. Return response
  if (user) {
    generateToken(res, user._id);
    res.status(201).json({
      message:"user registered succesfully",
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
};


// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }


  // Find user by email
  const user = await User.findOne({ email });

  if (!user) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  // Compare plain password with hashed password
  const isPasswordMatch = await bcrypt.compare(password, user.password);

  if (!isPasswordMatch) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  // Generate JWT token
  generateToken(res, user._id);

  // Return user info
  res.status(200).json({
    message:"User logged in succesfully",
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    companyId: user.companyId,
  });
};

export default loginUser;

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: "Logged out successfully" });
};

// The forgotPassword and resetPassword functions would require a mail service
// and token generation logic. Here are placeholders.

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  // 1. Find user by email
  // 2. Generate a secure reset token & expiry
  // 3. Save token to user document
  // 4. Send email with reset link
  res.status(200).json({ message: "Password reset email sent (simulation)" });
};

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
// @access  Public
const resetPassword =async (req, res) => {
  // 1. Find user by the token & check if it's not expired
  // 2. Hash the new password from req.body.password
  // 3. Update user's password and clear the reset token fields
  res.status(200).json({ message: "Password has been reset (simulation)" });
};

export { registerUser, loginUser, logoutUser, forgotPassword, resetPassword };
