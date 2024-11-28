function openSignIn() {
  window.location.href = "../../Logins/login.html"; // Replace with the actual path to your login page
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
  let opdCount = 0;
  let ipdCount = 0;
  let chartInstance = null; // Hold the Chart.js instance

  // Fetch and render doctor information
  async function fetchDoctorInfo() {
    try {
      const response = await fetch(
        `http://localhost:3001/api/dashboard/doctor-info?email=${email}`
      );
      const doctorData = await response.json();

      if (response.ok) {
        renderDoctorInfo(doctorData);
      } else {
        console.error("Failed to fetch doctor info:", doctorData.message);
      }
    } catch (error) {
      console.error("Error fetching doctor info:", error);
    }
  }
  // Render doctor-specific information
  function renderDoctorInfo(doctor) {
    const welcomeContent = document.querySelector(".welcome-content");
    welcomeContent.querySelector(
      "h2"
    ).textContent = `WELCOME DR. ${doctor.name.toUpperCase()}!`;
    document.getElementById("opdTimings").textContent =
      doctor.opdTimings || "N/A";
    document.getElementById("ipdTimings").textContent =
      doctor.ipdTimings || "N/A";
    document.getElementById("specialization").textContent =
      doctor.specialization || "N/A";
    document.getElementById("phone").textContent = doctor.phone || "N/A";
  }

  // Fetch and render OPD/IPD patients and update counts
  async function fetchPatients(type) {
    try {
      const response = await fetch(
        `http://localhost:3001/api/dashboard/patients?type=${type}`
      );
      const patients = await response.json();

      if (type === "OPD") {
        opdCount = patients.length;
        document.getElementById("opdCount").textContent = opdCount;
      } else if (type === "IPD") {
        ipdCount = patients.length;
        document.getElementById("ipdCount").textContent = ipdCount;
      }

      renderTable(patients);
      updateChart(); // Update chart with new data
    } catch (error) {
      console.error(`Failed to fetch ${type} patients:`, error);
    }
  }

  // Render patient data into the table
  function renderTable(data) {
    patientsTable.innerHTML = ""; // Clear existing rows

    data.forEach((patient, index) => {
      const row = document.createElement("tr");
      row.style.backgroundColor = index % 2 === 0 ? "#cccccc" : "#ffffff";

      row.onclick = () => {
        const pageType = patient.type === "OPD" ? "OPD-Patient" : "IPD-Patient";
        window.location.href = `../${pageType}/${pageType.toLowerCase()}.html?patientId=${
          patient._id
        }`;
      };

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

  // Update or render pie chart
  function updateChart() {
    const ctx = document.getElementById("patientChart").getContext("2d");

    // If a chart instance exists, destroy it before creating a new one
    if (chartInstance) {
      chartInstance.destroy();
    }

    // Create a new chart instance
    chartInstance = new Chart(ctx, {
      type: "pie",
      data: {
        labels: ["OPD Patients", "IPD Patients"],
        datasets: [
          {
            data: [opdCount, ipdCount],
            backgroundColor: ["#36a2eb", "#ff6384"],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "top",
          },
        },
      },
    });
  }

  document
    .getElementById("opdButton")
    .addEventListener("click", () => fetchPatients("OPD"));
  document
    .getElementById("ipdButton")
    .addEventListener("click", () => fetchPatients("IPD"));
  // Attach event listeners to the buttons
  document
    .getElementById("opdButton")
    .addEventListener("click", toggleSelection);
  document
    .getElementById("ipdButton")
    .addEventListener("click", toggleSelection);

  // Initial data load
  await fetchDoctorInfo(); // Load doctor info dynamically
  await fetchPatients("OPD"); // Fetch OPD patients
  await fetchPatients("IPD"); // Fetch IPD patients
});
