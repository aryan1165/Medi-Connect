document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("requestResetForm")
    .addEventListener("submit", async function (e) {
      e.preventDefault();

      const userInput = document.getElementById("userInput").value;
      const errorMessage = document.getElementById("errorMessage");

      // Input Validation
      if (!userInput || (!userInput.includes("@") && isNaN(userInput))) {
        errorMessage.textContent =
          "Please enter a valid email or mobile number.";
        return;
      }

      errorMessage.textContent = ""; // Clear any previous error message

      try {
        const response = await fetch(
          "http://localhost:3001/api/auth/request-reset",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: userInput }),
          }
        );

        const result = await response.json();

        if (response.ok) {
          window.location.href =
            "otp-verify.html?email=" + encodeURIComponent(userInput);
        } else {
          errorMessage.textContent =
            result.message || "Request failed. Please try again.";
        }
      } catch (error) {
        console.error("Error requesting OTP:", error);
        errorMessage.textContent = "An error occurred. Please try again.";
      }
    });
});
