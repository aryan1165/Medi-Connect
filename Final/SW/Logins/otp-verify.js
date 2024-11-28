document.addEventListener("DOMContentLoaded", () => {
  const otpInputs = document.querySelectorAll(".otp-input");
  const verifyOtpBtn = document.getElementById("verifyOtpBtn");
  const resendCodeLink = document.getElementById("resendCode");
  const errorMessage = document.getElementById("errorMessage");

  // Helper function to get email from URL query parameters
  function getQueryParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
  }

  const email = getQueryParameter("email");

  // Set the email in the email input field (disabled)
  if (email) {
    document.getElementById("email").value = email; // Set email in the input field
  }

  otpInputs.forEach((input, index) => {
    input.addEventListener("input", (e) => {
      const value = e.target.value;
      if (isNaN(value)) {
        e.target.value = ""; // Only allow numeric input
        return;
      }

      // Automatically focus next input
      if (value && index < otpInputs.length - 1) {
        otpInputs[index + 1].focus();
      }
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && index > 0 && !e.target.value) {
        otpInputs[index - 1].focus();
      }
    });
  });

  // OTP Verification
  verifyOtpBtn.addEventListener("click", async () => {
    const otp = Array.from(otpInputs)
      .map((input) => input.value)
      .join("");

    try {
      const response = await fetch(
        "http://localhost:3001/api/auth/verify-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp }),
        }
      );
      const result = await response.json();

      if (response.ok) {
        window.location.href = `reset-form.html?email=${encodeURIComponent(
          email
        )}`;
      } else {
        errorMessage.textContent =
          result.message || "Invalid OTP. Please try again.";
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      errorMessage.textContent = "OTP verification failed. Please try again.";
    }
  });

  // Resend OTP
  resendCodeLink.addEventListener("click", async () => {
    try {
      const response = await fetch(
        "http://localhost:3001/api/auth/request-reset",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );
      const result = await response.json();

      if (response.ok) {
        alert("OTP has been resent to your email.");
      } else {
        errorMessage.textContent =
          result.message || "Failed to resend OTP. Please try again.";
      }
    } catch (error) {
      console.error("Error resending OTP:", error);
      errorMessage.textContent = "Error resending OTP. Please try again.";
    }
  });
});
