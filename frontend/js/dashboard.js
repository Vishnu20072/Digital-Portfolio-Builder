
const token = localStorage.getItem("token");
const userData = localStorage.getItem("user");

if (!token || !userData) {
    window.location.href = "login.html";
} else {
    const user = JSON.parse(userData);

    document.getElementById("welcomeMessage").textContent =
        "Welcome, " + user.name + "!";
}

document.getElementById("logoutBtn").addEventListener("click", function () {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "login.html";
});
