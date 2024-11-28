const express = require("express");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const router = express.Router();
const mailSender = require("../utils/mailSender"); // Import mailSender

// Login Route
router.post("/login", async (req, res) => {
  const { email, password, role } = req.body;

  try {
    // Find user by email and role
    const user = await User.findOne({ email, role });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare the provided password with the hashed password in the database
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({ message: "Wrong Password" });
    }

    // If successful, return a success response
    res.status(200).json({
      message: "Login successful",
      role: user.role,
      userId: user._id,
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get User Details by Email
router.get("/user/email/:email", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email }).select(
      "-password"
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ error: error.message });
  }
});

// Registration Route
router.post("/register", async (req, res) => {
  const {
    name,
    email,
    password,
    role,
    specialization,
    opdTimings,
    ipdTimings,
    phone,
    shiftHours,
    wardNumber,
  } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res
        .status(409)
        .json({ message: "User with this email already exists." });

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user object
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      // Add doctor-specific fields if role is 'Doctor'
      specialization: role === "Doctor" ? specialization : undefined,
      opdTimings: role === "Doctor" ? opdTimings : undefined,
      ipdTimings: role === "Doctor" ? ipdTimings : undefined,
      phone: role === "Doctor" ? phone : undefined,
      // Add nurse-specific fields if role is 'Nurse'
      shiftHours: role === "Nurse" ? shiftHours : undefined,
      wardNumber: role === "Nurse" ? wardNumber : undefined,
    });
    console.log("Hashed Password:", hashedPassword);

    // Save the user
    await newUser.save();

    res
      .status(201)
      .json({ message: "User registered successfully", userId: newUser._id });
  } catch (error) {
    console.error("Registration error:", error);
    res
      .status(500)
      .json({ message: "Internal server error. Please try again later." });
  }
});

// Request OTP for Password Reset
router.post("/request-reset", async (req, res) => {
  const { email } = req.body;
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit OTP
  const expiry = new Date(Date.now() + 15 * 60 * 1000); // OTP valid for 15 mins

  try {
    const user = await User.findOneAndUpdate(
      { email },
      { resetCode, resetCodeExpiry: expiry },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    // Send OTP email
    const subject = "Your OTP for Password Reset – MediConnect";
const body = `
  <p>Dear ${user.name},</p>
  <p>We have received a request to reset your password for your MediConnect account. To complete the process, please use the following One-Time Password (OTP):</p>
  <h3 style="color: #4CAF50; font-size: 24px; font-weight: bold;">${resetCode}</h3>
  <p>This OTP is valid for 15 minutes. Please make sure to use it within this time frame. If you do not reset your password within this period, you will need to request a new OTP.</p>
  <p>If you did not request a password reset, you can safely ignore this email. Your account remains secure, and no changes will be made to your account.</p>
  <p>If you need assistance, feel free to contact our support team at <a href="mailto:
work.arjun221@gmail.com">
work.arjun221@gmail.com.</p>
  <p>Thank you for trusting MediConnect.</p>
  <p>Best regards,</p>
  <p><strong>The MediConnect Team</strong></p>
  <footer style="font-size: 12px; color: #777;">
    <p>© ${new Date().getFullYear()} MediConnect. All Rights Reserved.</p>
  </footer>
`;
    await mailSender(user.email, subject, body); // Send OTP to the user's email

    res.status(200).json({ message: "OTP sent to email" });
  } catch (error) {
    console.error("Error during OTP request:", error);
    res.status(500).json({ error: error.message });
  }
});

// Verify OTP
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({
      email,
      resetCode: otp,
      resetCodeExpiry: { $gte: new Date() },
    });
    if (!user)
      return res.status(400).json({ message: "Invalid or expired OTP" });

    res.status(200).json({ message: "OTP verified" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reset Password
router.post("/reset-password", async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findOneAndUpdate(
      { email },
      { password: hashedPassword, resetCode: null, resetCodeExpiry: null }
    );
    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
