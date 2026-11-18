
// Get form elements
const projectForm = document.getElementById("projectForm");
const message = document.getElementById("message");
const projectList = document.getElementById("projectList");

// Check login
const token = localStorage.getItem("token");
const userData = localStorage.getItem("user");

if (!token || !userData) {
    window.location.href = "login.html";
}

// Load saved projects
let projects = JSON.parse(localStorage.getItem("projects")) || [];

// Sync projects with MongoDB
async function syncProjectsToMongoDB() {

    const profileData = localStorage.getItem("profile");

    if (!profileData) {
        message.style.color = "red";
        message.textContent = "Please create your profile first!";
        return false;
    }

    const profile = JSON.parse(profileData);

    try {

        const response = await fetch("http://localhost:5000/portfolio", {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },

            body: JSON.stringify({
                ...profile,
                projects: projects
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "MongoDB save failed");
        }

        return true;

    } catch (error) {

        console.error("MongoDB Sync Error:", error);

        message.style.color = "red";
        message.textContent =
            "Project saved locally, but MongoDB sync failed!";

        return false;
    }
}

// Display projects
function displayProjects() {

    projectList.innerHTML = "";

    if (projects.length === 0) {
        projectList.textContent = "No projects added yet.";
        return;
    }

    projects.forEach(function(project, index) {

        const card = document.createElement("div");

        card.className = "dashboard-card";
        card.style.marginTop = "20px";

        const title = document.createElement("h3");
        title.textContent = project.name;

        const description = document.createElement("p");
        description.textContent = project.description;

        const technologies = document.createElement("p");
        technologies.textContent =
            "Technologies: " + project.technologies;

        card.appendChild(title);
        card.appendChild(description);
        card.appendChild(technologies);

        // Project link
        if (project.link) {

            const link = document.createElement("a");

            link.href = project.link;
            link.textContent = "View Project";
            link.target = "_blank";
            link.rel = "noopener noreferrer";

            card.appendChild(link);
        }

        // Delete button
        const deleteButton = document.createElement("button");

        deleteButton.textContent = "Delete Project";
        deleteButton.style.marginTop = "15px";
        deleteButton.style.background = "#dc3545";

        deleteButton.addEventListener("click", async function() {

            projects.splice(index, 1);

            localStorage.setItem(
                "projects",
                JSON.stringify(projects)
            );

            displayProjects();

            message.style.color = "blue";
            message.textContent = "Updating MongoDB...";

            const success = await syncProjectsToMongoDB();

            if (success) {
                message.style.color = "green";
                message.textContent =
                    "Project deleted and MongoDB updated successfully!";
            }
        });

        card.appendChild(deleteButton);

        projectList.appendChild(card);
    });
}

// Add project
projectForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    const project = {
        name: document.getElementById("projectName").value.trim(),
        description: document.getElementById("projectDescription").value.trim(),
        technologies: document.getElementById("technologies").value.trim(),
        link: document.getElementById("projectLink").value.trim()
    };

    if (!project.name || !project.description) {
        message.style.color = "red";
        message.textContent = "Please enter project name and description!";
        return;
    }

    // Save project locally
    projects.push(project);

    localStorage.setItem(
        "projects",
        JSON.stringify(projects)
    );

    projectForm.reset();

    displayProjects();

    message.style.color = "blue";
    message.textContent = "Saving project to MongoDB...";

    // Sync with MongoDB
    const success = await syncProjectsToMongoDB();

    if (success) {
        message.style.color = "green";
        message.textContent =
            "Project added and saved to MongoDB successfully!";
    }
});

// Show existing projects
displayProjects();
