const express = require("express");
const router = express.Router();
const Patient = require("../models/Pateint");
// const Appointment = require('../models/Appointment');

// Get OPD/IPD Patients
router.get("/patients", async (req, res) => {
  const { type } = req.query;
  try {
    const patients = await Patient.find({ type });
    res.json(patients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// // Get Appointments by Doctor ID
// router.get('/appointments/:doctorId', async (req, res) => {
//   const { doctorId } = req.params;
//   try {
//     const appointments = await Appointment.find({ doctorId }).populate('patientId');
//     res.json(appointments);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

const User = require("../models/User");

// Fetch doctor information
router.get("/doctor-info", async (req, res) => {
  const { email } = req.query;

  try {
    const doctor = await User.findOne({ email, role: "Doctor" }).select(
      "-password"
    );
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.status(200).json(doctor);
  } catch (error) {
    console.error("Error fetching doctor info:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/nurse-info", async (req, res) => {
  const { email } = req.query;

  try {
    const nurse = await User.findOne({ email, role: "Nurse" }).select(
      "-password"
    );
    if (!nurse) {
      return res.status(404).json({ message: "Nurse not found" });
    }

    res.status(200).json(nurse);
  } catch (error) {
    console.error("Error fetching nurse info:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/role-info", async (req, res) => {
  const { role } = req.query; // Get the role from query params

  console.log(role);

  if (!role || !["Doctor", "Nurse", "Admin", "Diagnostic"].includes(role)) {
    return res.status(400).json({ message: "Invalid or missing role" });
  }

  try {
    // Find all users with the given role, excluding password
    const users = await User.find({ role }).select("-password");
    console.log(users);

    if (users.length === 0) {
      return res.status(404).json({ message: `${role}s not found` });
    }

    res.status(200).json({ role, users });
  } catch (error) {
    console.error("Error fetching users by role:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
