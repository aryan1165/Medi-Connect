function openSignIn() {
  window.location.href = "../../Logins/login.html"; // Replace with actual login path
}

document.addEventListener("DOMContentLoaded", async () => {
  const email = localStorage.getItem("userEmail"); // Get the email of the logged-in nurse
  const patientsTable = document.getElementById("patientsTable");
  let currentData = [];

  // Define openSignIn globally

  // Fetch and render nurse information
  async function fetchNurseInfo() {
    try {
      const response = await fetch(
        `http://localhost:3001/api/dashboard/nurse-info?email=${email}`
      );
      const nurseData = await response.json();

      if (response.ok) {
        renderNurseInfo(nurseData);
      } else {
        console.error("Failed to fetch nurse info:", nurseData.message);
      }
    } catch (error) {
      console.error("Error fetching nurse info:", error);
    }
  }

  // Render nurse-specific information
  function renderNurseInfo(nurse) {
    document.getElementById(
      "nurseName"
    ).textContent = `WELCOME ${nurse.name.toUpperCase()}!`;
    document.getElementById("shiftHours").textContent =
      nurse.shiftHours || "N/A";
    document.getElementById("wardNumber").textContent =
      nurse.wardNumber || "N/A";
  }

  // Fetch and render IPD patients
  async function fetchPatients() {
    try {
      const response = await fetch(
        "http://localhost:3001/api/dashboard/patients?type=IPD"
      );
      currentData = await response.json();
      renderTable(currentData);
    } catch (error) {
      console.error("Failed to fetch patients:", error);
    }
  }

  // Render patient data into the table
  function renderTable(data) {
    patientsTable.innerHTML = "";

    data.forEach((patient, index) => {
      const row = document.createElement("tr");
      row.style.backgroundColor = index % 2 === 0 ? "#cccccc" : "#ffffff";

      row.addEventListener("click", () => {
        window.location.href = `../IPD-Patient/ipd-patient.html?patientId=${patient._id}`;
      });

      row.innerHTML = `
        <td>${patient.name}</td>
        <td>${patient.visitNo || "N/A"}</td>
        <td>${patient.chiefComplaint || "N/A"}</td>
        <td>${patient.age || "N/A"}</td>
        <td>${patient.sex || "N/A"}</td>
        <td>${patient.timings || "N/A"}</td>
      `;
      patientsTable.appendChild(row);
    });
  }

  // Initial data load
  await fetchNurseInfo(); // Fetch and render nurse-specific info
  await fetchPatients(); // Fetch and render patient data
});
