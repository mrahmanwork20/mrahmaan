import {
  supabase,
  makeElement,
  formatMonthYear,
  safeHttpUrl,
  showMessage,
} from "./public-content.js";

const container = document.getElementById("certificationGrid");

function renderCertification(item, index) {
  const card = makeElement("article", "cert-card");
  const number = makeElement(
    "span",
    "cert-icon",
    String(index + 1).padStart(2, "0"),
  );
  const details = makeElement("div", "cert-details");
  const title = makeElement("h3", "", item.title || "Certification");
  const issuer = makeElement("p", "", item.issuer || "Issuer not specified");
  details.append(title, issuer);

  if (item.certificate_date) {
    details.append(
      makeElement("p", "cert-date", formatMonthYear(item.certificate_date)),
    );
  }

  const linkUrl = safeHttpUrl(item.certificate_url);
  if (linkUrl) {
    const link = makeElement("a", "project-link", "View Certificate ↗");
    link.href = linkUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    details.append(link);
  }

  if (item.image_url) {
    const imageUrl = safeHttpUrl(item.image_url);
    if (imageUrl) {
      const image = document.createElement("img");
      image.src = imageUrl;
      image.alt = `Certificate: ${item.title || "Certification"}`;
      image.loading = "lazy";
      image.className = "certification-image";
      card.append(image);
    }
  }

  card.append(number, details);
  return card;
}

async function loadCertifications() {
  if (!container) return;

  const { data, error } = await supabase
    .from("certifications")
    .select("id, title, issuer, certificate_date, expiration_date, image_url, certificate_url, sort_order")
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .order("certificate_date", { ascending: false });

  if (error) {
    console.error("Failed to load certifications:", error);
    showMessage(container, "Certifications belum dapat dimuat. Silakan coba lagi nanti.");
    return;
  }

  if (!data?.length) {
    showMessage(container, "Sertifikasi akan segera ditampilkan.");
    return;
  }

  container.replaceChildren(...data.map(renderCertification));
}

loadCertifications();
