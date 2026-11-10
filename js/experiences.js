import {
  supabase,
  makeElement,
  formatMonthYear,
  showMessage,
} from "./public-content.js";

const container = document.getElementById("experienceTimeline");

function renderExperience(item) {
  const article = makeElement("article", "timeline-item");
  const date = makeElement("div", "timeline-date");
  const start = formatMonthYear(item.start_date);
  const end = item.is_current ? "PRESENT" : formatMonthYear(item.end_date);
  date.textContent = [start, end].filter(Boolean).join(" — ") || "EXPERIENCE";

  const content = makeElement("div", "timeline-content");
  const type = makeElement(
    "span",
    "experience-type",
    item.employment_type || "PROFESSIONAL EXPERIENCE",
  );
  const title = makeElement("h3", "", item.title || "Untitled role");
  const company = makeElement("h4", "", item.company || "");
  const description = makeElement("p", "", item.description || "");

  content.append(type, title, company);
  if (item.location) {
    content.append(makeElement("p", "experience-location", item.location));
  }
  if (item.description) content.append(description);

  article.append(date, content);
  return article;
}

async function loadExperiences() {
  if (!container) return;

  const { data, error } = await supabase
    .from("experiences")
    .select("id, title, company, employment_type, location, description, start_date, end_date, is_current, sort_order")
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .order("start_date", { ascending: false });

  if (error) {
    console.error("Failed to load experiences:", error);
    showMessage(container, "Experience belum dapat dimuat. Silakan coba lagi nanti.");
    return;
  }

  if (!data?.length) {
    showMessage(container, "Experience akan segera ditampilkan.");
    return;
  }

  container.replaceChildren(...data.map(renderExperience));
}

loadExperiences();
