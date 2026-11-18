// Get profile form
const profileForm = document.getElementById("profileForm");
const message = document.getElementById("message");

const photoInput = document.getElementById("profilePhoto");
const photoPreview = document.getElementById("photoPreview");

let photoData = "";

// Check login
const token = localStorage.getItem("token");
const userData = localStorage.getItem("user");

if (!token || !userData) {
    window.location.href = "login.html";
}

// Get logged-in user details
const user = JSON.parse(userData);

// Fill name and email automatically
document.getElementById("fullName").value = user.name || "";
document.getElementById("profileEmail").value = user.email || "";

// Load previously saved profile
const savedProfile = localStorage.getItem("profile");

if (savedProfile) {
    const profile = JSON.parse(savedProfile);

    document.getElementById("fullName").value =
        profile.name || user.name || "";

    document.getElementById("profileEmail").value =
        profile.email || user.email || "";

    document.getElementById("phone").value =
        profile.phone || "";

    document.getElementById("profession").value =
        profile.profession || "";

    document.getElementById("about").value =
        profile.about || "";

    document.getElementById("education").value =
        profile.education || "";

    document.getElementById("skills").value =
        profile.skills || "";

    // Load saved photo
    if (profile.photo) {
        photoData = profile.photo;

        photoPreview.src = photoData;
        photoPreview.style.display = "block";
    }
}

// Profile photo upload
photoInput.addEventListener("change", function () {

    const file = photoInput.files[0];

    if (!file) {
        return;
    }

    // Check image type
    if (!file.type.startsWith("image/")) {
        message.style.color = "red";
        message.textContent = "Please select a valid image!";

        photoInput.value = "";
        return;
    }

    // Check file size - maximum 2 MB
    if (file.size > 2 * 1024 * 1024) {
        message.style.color = "red";
        message.textContent = "Photo must be less than 2 MB!";

        photoInput.value = "";
        return;
    }

    // Read image
    const reader = new FileReader();

    reader.onload = function (event) {

        photoData = event.target.result;

        photoPreview.src = photoData;
        photoPreview.style.display = "block";

        message.style.color = "green";
        message.textContent = "Photo selected successfully!";
    };

    reader.readAsDataURL(file);
});

// Save profile
profileForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const profile = {
        name: document.getElementById("fullName").value,
        email: document.getElementById("profileEmail").value,
        phone: document.getElementById("phone").value,
        profession: document.getElementById("profession").value,
        about: document.getElementById("about").value,
        education: document.getElementById("education").value,
        skills: document.getElementById("skills").value,
        photo: photoData
    };

    // Get projects from LocalStorage
    const savedProjects = localStorage.getItem("projects");

    const projects = savedProjects
        ? JSON.parse(savedProjects)
        : [];

    // Save locally as backup
    localStorage.setItem("profile", JSON.stringify(profile));

    message.style.color = "blue";
    message.textContent = "Saving profile to MongoDB...";

    try {

        // Send profile to backend
        const response = await fetch(
            "http://localhost:5000/portfolio",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },

                body: JSON.stringify({
                    ...profile,
                    projects: projects
                })
            }
        );

        const result = await response.json();

        if (response.ok) {

            message.style.color = "green";

            message.textContent =
                "Profile saved to MongoDB successfully!";

            console.log("MongoDB Portfolio:", result.portfolio);

        } else {

            message.style.color = "red";

            message.textContent =
                result.message || "Failed to save profile to MongoDB.";
        }

    } catch (error) {

        console.error("Save Error:", error);

        message.style.color = "red";

        message.textContent =
            "Profile saved locally, but backend connection failed!";
    }

});