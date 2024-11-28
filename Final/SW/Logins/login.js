document.getElementById("loginForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const role = document.querySelector('input[name="role"]:checked').value;
  const errorMessage = document.getElementById("errorMessage");

  console.log("Sending request with payload:", { email, password, role }); // Debugging payload

  try {
    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role })
    });
    const result = await response.json();
    
    if (response.ok) {
      errorMessage.textContent = "Success";
      errorMessage.style.color = "green";
      localStorage.setItem('userEmail', email);
      setTimeout(() => {
        let rolePath;
        switch (role) {
          case 'Doctor':
            rolePath = '../Doctor/Dashboard/dashboard.html';
            break;
          case 'Nurse':
            rolePath = '../Nurse/Dashboard/dashboard.html';
            break;
          case 'Admin':
            rolePath = '../Admin/Dasboard/dashboard.html';
            break;
          case 'Diagnostic':
            rolePath = '../Lab/Dashboard/dashboard.html';
            break;
          default:
            rolePath = 'dashboard.html';
        }
        window.location.href = rolePath;
      }, 1000);
    } else {
      errorMessage.textContent = result.message || "Invalid credentials";
      errorMessage.style.color = "red";
    }
  } catch (error) {
    console.error("Error during login:", error);
    errorMessage.textContent = "Login failed. Please try again.";
    errorMessage.style.color = "red";
  }
});
