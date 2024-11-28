const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Patient name is required."],
  },
  age: {
    type: Number,
    min: [0, "Age cannot be negative."],
    required: [true, "Age is required."],
  },
  sex: {
    type: String,
    enum: ["Male", "Female", "Other"],
    required: [true, "Sex is required."],
  },
  mobileNumber: {
    type: String,
    required: [true, "Mobile number is required."],
    validate: {
      validator: function (v) {
        return /^\d{10}$/.test(v);
      },
      message: (props) =>
        `${props.value} is not a valid 10-digit mobile number.`,
    },
  },
  bloodGroup: {
    type: String,
    enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    default: "Unknown",
  },

  dob: {
    type: Date,
    required: [true, "Date of birth is required."],
    validate: {
      validator: function (value) {
        return value <= new Date();
      },
      message: "Date of birth cannot be in the future.",
    },
  },
  type: {
    type: String,
    enum: ["OPD", "IPD"],
    required: [true, "Type (OPD/IPD) is required."],
  },
  visitNo: {
    type: String,
    required: [true, "Visit number is required."],
  },
  chiefComplaint: {
    type: String,
    required: [true, "Chief complaint is required."],
  },
  timings: {
    type: String,
    required: [true, "Timings are required."],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  height: {
    type: Number,
    min: [0, "Height cannot be negative."],
  },
  weight: {
    type: Number,
    min: [0, "Weight cannot be negative."],
  },
  email: {
    type: String,
    required: [true, "Email is required."],
    validate: {
      validator: function (v) {
        return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
      },
      message: (props) => `${props.value} is not a valid email address.`,
    },
  },




  prescriptions: [
    // Array to store prescriptions
    {
      medicine: { type: String, required: true },
      dosage: { type: String, required: true },
      route: { type: String, required: true },
      frequency: { type: String, required: true },
      dateAdded: { type: Date, default: Date.now },
    },
  ],
  investigations: [
    // Array to store investigation requests
    {
      testType: { type: String, required: true },

      dateRequested: { type: Date, default: Date.now },
    },
  ],
  history: { type: String, default: "" },
  notes: { type: String, default: "" },
  monitoringPlan: { type: String, default: "" },
  consultationNotes: { type: String, default: "" },

  // Optional fields like Blood Pressure, Temperature, SpO2
  bloodPressure: {
    type: String, // Blood pressure is stored as a string (e.g., "120/80")
    default: null,
  },
  temperature: {
    type: String, // Temperature in Celsius or Fahrenheit
    default: null,
  },
  spO2: {
    type: String, // SpO2 is usually a percentage (0-100)
    default: null,
  },

  // Field to store uploaded documents
  documents: [
    {
      filename: { type: String }, // The name of the uploaded file
      path: { type: String }, // The path where the file is stored (on the server or cloud)
      fileType: { type: String }, // File type (e.g., pdf, jpg, etc.)
      uploadedAt: { type: Date, default: Date.now }, // Timestamp when the document was uploaded
    },
  ],
});

module.exports = mongoose.model("Patient", patientSchema);
