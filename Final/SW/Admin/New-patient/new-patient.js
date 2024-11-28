const patientForm = document.getElementById('patientForm');
function openDashboard() {
  window.location.href = "../Dasboard/dashboard.html"; // Replace with the actual path to your login page
}
function calculateAge(dob) {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}
function openSignIn() {
  window.location.href = "../../Logins/login.html"; // Replace with the actual path to your login page
}
patientForm.addEventListener('submit', async function (event) {
  event.preventDefault();

  const dobValue = document.getElementById('dob').value;
  const age = calculateAge(dobValue);

  const newPatient = {
    name: document.getElementById('patientName').value,
    dob: dobValue,
    age: age,
    bloodGroup: document.getElementById('bloodGroup').value,
    sex: document.getElementById('category').value,
    email: document.getElementById('email').value,
    mobileNumber: document.getElementById('mobileNumber').value,
    height: parseFloat(document.getElementById('height').value) || null,
    weight: parseFloat(document.getElementById('weight').value) || null,
    type: document.getElementById('type').value,
    visitNo: document.getElementById('visitNo').value, // New field
    chiefComplaint: document.getElementById('chiefComplaint').value, // New field
    timings: document.getElementById('timings').value // New field
  };

  try {
    const response = await fetch('http://localhost:3001/api/patients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newPatient),
    });

    if (response.ok) {
      const result = await response.json();
      alert(result.message || 'Patient added successfully!');
      patientForm.reset();
    } else {
      const error = await response.json();
      console.error("Server error:", error);
      alert(`Error: ${error.message || 'Failed to add patient'}`);
    }
  } catch (error) {
    alert(`Network Error: ${error.message}`);
  }
});
