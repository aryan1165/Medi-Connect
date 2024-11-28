// Function to get the patientId from the URL
function getQueryParameter(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}
function openDashboard() {
  window.location.href = "../Dashboard/dashboard.html"; // Replace with the actual path to your login page
}
// Function to open sign-in page
function openSignIn() {
  window.location.href = "../../Logins/login.html"; // Replace with actual login path
}

// Get patientId from the URL
const patientId = getQueryParameter("patientId");

// Initialize investigations sample data
const investigationData = ["Blood Test", "Urine Analysis", "MRI", "X-Ray"];

// Function to fetch patient data
async function loadPatientData() {
  if (!patientId) {
    console.error("No patientId found in the URL.");
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:3001/api/patients/${patientId}`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch patient data: ${response.statusText}`);
    }

    const patient = await response.json();
    // console.log("Patient data loaded:", patient);

    // Populate patient details dynamically
    // document.getElementById(
    //   "profilePic"
    // ).style.backgroundImage = `url(${patient.profilePicUrl})`;
    document.getElementById("patientName").textContent =
      patient.name || "Unknown";
      document.querySelector(
        ".info p"
      ).textContent = `${patient.age} yrs | ${patient.sex}`;
    document.getElementById("bloodGroup").textContent =
      patient.bloodGroup || "Unknown";
    document.getElementById("contactNumber").textContent =
      patient.mobileNumber || "N/A";
    document.getElementById("height").textContent = `${
      patient.height || "N/A"
    } cm`;
    document.getElementById("weight").textContent = `${
      patient.weight || "N/A"
    } kg`;
    document.getElementById("chiefComplaint").innerHTML = patient.chiefComplaint;
    document.getElementById("lastVisited").textContent = patient.createdAt
      ? new Date(patient.createdAt).toLocaleDateString()
      : "N/A";

    // Load investigations dynamically
    initializeInvestigations(patient.investigations);

    // Load vitals dynamically
    initializeVitals(patient);
  } catch (error) {
    console.error("Error loading patient details:", error);
    alert("Error loading patient data. Please check console logs for details.");
  }
}

// Function to initialize the investigation list
function initializeInvestigations(investigations) {
  const investigationList = document.getElementById("added-investigations");
  investigationList.innerHTML = ""; // Clear any existing items

  if (investigations && investigations.length > 0) {
    investigations.forEach((investigation) => {
      addInvestigationToDOM(investigation); // Use the addInvestigationToDOM function for each investigation
    });
  } else {
    investigationList.innerHTML = "<p>No investigations available</p>";
  }
}
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
  // item.appendChild(deleteButton);

  // Append the item to the DOM
  document.getElementById("added-investigations").appendChild(item);
}
// Function to initialize the vitals section
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

// Function to trigger file input on Dropbox click
function triggerFileInput() {
  document.getElementById("file-input").click();
}

// Function to handle file uploads and display the list of uploaded files
// No need to trigger file upload here
document.getElementById("file-input").addEventListener("change", function (event) {
  const files = event.target.files;
  const fileList = document.getElementById("uploaded-files");
  fileList.innerHTML = ""; // Clear previous list

  Array.from(files).forEach((file) => {
    const fileItem = document.createElement("div");
    fileItem.textContent = file.name;

    // Add delete button for each file
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.className = "delete-button";
    deleteButton.onclick = function () {
      removeItem(fileItem);
    };

    fileItem.appendChild(deleteButton);
    fileList.appendChild(fileItem);
  });
});

// Function to remove a file from the list
function removeItem(button) {
  button.parentElement.remove();
}

// Function to handle save action
async function saveData() {
  const files = document.getElementById("file-input").files;

  if (files.length === 0) {
    alert("Please select files to upload.");
    return;
  }
  
  // Prepare form data for the file upload
  const formData = new FormData();

  // Append each file to the FormData object
  Array.from(files).forEach((file) => formData.append("documents", file));

  try {
    // Send the files to the server (assuming patientId exists)
    const response = await fetch(
      `http://localhost:3001/api/patients/${patientId}/upload`,
      {
        method: "POST",
        body: formData,
      }
    );
    console.log("hello");
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Error uploading files.");
    }

    // If upload is successful, alert the user
    alert("Files uploaded successfully!");
    console.log("Uploaded documents:", result.documents);
  } catch (error) {
    console.error("Error uploading files:", error);
    alert("Error uploading files. Please check the console for details.");
  }

  // Save patient details (this part is separate from file upload)
  // try {
  //   const data = {
  //     // Add necessary data to save (patient data or updates)
  //   };
  //   const saveResponse = await fetch(
  //     `http://localhost:3001/api/patients/${patientId}/save`,
  //     {
  //       method: "PUT",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(data),
  //     }
  //   );

  //   if (saveResponse.ok) {
  //     alert("Data saved successfully");
  //   } else {
  //     console.error("Failed to save data.");
  //   }
  // } catch (error) {
  //   console.error("Error saving data:", error);
  // }
}
// Event listener for the Save button
document.getElementById("save-button").addEventListener("change", saveData);

// Populate dropdowns and load patient data on page load
window.onload = function () {
  loadPatientData(); // Load the patient data when the page is ready
};
