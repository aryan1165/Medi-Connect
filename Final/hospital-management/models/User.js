const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"], // Name is now required for all roles
  },
  email: {
    type: String,
    unique: true,
    required: [true, "Email is required"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  role: {
    type: String,
    enum: ["Doctor", "Nurse", "Admin", "Diagnostic"],
    required: [true, "Role is required"],
  },
  resetCode: {
    type: String, // OTP for password reset
  },
  resetCodeExpiry: {
    type: Date, // OTP expiration time
  },

  // Doctor-specific fields
  specialization: {
    type: String,
    required: function () {
      return this.role === "Doctor";
    },
  },
  opdTimings: {
    type: String,
    required: function () {
      return this.role === "Doctor";
    },
  },
  ipdTimings: {
    type: String,
    required: function () {
      return this.role === "Doctor";
    },
  },
  phone: {
    type: String,
    required: function () {
      return this.role === "Doctor";
    },
  },

  // Nurse-specific fields
  shiftHours: {
    type: String,
    required: function () {
      return this.role === "Nurse";
    },
  },
  wardNumber: {
    type: String,
    required: function () {
      return this.role === "Nurse";
    },
  },
});

module.exports = mongoose.model("User", userSchema);
