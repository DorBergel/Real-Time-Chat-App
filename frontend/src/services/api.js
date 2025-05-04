export const handleRegisterSubmit = (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);
  const firstName = formData.get("firstName");
  const lastName = formData.get("lastName");
  const username = formData.get("username");
  const email = formData.get("email");
  const password = formData.get("password");
  const birthday = formData.get("birthday");

  console.log("First Name:", firstName);
  console.log("Last Name:", lastName);
  console.log("Username:", username);
  console.log("Email:", email);
  console.log("Password:", password);
  console.log("Birthday:", birthday);

  // validate the form data
  if (
    !firstName ||
    !lastName ||
    !username ||
    !email ||
    !password ||
    !birthday
  ) {
    alert("Please fill in all fields.");
    return;
  }

  fetch(`${process.env.REACT_APP_API_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      u_firstname: firstName,
      u_lastname: lastName,
      u_username: username,
      u_email: email,
      u_password: password,
      u_birthday: birthday,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        return response.json().then((errorData) => {
          throw new Error(errorData.reason || "Network response was not ok");
        });
      }
      return response.json();
    })
    .then((data) => {
      console.log("Success:", data);

      // Redirect to login page or perform other actions
      alert("Registration successful! Please log in.");
      window.location.href = "/login";
    })
    .catch((error) => {
      console.error("Error:", error.message);
      alert(`Registration failed: ${error.message}`);
    });
};

export const handleLoginSubmit = (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);
  const username = formData.get("username");
  const password = formData.get("password");

  console.log("Username:", username);
  console.log("Password:", password);

  // validate the form data
  if (!username || !password) {
    alert("Please fill in all fields.");
    return;
  }

  fetch(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      u_username: username,
      u_password: password,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        return response.json().then((errorData) => {
          throw new Error(errorData.reason || "Network response was not ok");
        });
      }
      return response.json();
    })
    .then((data) => {
      console.log("Success:", data);

      // Store the token in local storage
      localStorage.setItem("token", data.token);

      // Redirect to home page or perform other actions
      window.location.href = "/main";
    })
    .catch((error) => {
      console.error("Error:", error.message);
      alert(`Login failed: ${error.message}`);
    });
};
