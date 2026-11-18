
/* Get saved profile details */
const profileData = localStorage.getItem("profile");

/* Get saved projects */
const projectData = localStorage.getItem("projects");

/* Convert saved data into JavaScript objects */
const profile = profileData ? JSON.parse(profileData) : null;
const projects = projectData ? JSON.parse(projectData) : [];

/* Display Profile */
if (profile) {

    document.getElementById("portfolioName").textContent =
        profile.name || "My Name";

    document.getElementById("portfolioProfession").textContent =
        profile.profession || "";

    document.getElementById("portfolioAbout").textContent =
        profile.about || "";

    document.getElementById("portfolioEmail").textContent =
        "Email: " + (profile.email || "");

    document.getElementById("portfolioPhone").textContent =
        "Phone: " + (profile.phone || "");

    document.getElementById("portfolioEducation").textContent =
        profile.education || "Education details not added";

    document.getElementById("portfolioSkills").textContent =
        profile.skills || "Skills not added";

    /* Display Profile Photo */
    const portfolioPhoto =
        document.getElementById("portfolioPhoto");

    if (profile.photo) {
        portfolioPhoto.src = profile.photo;
        portfolioPhoto.style.display = "block";
    }

} else {

    document.getElementById("portfolioName").textContent =
        "Profile not created yet";

    document.getElementById("portfolioAbout").textContent =
        "Please create your profile first.";
}

/* Display Projects */
const portfolioProjects =
    document.getElementById("portfolioProjects");

if (projects.length > 0) {

    projects.forEach(function(project) {

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

        if (project.link) {

            const link = document.createElement("a");

            link.href = project.link;
            link.textContent = "Visit Project";
            link.target = "_blank";
            link.rel = "noopener noreferrer";

            card.appendChild(link);
        }

        portfolioProjects.appendChild(card);
    });

} else {

    portfolioProjects.textContent =
        "No projects added yet.";
}

