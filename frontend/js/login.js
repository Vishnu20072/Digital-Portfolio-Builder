
const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const message = document.getElementById("message");

    try {
        const response = await fetch("http://localhost:5000/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const data = await response.json();

        if (response.ok) {
            message.style.color = "green";
            message.textContent = data.message;

            // Save login token
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            // Redirect after successful login
            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 1500);

        } else {
            message.style.color = "red";
            message.textContent = data.message;
        }

    } catch (error) {
        message.style.color = "red";
        message.textContent = "Unable to connect to server!";
        console.error(error);
    }
});
