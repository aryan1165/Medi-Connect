// Function to validate email
function validateEmail(email) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

// Function to validate phone number (10 digits)
function validatePhoneNumber(phone) {
  const phoneRegex = /^\d{10}$/;
  return phoneRegex.test(phone);
}

// Function to validate if name contains numbers
function validateName(name) {
  const nameRegex = /[^a-zA-Z]/; // Regular expression to check for digits or special characters in the name
  return !nameRegex.test(name); // Returns true if no digits or special characters are found
}
// Function to validate password length (minimum 8 characters)
function validatePassword(password) {
  return password.length >= 8; // Password should be at least 8 characters long
}

// Show or hide doctor-specific and nurse-specific fields based on selected role
document.getElementById("role").addEventListener("change", (e) => {
  const doctorFields = document.getElementById("doctorFields");
  const nurseFields = document.getElementById("nurseFields");

  if (e.target.value === "Doctor") {
    doctorFields.style.display = "block";
    nurseFields.style.display = "none";
  } else if (e.target.value === "Nurse") {
    nurseFields.style.display = "block";
    doctorFields.style.display = "none";
  } else {
    doctorFields.style.display = "none";
    nurseFields.style.display = "none";
  }
});

// Handle form submission
document
  .getElementById("registerForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault(); // Prevent the form from submitting until validation

    // Basic form fields
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const role = document.getElementById("role").value;
    const messageElement = document.getElementById("message");

    // Doctor-specific fields
    const specialization = document.getElementById("specialization")?.value;
    const opdTimings = document.getElementById("opdTimings")?.value;
    const ipdTimings = document.getElementById("ipdTimings")?.value;
    const phone = document.getElementById("phone")?.value;

    // Nurse-specific fields
    const shiftHours = document.getElementById("shiftHours")?.value;
    const wardNumber = document.getElementById("wardNumber")?.value;

    // Validate if name contains numbers
    if (!validateName(name)) {
      messageElement.textContent = "Name should only contain characters.";
      messageElement.style.color = "red";
      return;
    }

    // Validate email
    if (!validateEmail(email)) {
      messageElement.textContent = "Invalid email address.";
      messageElement.style.color = "red";
      return;
    }

    // Validate phone number (independent of role)
    if (phone && !validatePhoneNumber(phone)) {
      messageElement.textContent = "Phone number must be 10 digits.";
      messageElement.style.color = "red";
      return;
    }

    // Validate password length (minimum 8 characters)
    if (!validatePassword(password)) {
      messageElement.textContent =
        "Password must be at least 8 characters long.";
      messageElement.style.color = "red";
      return;
    }

    // Validate password match
    if (password !== confirmPassword) {
      messageElement.textContent = "Passwords do not match.";
      messageElement.style.color = "red";
      return;
    }

    // Prepare the payload for the API call
    const payload = { name, email, password, role };
    if (role === "Doctor") {
      payload.specialization = specialization;
      payload.opdTimings = opdTimings;
      payload.ipdTimings = ipdTimings;
      payload.phone = phone;
    } else if (role === "Nurse") {
      payload.shiftHours = shiftHours;
      payload.wardNumber = wardNumber;
      payload.phone = phone;
    }

    try {
      // Send request to backend (API call)
      const response = await fetch("http://localhost:3001/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        messageElement.textContent =
          "Registration successful! You can now log in.";
        messageElement.style.color = "green";
        window.location.href = "login.html"; // Redirect to login page
      } else {
        messageElement.textContent =
          result.message || "Registration failed. Please try again.";
        messageElement.style.color = "red";
      }
    } catch (error) {
      console.error("Error during registration:", error);
      messageElement.textContent = "Registration failed. Please try again.";
      messageElement.style.color = "red";
    }
  });
