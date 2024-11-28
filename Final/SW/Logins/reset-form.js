document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const email = urlParams.get("email");

  // If email is found in the URL, set it in the email field (disabled)
  if (email) {
    document.getElementById("email").value = email;

    // Set the email as the placeholder in the password fields
    document.getElementById(
      "newPassword"
    ).placeholder = `New Password for ${email}`;
    document.getElementById(
      "confirmPassword"
    ).placeholder = `Confirm Password for ${email}`;
  }

  // Reset form submission handler
  document
    .getElementById("resetForm")
    .addEventListener("submit", async function (e) {
      e.preventDefault();

      const newPassword = document.getElementById("newPassword").value;
      const confirmPassword = document.getElementById("confirmPassword").value;
      const errorMessage = document.getElementById("errorMessage");

      // Check if passwords match
      if (newPassword !== confirmPassword) {
        errorMessage.textContent = "Passwords do not match";
        errorMessage.classList.remove("success-message"); // Remove success class if any
        errorMessage.classList.add("error-message"); // Add error class
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:3001/api/auth/reset-password",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, newPassword }),
          }
        );
        const result = await response.json();

        if (response.ok) {
          // Show success message
          errorMessage.textContent = "Password reset successfully.";
          errorMessage.classList.remove("error-message"); // Remove error class if any
          errorMessage.classList.add("success-message"); // Add success class

          // Wait 0.5 seconds before redirecting
          setTimeout(() => {
            window.location.href = "login.html"; // Redirect to login page
          }, 500);
        } else {
          errorMessage.textContent = result.message || "Password reset failed";
          errorMessage.classList.remove("success-message"); // Remove success class if any
          errorMessage.classList.add("error-message"); // Add error class
        }
      } catch (error) {
        console.error("Error resetting password:", error);
        errorMessage.textContent = "Password reset failed. Please try again.";
        errorMessage.classList.remove("success-message"); // Remove success class if any
        errorMessage.classList.add("error-message"); // Add error class
      }
    });
});
