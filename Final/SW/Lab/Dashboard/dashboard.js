function openSignIn() {
  window.location.href = "../../Logins/login.html"; // Replace with the actual path to your login page
}

document.addEventListener("DOMContentLoaded", async () => {
  const email = localStorage.getItem("userEmail"); // Get the email of the logged-in nurse
  const patientsTable = document.getElementById("patientsTable");
  let currentData = [];

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
    // document.getElementById("shiftHours").textContent =
    //   nurse.shiftHours || "N/A";
    // document.getElementById("wardNumber").textContent =
    //   nurse.wardNumber || "N/A";
  }

  // Fetch and render patients with a specific investigation
  async function fetchPatientsWithInvestigation(investigationType) {
    try {
      const response = await fetch(
        `http://localhost:3001/api/patients/patients/investigations?investigationType=${investigationType}`
      );
      currentData = await response.json();
      renderTable(currentData);
    } catch (error) {
      console.error("Failed to fetch patients with investigation:", error);
    }
  }

  // Render patient data into the table
  function renderTable(data) {
    patientsTable.innerHTML = "";

    if (data.length === 0) {
      const noDataRow = document.createElement("tr");
      noDataRow.innerHTML = `<td colspan="6" style="text-align:center;">No patients found with the specified investigation.</td>`;
      patientsTable.appendChild(noDataRow);
      return;
    }

    data.forEach((patient, index) => {
      const row = document.createElement("tr");
      row.style.backgroundColor = index % 2 === 0 ? "#cccccc" : "#ffffff";

      row.addEventListener("click", () => {
        window.location.href = `../Add-Report/add-report.html?patientId=${patient._id}`;
      });

      row.innerHTML = `
        <td>${patient.name}</td>

        <td>${patient.chiefComplaint || "N/A"}</td>
        <td>${patient.age}</td>
        <td>${patient.sex || "N/A"}</td>

        <td>
  ${patient.investigations.length > 0 
    ? patient.investigations.map(investigation => investigation.testType || "N/A").join(", ")
    : "N/A"
  }
</td>
      `;
      patientsTable.appendChild(row);
    });
  }

  // Handle search functionality for specific investigation type
  // document
  //   .getElementById("investigationSearchBtn")
  //   .addEventListener("click", () => {
  //     // const investigationType = document
  //     //   .getElementById("investigationSearchInput")
  //     //   .value.trim();
  //     if (investigationType) {
  //       fetchPatientsWithInvestigation(investigationType);
  //     } else {
  //       alert("Please enter a valid investigation type.");
  //     }
  //   });

  // Initial data load
  await fetchNurseInfo(); // Fetch and render nurse-specific info
  await fetchPatientsWithInvestigation("Blood Test"); // Example: Initially load patients with "Blood Test" investigation (you can modify or remove as needed)
});
