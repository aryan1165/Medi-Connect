// Function to get the patientId from the URL
function getQueryParameter(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}
function openSignIn() {
  window.location.href = "../../Logins/login.html"; // Replace with actual login path
}
function openDashboard() {
  window.location.href = "../Dashboard/dashboard.html"; // Replace with the actual path to your login page
}
// Get patientId from the URL
const patientId = getQueryParameter("patientId");

// Load patient details
async function loadPatientData() {
  if (!patientId) {
    console.error("No patientId found in the URL.");
    return;
  }

  try {
    const response = await fetch(`http://localhost:3001/api/patients/${patientId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch patient data: ${response.statusText}`);
    }

    const patient = await response.json();
    console.log("Patient data loaded:", patient);

    // Populate patient details in the HTML elements
    document.querySelector(".info h2").textContent = patient.name || "Unknown";
    document.querySelector(".info p").textContent = `${patient.age || "N/A"} yrs | ${patient.sex || "N/A"}`;
    document.getElementById("bloodGroup").textContent = patient.bloodGroup || "Unknown";
    document.getElementById("contactNumber").textContent = patient.mobileNumber || "N/A";
    document.getElementById("height").textContent = `${patient.height || "N/A"} cm`;
    document.getElementById("weight").textContent = `${patient.weight || "N/A"} kg`;
    document.getElementById("chiefComplaint").innerHTML = patient.chiefComplaint;
    document.getElementById("lastVisited").textContent = patient.createdAt
      ? new Date(patient.createdAt).toLocaleDateString()
      : "N/A";

    // Load patient-specific sections: history, monitoring plan, consultation notes, and investigations
    const historyElement = document.getElementById("history-content");
    const monitoringPlanElement = document.getElementById("monitoring-plan-content");
    const consultationNotesElement = document.getElementById("consultation-content");

    if (historyElement) {
      historyElement.textContent = patient.history || "No history available";
    }
    if (monitoringPlanElement) {
      monitoringPlanElement.textContent = patient.monitoringPlan || "No monitoring plan available";
    }
    if (consultationNotesElement) {
      consultationNotesElement.value = patient.consultationNotes || "";
    }

    // Render investigations in the DOM
    const investigationList = document.getElementById("added-investigations");
    if (investigationList) {
      investigationList.innerHTML = ""; // Clear any existing entries
      if (patient.investigations && patient.investigations.length > 0) {
        patient.investigations.forEach((investigation) => {
          const item = document.createElement("div");
          item.className = "investigation-item";
          item.textContent = investigation.testType;
          investigationList.appendChild(item);
        });
      } else {
        investigationList.innerHTML = "<p>No investigations available</p>";
      }
    }
  } catch (error) {
    console.error("Error loading patient details:", error);
    alert("Error loading patient data. Please check console logs for details.");
  }
}

// Save consultation notes to the database
async function saveConsultationNotes() {
  const consultationNotes = document.getElementById("consultation-content")?.value;
  const spo2 = document.getElementById("spO2value")?.value;
  const bp = document.getElementById("bloodPressurevalue")?.value;
  const temp  = document.getElementById("temperaturevalue")?.value;
  try {
    const response = await fetch(`http://localhost:3001/api/patients/${patientId}/consultation-notes`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ consultationNotes }),
    });
    const response1 = await fetch(`http://localhost:3001/api/patients/${patientId}/spo2`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ spo2 }),
    });
    const response2 = await fetch(`http://localhost:3001/api/patients/${patientId}/bp`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({bp }),
    });
    const response3 = await fetch(`http://localhost:3001/api/patients/${patientId}/temp`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ temp }),
    });
    if (response.ok) {
      alert("Consultation notes saved successfully");
    } else {
      throw new Error(`Failed to save consultation notes: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error saving consultation notes:", error);
    alert("Failed to save consultation notes. Please check console logs for details.");
  }
}

// Add event listener to the Save button if it exists
const saveButton = document.getElementById("saveButton");
if (saveButton) {
  saveButton.addEventListener("click", saveConsultationNotes);
} else {
  console.warn("Save button not found");
}

// Initialize data loading on page load
window.onload = function () {
  loadPatientData();
};
