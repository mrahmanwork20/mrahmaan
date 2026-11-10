import {
  supabase,
  makeElement,
  formatMonthYear,
  showMessage,
} from "./public-content.js";

const container = document.getElementById("organizationGrid");

function renderOrganization(item) {
  const card = makeElement("article", "organization-card");
  const title = makeElement("h3", "", item.title || "Organizational role");
  const organization = makeElement("p", "organization-name", item.organization || "");
  const start = formatMonthYear(item.start_date);
  const end = item.end_date ? formatMonthYear(item.end_date) : "PRESENT";
  const period = makeElement(
    "p",
    "organization-period",
    [start, end].filter(Boolean).join(" — "),
  );
  card.append(title, organization, period);

  if (item.description) {
    card.append(makeElement("p", "organization-description", item.description));
  }
  return card;
}

async function loadOrganizations() {
  if (!container) return;

  const { data, error } = await supabase
    .from("organizations")
    .select("id, title, organization, description, start_date, end_date, sort_order")
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .order("start_date", { ascending: false });

  if (error) {
    console.error("Failed to load organizations:", error);
    showMessage(container, "Organisasi belum dapat dimuat. Silakan coba lagi nanti.");
    return;
  }

  if (!data?.length) {
    showMessage(container, "Pengalaman organisasi akan segera ditampilkan.");
    return;
  }

  container.replaceChildren(...data.map(renderOrganization));
}

loadOrganizations();
