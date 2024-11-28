// Predefined options for investigations
const investigationOptions = [
  "Blood Test",
  "X-Ray",
  "MRI",
  "CT Scan",
  "Urine Analysis",
];
function openSignIn() {
  window.location.href = "../../Logins/login.html"; // Replace with the actual path to your login page
}
function openDashboard() {
  window.location.href = "../Dashboard/dashboard.html"; // Replace with the actual path to your login page
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

// Get patientId from the URL
function getQueryParameter(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}
const patientId = getQueryParameter("patientId");

// Load patient details
async function loadPatientDetails() {
  try {
    const response = await fetch(
      `http://localhost:3001/api/patients/${patientId}`
    );
    const patient = await response.json();

    // Populate patient details
    document.getElementById("patientName").textContent = patient.name;
    document.getElementById(
      "patientAgeSex"
    ).textContent = `${patient.age} yrs | ${patient.sex}`;
    document.getElementById("bloodGroup").textContent = patient.bloodGroup;
    document.getElementById("contactNumber").textContent = patient.mobileNumber;
    document.getElementById("height").textContent = `${patient.height} cm`;
    document.getElementById("weight").textContent = `${patient.weight} kg`;
    document.getElementById("chiefComplaint").innerHTML = patient.chiefComplaint;
    document.getElementById("lastVisited").textContent = new Date(
      patient.createdAt
    ).toLocaleDateString();

    // Load previous data
    document.getElementById("history").value = patient.history || "";
    document.getElementById("monitoringPlan").value =
      patient.monitoringPlan || "";
    document.getElementById("notes").value = patient.notes || "";

    // Render existing investigations
    patient.investigations.forEach(addInvestigationToDOM);
  } catch (error) {
    console.error("Error loading patient details:", error);
  }
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
  const monitoringPlan = document.getElementById("monitoringPlan").value;

  // Collect all investigations from the DOM
  // Collect all investigations from the DOM
  const investigations = Array.from(
    document.getElementById("added-investigations").children
  ).map((item) => {
    // Retrieve only the text content of the span, ignoring the delete button
    return { testType: item.querySelector("span").textContent };
  });

  const data = { history, notes, monitoringPlan, investigations };

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
function initializeVitals(patient) {
  // Blood Pressure
  const bloodPressureElement = document.getElementById("bloodPressure");
  if (bloodPressureElement) {
    bloodPressureElement.querySelector("p:nth-child(2)").textContent =
      patient.bloodPressure || "N/A";
  }

  // Temperature
  const temperatureElement = document.getElementById("temperature");
  if (temperatureElement) {
    temperatureElement.querySelector("p:nth-child(2)").textContent =
      patient.temperature ? `${patient.temperature}` : "N/A";
  }

  // SP O2
  const spO2Element = document.getElementById("spO2");
  if (spO2Element) {
    spO2Element.querySelector("p:nth-child(2)").textContent = patient.spO2
      ? `${patient.spO2}`
      : "N/A";
  }
}
// Load patient details
async function loadPatientDetails() {
  try {
    const response = await fetch(
      `http://localhost:3001/api/patients/${patientId}`
    );
    const patient = await response.json();

    // Populate patient details
    document.getElementById("patientName").textContent = patient.name;
    document.getElementById(
      "patientAgeSex"
    ).textContent = `${patient.age} yrs | ${patient.sex}`;
    document.getElementById("bloodGroup").textContent = patient.bloodGroup;
    document.getElementById("contactNumber").textContent = patient.mobileNumber;
    document.getElementById("height").textContent = `${patient.height} cm`;
    document.getElementById("weight").textContent = `${patient.weight} kg`;
    document.getElementById("chiefComplaint").innerHTML = patient.chiefComplaint;
    document.getElementById("lastVisited").textContent = new Date(
      patient.createdAt
    ).toLocaleDateString();

    // Load previous data
    document.getElementById("history").value = patient.history || "";
    document.getElementById("monitoringPlan").value =
      patient.monitoringPlan || "";
    document.getElementById("notes").value = patient.notes || "";

    // Render existing investigations
    patient.investigations.forEach(addInvestigationToDOM);
    initializeVitals(patient);
  } catch (error) {
    console.error("Error loading patient details:", error);
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
//         const img = document.createElement('img');
//         img.src = `http://localhost:3001${report.filePath}`;  // Full URL to the image
//         img.alt = report.fileName;
//         img.style.maxWidth = '100%';  // Ensure the image is responsive
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
  populateDropdown("test-type", investigationOptions);
  loadPatientDetails();
};
