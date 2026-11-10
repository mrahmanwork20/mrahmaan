
import { supabase } from "./supabase.js";

const projectGrid = document.getElementById("projectGrid");

// Mencegah URL yang tidak aman digunakan sebagai link.
function safeUrl(value) {
    if (!value) return null;

    try {
        const url = new URL(value);

        if (url.protocol === "https:" || url.protocol === "http:") {
            return url.href;
        }

        return null;
    } catch {
        return null;
    }
}

// Membuat elemen HTML dengan aman menggunakan textContent.
function createElement(tag, className, content = "") {
    const element = document.createElement(tag);

    if (className) {
        element.className = className;
    }

    element.textContent = content;

    return element;
}

function renderProject(project) {
    const card = createElement("article", "project-card");

    const imageContainer = createElement(
        "div",
        "project-image"
    );

    if (project.image_url) {
        const imageUrl = safeUrl(project.image_url);

        if (imageUrl) {
            const image = document.createElement("img");

            image.src = imageUrl;
            image.alt = project.title || "Project image";
            image.loading = "lazy";

            image.style.width = "100%";
            image.style.height = "100%";
            image.style.objectFit = "cover";

            imageContainer.replaceChildren(image);
        }
    }

    const info = createElement("div", "project-info");

    const category = createElement(
        "p",
        "project-category",
        project.category || "PROJECT"
    );

    const title = createElement(
        "h3",
        "",
        project.title
    );

    const description = createElement(
        "p",
        "",
        project.description
    );

    const tags = createElement("div", "tag-list");

    (project.technologies || []).forEach(technology => {
        tags.appendChild(
            createElement("span", "", technology)
        );
    });

    info.append(category, title, description, tags);

    const projectUrl = safeUrl(project.project_url);
    const repositoryUrl = safeUrl(project.repository_url);

    if (projectUrl || repositoryUrl) {
        const actions = createElement("div", "project-actions");

        if (projectUrl) {
            const link = createElement("a", "project-link", "View Project ↗");

            link.href = projectUrl;
            link.target = "_blank";
            link.rel = "noopener noreferrer";

            actions.appendChild(link);
        }

        if (repositoryUrl) {
            const link = createElement("a", "project-link", "Repository ↗");

            link.href = repositoryUrl;
            link.target = "_blank";
            link.rel = "noopener noreferrer";

            actions.appendChild(link);
        }

        info.appendChild(actions);
    }

    card.append(imageContainer, info);

    return card;
}

async function loadProjects() {
    if (!projectGrid) return;

    projectGrid.replaceChildren(
        createElement("p", "project-loading", "Loading projects...")
    );

    const { data, error } = await supabase
        .from("projects")
        .select(`
            id,
            title,
            category,
            description,
            image_url,
            project_url,
            repository_url,
            technologies,
            is_featured,
            sort_order
        `)
        .eq("is_published", true)
        .order("sort_order", { ascending: true });

    if (error) {
        console.error("Failed to load projects:", error);

        projectGrid.replaceChildren(
            createElement(
                "p",
                "project-message",
                "Unable to load projects. Please try again later."
            )
        );

        return;
    }

    if (!data || data.length === 0) {
        projectGrid.replaceChildren(
            createElement(
                "p",
                "project-message",
                "Projects will be available soon."
            )
        );

        return;
    }

    projectGrid.replaceChildren(
        ...data.map(renderProject)
    );
}

loadProjects();
