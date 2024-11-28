function openSignIn() {
  window.location.href = "../../Logins/login.html"; // Replace with the actual path to your login page
}
function openAddPatient() {
  window.location.href = "../New-patient/new-patient.html"; // Replace with the actual path to your login page
}
function toggleSelection(event) {
  // Remove the 'selected' class from all buttons
  const buttons = document.querySelectorAll(".patient-btn");
  buttons.forEach((button) => {
    button.classList.remove("selected");
  });

  // Add the 'selected' class to the clicked button
  event.target.classList.add("selected");
}

document.addEventListener("DOMContentLoaded", async () => {
  const email = localStorage.getItem("userEmail"); // Get the email of the logged-in doctor
  const patientsTable = document.getElementById("patientsTable");

  async function fetchPatients(type) {
    try {
      const response = await fetch(
        `http://localhost:3001/api/dashboard/patients?type=${type}`
      );
      const patients = await response.json();
      renderTable(patients, "patient"); // Pass "patient" as type
    } catch (error) {
      console.error(`Failed to fetch ${type} patients:`, error);
    }
  }

  // Fetch users data and render them with the appropriate type
  async function fetchUsersByRole(role) {
    try {
      const response = await fetch(
        `http://localhost:3001/api/dashboard/role-info?role=${role}`
      );
      const data = await response.json();
      if (data.users && data.users.length > 0) {
        renderTable(data.users, role); // Pass "user" as type
      } else {
        alert(`${role}s not found`);
      }
    } catch (error) {
      console.error(`Failed to fetch ${role} users:`, error);
    }
  }

  // Render patient data into the table
  function renderTable(data, type) {
    const patientsTable = document.getElementById("patientsTable");
    patientsTable.innerHTML = ""; // Clear existing rows

    // Dynamically change the table headings based on the type
    const tableHead = document.querySelector("thead tr");
    tableHead.innerHTML = ""; // Clear existing headings

    if (type === "Doctor") {
      tableHead.innerHTML = `
        <th>Name</th>
        <th>Email</th>
        <th>Specialization</th>
        <th>OPD Shift</th>
        <th>IDP Shift</th>
      `;
      // Render user data
      data.forEach((user) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${user.name}</td>
          <td>${user.email}</td>
          <td>${user.specialization || ""}</td>
          <td>${user.opdTimings || ""}</td>
          <td>${user.ipdTimings || ""}</td>
        `;
        patientsTable.appendChild(row);
      });
    } else if (type === "Nurse") {
      tableHead.innerHTML = `
        <th>Name</th>
        <th>Email</th>
        <th>Shift Hours</th>
        <th>Ward Number</th>
      `;
      // Render user data
      data.forEach((user) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${user.name}</td>
          <td>${user.email}</td>
          <td>${user.shiftHours || ""}</td>
          <td>${user.wardNumber || ""}</td>
        `;
        patientsTable.appendChild(row);
      });
    } else if (type === "patient") {
      tableHead.innerHTML = `
        <th>Name</th>
        <th>Visit No.</th>
        <th>Chief Complaint</th>
        <th>Age</th>
        <th>Sex</th>
        <th>Timings</th>
      `;
      // Render patient data
      data.forEach((patient, index) => {
        const row = document.createElement("tr");
        row.style.backgroundColor = index % 2 === 0 ? "#cccccc" : "#ffffff"; // alternate row colors
        
        row.innerHTML = `
          <td>${patient.name}</td>
          <td>${patient.visitNo}</td>
          <td>${patient.chiefComplaint}</td>
          <td>${patient.age}</td>
          <td>${patient.sex}</td>
          <td>${patient.timings}</td>
        `;
        patientsTable.appendChild(row);
      });
    }
  }

  // Default to OPD patients
  fetchPatients("OPD");

  document.getElementById("opdButton").addEventListener("click", () => {
    fetchPatients("OPD");
    toggleSelection(event);
  });

  document.getElementById("ipdButton").addEventListener("click", () => {
    fetchPatients("IPD");
    toggleSelection(event);
  });

  document.getElementById("doctorButton").addEventListener("click", () => {
    fetchUsersByRole("Doctor");
    toggleSelection(event);
  });

  document.getElementById("nurseButton").addEventListener("click", () => {
    fetchUsersByRole("Nurse");
    toggleSelection(event);
  });
});
