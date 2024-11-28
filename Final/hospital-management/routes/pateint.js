const express = require("express");
const Patient = require("../models/Pateint.js"); // Ensure model filename matches
const router = express.Router();
const upload = require("../utils/multer"); // Import mailSender
const { PDFDocument, rgb } = require('pdf-lib');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const pdf2pic = require('pdf2pic');
const mailSender = require('../utils/mailSenderpdf');
// Function to convert file to base64 (for images)
const convertToBase64 = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, { encoding: 'base64' }, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};
const convertPdfToImage = async (pdfPath, outputDir) => {
  try {
    // Create an instance of pdf2pic with custom options
    const pdf = pdf2pic.fromPath(pdfPath, {
      density: 100,
      saveFilename: 'pdf_page',
      savePath: outputDir,
      format: 'png',
      width: 800, // Increased width for larger image size
      height: 1000,
      convertCommand: 'magick', // Use 'magick' instead of 'convert' for IMv7
    });

    const result = await pdf(1); // Convert first page (you can modify this to handle multiple pages)
    return result.path; // Return the image path
  } catch (error) {
    console.error('Error converting PDF to image:', error);
    throw error;
  }
};
// Helper function to convert 'dd/mm/yyyy' to a Date object
function parseDate(dateString) {
  const [day, month, year] = dateString.split("/").map(Number);
  const date = new Date(year, month - 1, day); // JavaScript months are 0-indexed

  if (isNaN(date.getTime())) {
    throw new Error('Invalid date format. Please use "dd/mm/yyyy".');
  }
  return date;
}

// Create New Patient with Duplicate Check
router.post("/", async (req, res) => {
  try {
    if (req.body.dob && req.body.dob.includes("/")) {
      req.body.dob = parseDate(req.body.dob);
    }

    const existingPatient = await Patient.findOne({
      name: { $regex: new RegExp(`^${req.body.name}$`, "i") },
      dob: req.body.dob,
    });

    if (existingPatient) {
      return res.status(409).json({
        message: "Patient with the same name and date of birth already exists.",
      });
    }

    const patient = new Patient(req.body);
    await patient.save();
    res.status(201).json({ message: "Patient added successfully", patient });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get All Patients with Optional Filters for Type and Search
router.get("/", async (req, res) => {
  const { type, query } = req.query;
  const filter = {};

  if (type) {
    filter.type = type.toUpperCase();
  }

  if (query) {
    filter.$or = [
      { name: new RegExp(query, "i") },
      { chiefComplaint: new RegExp(query, "i") },
    ];
  }

  try {
    const patients = await Patient.find(filter);
    res.json(patients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Patient by ID
router.get("/:id", async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ message: "Patient Not Found" });
    res.json(patient);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get All Patients with a Specific Investigation (Test Type)
router.get("/patients/investigations", async (req, res) => {
  const { investigationType } = req.query;
  if (!investigationType) {
    return res.status(400).json({ error: "Investigation type is required." });
  }

  try {
    const patients = await Patient.find({
      investigations: {
        $elemMatch: { testType: new RegExp(investigationType, "i") },
      },
    });

    if (patients.length === 0) {
      return res.status(404).json({
        message: "No patients found with the specified investigation.",
      });
    }
    res.json(patients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add Prescription for a Patient
router.post("/:id/prescriptions", async (req, res) => {
  const { medicine, dosage, route, frequency } = req.body;

  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    const newPrescription = { medicine, dosage, route, frequency };
    patient.prescriptions.push(newPrescription);
    await patient.save();

    res
      .status(201)
      .json({ message: "Prescription added", prescription: newPrescription });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add Investigation for a Patient
router.post("/:id/investigations", async (req, res) => {
  const { testType } = req.body;

  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    const newInvestigation = { testType };
    patient.investigations.push(newInvestigation);
    await patient.save();

    res.status(201).json({
      message: "Investigation added",
      investigation: newInvestigation,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Existing Patient Details
router.put("/:id", async (req, res) => {
  try {
    const updatedPatient = await Patient.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedPatient)
      return res.status(404).json({ message: "Patient not found" });
    res.json({
      message: "Patient updated successfully",
      patient: updatedPatient,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete Patient by ID
router.delete("/:id", async (req, res) => {
  try {
    const deletedPatient = await Patient.findByIdAndDelete(req.params.id);
    if (!deletedPatient)
      return res.status(404).json({ message: "Patient not found" });
    res.json({ message: "Patient deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Save or Update Patient Details (history, notes, prescriptions, investigations, monitoringPlan)
router.put("/:id/save", async (req, res) => {
  const { history, notes, prescriptions, investigations, monitoringPlan } =
    req.body;

  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    patient.history = history;
    patient.notes = notes;
    patient.prescriptions = prescriptions;
    patient.investigations = investigations;
    patient.monitoringPlan = monitoringPlan;
    await patient.save();
    res.status(200).json({ message: "Patient data saved successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Save Consultation Notes for a Patient
router.put("/:id/consultation-notes", async (req, res) => {
  const { consultationNotes } = req.body;
  console.log(consultationNotes)
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ message: "Patient not found" });
    
    patient.consultationNotes = consultationNotes; // Ensure this field exists in the Patient model schema
    console.log(patient.consultationNotes)
    await patient.save();
    console.log("here")
    res.status(200).json({ message: "Consultation notes saved successfully" });
    console.log("here")
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// router.put("/:id/spo2", async (req, res) => {
//   const {spo2 } = req.body;

//   try {
//     const patient = await Patient.findById(req.params.id);
//     if (!patient) return res.status(404).json({ message: "Patient not found" });

//     patient.spO2 = spo2; // Ensure this field exists in the Patient model schema
//     await patient.save();
//     res.status(200).json({ message: "Consultation notes saved successfully" });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

router.put("/:id/spo2", async (req, res) => {
  const {spo2 } = req.body;

  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    patient.spO2 = spo2; // Ensure this field exists in the Patient model schema
    await patient.save();
    res.status(200).json({ message: "spo2 notes saved successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id/temp", async (req, res) => {
  const {temp } = req.body;

  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    patient.temperature = temp; // Ensure this field exists in the Patient model schema
    await patient.save();
    res.status(200).json({ message: "temp notes saved successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id/bp", async (req, res) => {
  const {bp } = req.body;

  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    patient.bloodPressure = bp; // Ensure this field exists in the Patient model schema
    await patient.save();
    res.status(200).json({ message: "bp notes saved successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.post(
  "/:patientId/upload",
  upload.array("documents", 5), // Accept multiple documents (up to 5 files)
  async (req, res) => {
    const { patientId } = req.params;

    // If no files are uploaded, return an error
    if (!req.files) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    try {
      // Get the uploaded files and save their paths to the patient's document
      const files = req.files.map((file) => ({
        filename: file.originalname,  // Name of the uploaded file
        path: `/uploads/${file.filename}`,              // Path where the file is stored
        fileType: file.mimetype,      // MIME type of the uploaded file
      }));

      // Find the patient and update their documents field
      const patient = await Patient.findByIdAndUpdate(
        patientId,
        { $push: { documents: { $each: files } } }, // Push new documents to the array
        { new: true }
      );

      if (!patient) {
        return res.status(404).json({ error: "Patient not found" });
      }

      res.json({
        message: "Documents uploaded successfully",
        documents: patient.documents,  // Return updated documents list
      });
    } catch (err) {
      res.status(500).json({ error: "Error uploading documents: " + err.message });
    }
  }
);
router.get("/reports/:patientId", async (req, res) => {
  const { patientId } = req.params;  // Extract patientId from the URL

  try {
    // Find the patient by patientId and select only the 'documents' field
    const patient = await Patient.findById(patientId).select("documents");

    if (!patient) {
      return res.status(404).json({ message: "Patient not found." });
    }

    // Check if documents exist for the patient
    if (!patient.documents || patient.documents.length === 0) {
      return res.status(404).json({ message: "No reports found for this patient." });
    }

    // Map the documents to a more consistent format
    const reports = patient.documents.map((doc) => ({
      filePath: doc.path,         // Use 'path' field from your model
      fileName: doc.filename,     // The filename of the document
      fileType: doc.fileType.split('/')[0],  // Extract main type like 'image' or 'pdf'
    }));

    res.json({ reports });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching reports.", error: err.message });
  }
});

router.get('/:id/generate-pdf', async (req, res) => {
  const patientId = req.params.id;

  try {
    // Fetch the patient from the database
    const patient = await Patient.findById(patientId);

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Create the HTML body for the email
    const emailBody = `
      <html>
        <body style="font-family: Arial, sans-serif; background-color: #f4f4f9; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
            <h1 style="color: #0044cc; text-align: center;">Patient Report for ${patient.name}</h1>
            
            <h2 style="color: #333; font-size: 18px;">Patient Details</h2>
            <table style="width: 100%; margin-bottom: 20px; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Age</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${patient.age}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Sex</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${patient.sex}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Visit No</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${patient.visitNo}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Chief Complaint</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${patient.chiefComplaint}</td>
              </tr>
            </table>
            
            <h2 style="color: #333; font-size: 18px;">Investigations</h2>
            <ul>
              ${patient.investigations.map(investigation => `<li>${investigation.testType}</li>`).join('')}
            </ul>

            <h2 style="color: #333; font-size: 18px;">Prescriptions</h2>
            <ul>
              ${patient.prescriptions.map(prescription => `<li>${prescription.medicine} (${prescription.dosage})</li>`).join('')}
            </ul>

            <h2 style="color: #333; font-size: 18px;">History, Notes, and Monitoring Plan</h2>
            <p><strong>History:</strong> ${patient.history || 'N/A'}</p>
            <p><strong>Notes:</strong> ${patient.notes || 'N/A'}</p>
            <p><strong>Monitoring Plan:</strong> ${patient.monitoringPlan || 'N/A'}</p>
          </div>
        </body>
      </html>
    `;

    // Create the attachments array from the patient's documents
    const attachments = patient.documents.map(doc => {
      const filePath = path.join(__dirname,"../utils", doc.path); // Full path to the document
      const fileContent = fs.readFileSync(filePath);  // Read file content as buffer

      return {
        filename: doc.filename,     // Filename to be attached
        content: fileContent,       // File content (Buffer)
        contentType: doc.fileType,  // MIME type (e.g., 'application/pdf' or 'image/jpeg')
      };
    });

    // Send the email with all the patient data and attachments using mailSender
    const info = await mailSender(patient.email, `Patient Report for ${patient.name}`, emailBody, attachments);

    console.log('Email sent successfully:', info);
    res.status(200).json({ message: 'Email sent successfully!' });

  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Error sending email' });
  }
});

// Function to send email with attached PDF
async function sendPatientReportEmail(email, pdfBytes) {
  try {
    const subject = 'Your Patient Report';
    const body = `
      <p>Dear Patient,</p>
      <p>Please find attached your medical report.</p>
      <p>If you have any questions, feel free to reach out to us.</p>
      <p>Best regards,</p>
      <p>Your Medical Team</p>
    `;

    const info = await mailSender(email, subject, body, pdfBytes);
    console.log('Email sent successfully:', info);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}



module.exports = router;
