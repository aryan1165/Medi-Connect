// Predefined options for dropdowns
const medicineOptions = ["Paracetamol", "Ibuprofen", "Amoxicillin", "Aspirin"];
const dosageOptions = ["500 mg", "250 mg", "100 mg", "50 mg"];
const routeOptions = ["Oral", "Intravenous", "Topical", "Inhalation"];
const frequencyOptions = [
  "Once a day",
  "Twice a day",
  "Every 8 hours",
  "Every 12 hours",
];
const testOptions = ["Blood Test", "X-Ray", "MRI", "CT Scan"];
function openSignIn() {
  window.location.href = "../../Logins/login.html"; // Replace with the actual path to your login page
}
// Function to populate dropdowns
function populateDropdown(id, options) {
  const dropdown = document.getElementById(id);
  options.forEach((option) => {
    const optElement = document.createElement("option");
    optElement.value = option;
    optElement.textContent = option;
    dropdown.appendChild(optElement);
  });
}

// Function to get the patientId from the URL
function getQueryParameter(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}
function openDashboard() {
  window.location.href = "../Dashboard/dashboard.html"; // Replace with the actual path to your login page
}
function openSignIn() {
  window.location.href = "../../Logins/login.html"; // Replace with the actual path to your login page
}
// Get patientId from the URL
const patientId = getQueryParameter("patientId");

// Load patient details
async function loadPatientDetails() {
  try {
    const response = await fetch(
      `http://localhost:3001/api/patients/${patientId}`
    );
    const patient = await response.json();

    // Populate patient details
    document.querySelector(".info h2").textContent = patient.name;
    document.querySelector(
      ".info p"
    ).textContent = `${patient.age} yrs | ${patient.sex}`;
    document.getElementById("bloodGroup").textContent = patient.bloodGroup;
    document.getElementById("contactNumber").textContent = patient.mobileNumber;
    document.getElementById("height").textContent = `${patient.height} cm`;
    document.getElementById("weight").textContent = `${patient.weight} kg`;
    document.getElementById("chiefComplaint").innerHTML = patient.chiefComplaint;
    document.getElementById("lastVisited").textContent = new Date(
      patient.createdAt
    ).toLocaleDateString();

    // Load previous history and notes if they exist
    document.getElementById("history").value = patient.history || "";
    document.getElementById("notes").value = patient.notes || "";

    // Render existing prescriptions and investigations
    patient.prescriptions.forEach(addPrescriptionToDOM);
    patient.investigations.forEach(addInvestigationToDOM);
    initializeVitals(patient);
  } catch (error) {
    console.error("Error loading patient details:", error);
  }
}

async function addPrescription() {
  const medicine = document.getElementById("medicine-name").value;
  const dosage = document.getElementById("dosage").value;
  const route = document.getElementById("route").value;
  const frequency = document.getElementById("frequency").value;

  const prescriptionData = { medicine, dosage, route, frequency };

  // Check if the prescription already exists
  const existingPrescriptions = Array.from(
    document.getElementById("added-prescriptions").children
  );
  const isDuplicatePrescription = existingPrescriptions.some((item) => {
    const text = item.querySelector("span").innerText;
    return (
      text.includes(medicine) &&
      text.includes(dosage) &&
      text.includes(route) &&
      text.includes(frequency)
    );
  });

  if (isDuplicatePrescription) {
    alert("This prescription has already been added.");
    return; // Skip adding the duplicate prescription
  }

  try {
    const response = await fetch(
      `http://localhost:3001/api/patients/${patientId}/prescriptions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(prescriptionData),
      }
    );

    if (response.ok) {
      addPrescriptionToDOM(prescriptionData);
    } else {
      console.error("Failed to add prescription.");
    }
  } catch (error) {
    console.error("Error adding prescription:", error);
  }
}

// Add prescription to the DOM
function addPrescriptionToDOM(prescription) {
  const item = document.createElement("div");
  item.innerHTML = `<span>${prescription.medicine} - ${prescription.dosage}, ${prescription.route}, ${prescription.frequency}</span> 
                    <button onclick="removeItem(this)">Delete</button>`;
  document.getElementById("added-prescriptions").appendChild(item);
}

// Add investigation to backend
async function addInvestigation() {
  const testType = document.getElementById("test-type").value;

  // Check if the investigation already exists
  const existingInvestigations = Array.from(
    document.getElementById("added-investigations").children
  );
  const isDuplicateInvestigation = existingInvestigations.some(
    (item) => item.querySelector("span").innerText === testType
  );

  if (isDuplicateInvestigation) {
    alert("This investigation has already been added.");
    return; // Skip adding the duplicate investigation
  }

  try {
    const response = await fetch(
      `http://localhost:3001/api/patients/${patientId}/investigations`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ testType }),
      }
    );

    if (response.ok) {
      addInvestigationToDOM({ testType });
    } else {
      console.error("Failed to add investigation.");
    }
  } catch (error) {
    console.error("Error adding investigation:", error);
  }
}

// Add investigation to the DOM
function addInvestigationToDOM(investigation) {
  const item = document.createElement("div");

  // Create span for the test type
  const span = document.createElement("span");
  span.textContent = investigation.testType;  // Add test type name

  // Create delete button
  const deleteButton = document.createElement("button");
  deleteButton.textContent = "Delete";
  deleteButton.onclick = function () {
    removeItem(deleteButton);
  };

  // Append the span and delete button to the item
  item.appendChild(span);
  item.appendChild(deleteButton);

  // Append the item to the DOM
  document.getElementById("added-investigations").appendChild(item);
}

// Remove item from the list
function removeItem(button) {
  button.parentElement.remove();
}

// Save all data to the backend
async function saveAllData() {
  const history = document.getElementById("history").value;
  const notes = document.getElementById("notes").value;

  // Collect all prescriptions and investigations from the DOM
  const prescriptions = Array.from(
    document.getElementById("added-prescriptions").children
  ).map((item) => {
    const details = item.querySelector("span").innerText.split(" - ");
    const [medicine, rest] = details;
    const [dosage, route, frequency] = rest.split(", ");
    return { medicine, dosage, route, frequency };
  });

  const investigations = Array.from(
    document.getElementById("added-investigations").children
  ).map((item) => {
    // Retrieve only the text content of the span, ignoring the delete button
    return { testType: item.querySelector("span").textContent };
  });

  const data = { history, notes, prescriptions, investigations };

  try {
    // Send the data save request
    const response = await fetch(
      `http://localhost:3001/api/patients/${patientId}/save`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );
  
    // Initiate the PDF generation request asynchronously without waiting for it
    fetch(`http://localhost:3001/api/patients/${patientId}/generate-pdf`, {
      method: "GET",
    }).catch(error => {
      console.error("Error generating PDF:", error);
    });
  
    // Handle saving response
    if (response.ok) {
      alert("Data saved successfully");
    } else {
      console.error("Failed to save data.");
    }
  } catch (error) {
    console.error("Error saving data:", error);
  }
  
}
// Show reports when the button is clicked
// async function showReports() {
//   try {
//     // Fetch reports for the patient from the backend
//     const response = await fetch(`http://localhost:3001/api/patients/reports/${patientId}`);
//     const data = await response.json();

//     const reportsList = document.getElementById("reportsList");
//     reportsList.innerHTML = ''; // Clear any existing content in the reports list

//     // Display each document based on its type
//     data.reports.forEach(report => {
//       const listItem = document.createElement('li');
//       const fileLink = document.createElement('a');
      
//       if (report.filePath) {
//         // The file path is relative to the backend, so we need to add the full base URL
//         fileLink.textContent = report.fileName;
//         fileLink.href = `http://localhost:3001${report.filePath}`;  // Full URL to the file
//         fileLink.target = '_blank';  // Open file in a new tab
//         listItem.appendChild(fileLink);
//       } else {
//         console.error("Missing filePath for report:", report);
//         listItem.textContent = "Invalid report data";
//       }

//       // Handle file type and display accordingly
//       if (report.fileType === 'image') {
//         const img = document.createElement('iframe');
//         img.src = `http://localhost:3001${report.filePath}`;  // Full URL to the image
//         // img.alt = report.fileName;
//         img.style.width = '0%';
//         img.style.height = '0px';  // Ensure the image is responsive
//         listItem.appendChild(img);
//       } else if (report.fileType === 'pdf') {
//         const iframe = document.createElement('iframe');
//         iframe.src = `http://localhost:3001${report.filePath}`;  // Full URL to the PDF
//         iframe.style.width = '100%';
//         iframe.style.height = '600px';  // Adjust height for the iframe to fit
//         listItem.appendChild(iframe);
//       }

//       reportsList.appendChild(listItem);
//     });

//     // Display the reports section
//     document.getElementById("reportsSection").style.display = 'block';
//   } catch (error) {
//     console.error("Error fetching reports:", error);
//     alert("Error fetching reports. Please check console logs for details.");
//   }
// }
function initializeVitals(patient) {
  // Blood Pressure
  const bloodPressureElement = document.getElementById("bloodPressure");
  if (bloodPressureElement) {
    bloodPressureElement.querySelector("p:nth-child(2)").textContent =
      patient.bloodPressure || "115/85 mm/Hg";
  }

  // Temperature
  const temperatureElement = document.getElementById("temperature");
  if (temperatureElement) {
    temperatureElement.querySelector("p:nth-child(2)").textContent =
      patient.temperature ? `${patient.temperature}` : "98.2°F";
  }

  // SP O2
  const spO2Element = document.getElementById("spO2");
  if (spO2Element) {
    spO2Element.querySelector("p:nth-child(2)").textContent = patient.spO2
      ? `${patient.spO2}`
      : "96%";
  }
}
async function showReports() {
  try {
    // Fetch report data from the server
    const response = await fetch(`http://localhost:3001/api/patients/reports/${patientId}`);
    const data = await response.json();

    // Check if reports exist
    if (data.reports && data.reports.length > 0) {
      // Open each report in a new tab
      data.reports.forEach(report => {
        // Open the document in a new tab
        window.open( `http://localhost:3001${report.filePath}`, '_blank');
      });
    } else {
      console.log("No reports found for this patient.");
    }
  } catch (error) {
    console.error("Error fetching reports:", error);
  }
}



// Event listener for the Show Reports button
document.getElementById("showReportsButton").addEventListener("click", showReports);
// Event listener for the Save button
document.getElementById("saveButton").addEventListener("click", saveAllData);

// Populate dropdowns and load patient data on page load
window.onload = function () {
  populateDropdown("medicine-name", medicineOptions);
  populateDropdown("dosage", dosageOptions);
  populateDropdown("route", routeOptions);
  populateDropdown("frequency", frequencyOptions);
  populateDropdown("test-type", testOptions);

  loadPatientDetails();
};
