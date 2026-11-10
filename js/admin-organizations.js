import { supabase } from "./supabase.js";

const form = document.getElementById("organizationForm");
const list = document.getElementById("organizationList");
const alertBox = document.getElementById("alert");
const submitBtn = document.getElementById("submitBtn");
const cancelBtn = document.getElementById("cancelBtn");

let organizations = [];

function showAlert(message, type = "success") {
  alertBox.textContent = message;
  alertBox.className = `mb-5 p-4 rounded-lg text-sm ${
    type === "success"
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800"
  }`;
}

function hideAlert() {
  alertBox.classList.add("hidden");
}

function formatDate(date) {
  if (!date) return "Sekarang";
  return new Date(`${date}T00:00:00`).toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });
}

async function checkAdmin() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    window.location.href = "login.html";
    return false;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || profile?.role !== "admin") {
    await supabase.auth.signOut();
    window.location.href = "login.html";
    return false;
  }

  return true;
}

async function loadOrganizations() {
  list.textContent = "Memuat data...";

  const { data, error } = await supabase
    .from("organizations")
    .select(
      "id, title, organization, description, start_date, end_date, is_published, sort_order",
    )
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    list.textContent = "Gagal memuat data organisasi.";
    showAlert(error.message, "error");
    return;
  }

  organizations = data || [];
  renderOrganizations();
}

function renderOrganizations() {
  document.getElementById("totalCount").textContent =
    `${organizations.length} data`;

  list.replaceChildren();

  if (!organizations.length) {
    const empty = document.createElement("p");
    empty.className = "text-gray-500 text-sm";
    empty.textContent = "Belum ada data organisasi.";
    list.appendChild(empty);
    return;
  }

  organizations.forEach((item) => {
    const card = document.createElement("article");
    card.className = "border rounded-xl p-5";

    const heading = document.createElement("div");
    heading.className = "flex flex-col md:flex-row md:justify-between gap-3";

    const info = document.createElement("div");
    info.className = "min-w-0";

    const title = document.createElement("h4");
    title.className = "font-bold text-lg";
    title.textContent = item.title;

    const organization = document.createElement("p");
    organization.className = "text-yellow-700 font-medium text-sm mt-1";
    organization.textContent = item.organization;

    const dates = document.createElement("p");
    dates.className = "text-gray-500 text-xs mt-2";
    dates.textContent = `${formatDate(item.start_date)} — ${formatDate(item.end_date)}`;

    const description = document.createElement("p");
    description.className = "text-gray-600 text-sm mt-3 whitespace-pre-line";
    description.textContent = item.description || "-";

    const status = document.createElement("span");
    status.className = item.is_published
      ? "text-green-700 bg-green-100 px-3 py-1 rounded-full text-xs h-fit"
      : "text-gray-600 bg-gray-100 px-3 py-1 rounded-full text-xs h-fit";
    status.textContent = item.is_published ? "Published" : "Draft";

    info.append(title, organization, dates);
    heading.append(info, status);

    const actions = document.createElement("div");
    actions.className = "flex flex-wrap gap-2 mt-5";

    const editBtn = createButton("Edit", "bg-blue-100 text-blue-700");
    editBtn.addEventListener("click", () => editOrganization(item.id));

    const publishBtn = createButton(
      item.is_published ? "Jadikan Draft" : "Publikasikan",
      "bg-yellow-100 text-yellow-800",
    );
    publishBtn.addEventListener("click", () => togglePublish(item));

    const deleteBtn = createButton("Hapus", "bg-red-100 text-red-700");
    deleteBtn.addEventListener("click", () => deleteOrganization(item.id));

    actions.append(editBtn, publishBtn, deleteBtn);
    card.append(heading, description, actions);
    list.appendChild(card);
  });
}

function createButton(label, className) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = label;
  button.className = `${className} px-4 py-2 rounded-lg text-sm font-medium hover:opacity-80`;
  return button;
}

function resetForm() {
  form.reset();
  document.getElementById("organizationId").value = "";
  document.getElementById("sortOrder").value = "0";
  document.getElementById("isPublished").checked = true;
  document.getElementById("formTitle").textContent = "Tambah Organisasi";
  submitBtn.textContent = "Simpan Organisasi";
  cancelBtn.classList.add("hidden");
}

function editOrganization(id) {
  const item = organizations.find((org) => org.id === id);
  if (!item) return;

  document.getElementById("organizationId").value = item.id;
  document.getElementById("formPanel").hidden = false;
  document.getElementById("title").value = item.title || "";
  document.getElementById("organization").value = item.organization || "";
  document.getElementById("startDate").value = item.start_date || "";
  document.getElementById("endDate").value = item.end_date || "";
  document.getElementById("description").value = item.description || "";
  document.getElementById("sortOrder").value = item.sort_order ?? 0;
  document.getElementById("isPublished").checked = item.is_published;

  document.getElementById("formTitle").textContent = "Edit Organisasi";
  submitBtn.textContent = "Simpan Perubahan";
  cancelBtn.classList.remove("hidden");

  window.scrollTo({ top: 0, behavior: "smooth" });
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  hideAlert();

  const id = document.getElementById("organizationId").value;
  const startDate = document.getElementById("startDate").value || null;
  const endDate = document.getElementById("endDate").value || null;

  if (startDate && endDate && endDate < startDate) {
    showAlert(
      "Tanggal selesai tidak boleh lebih awal dari tanggal mulai.",
      "error",
    );
    return;
  }

  const payload = {
    title: document.getElementById("title").value.trim(),
    organization: document.getElementById("organization").value.trim(),
    description: document.getElementById("description").value.trim(),
    start_date: startDate,
    end_date: endDate,
    sort_order: Number(document.getElementById("sortOrder").value) || 0,
    is_published: document.getElementById("isPublished").checked,
  };

  if (!payload.title || !payload.organization) {
    showAlert("Jabatan dan nama organisasi wajib diisi.", "error");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Menyimpan...";

  const result = id
    ? await supabase.from("organizations").update(payload).eq("id", id)
    : await supabase.from("organizations").insert(payload);

  submitBtn.disabled = false;
  submitBtn.textContent = id ? "Simpan Perubahan" : "Simpan Organisasi";

  if (result.error) {
    showAlert(result.error.message, "error");
    return;
  }

  showAlert(
    id ? "Organisasi berhasil diperbarui." : "Organisasi berhasil ditambahkan.",
  );
  resetForm();
  await loadOrganizations();
});

async function togglePublish(item) {
  const { error } = await supabase
    .from("organizations")
    .update({ is_published: !item.is_published })
    .eq("id", item.id);

  if (error) {
    showAlert(error.message, "error");
    return;
  }

  showAlert("Status publikasi berhasil diubah.");
  await loadOrganizations();
}

async function deleteOrganization(id) {
  const confirmed = confirm("Yakin ingin menghapus organisasi ini?");
  if (!confirmed) return;

  const { error } = await supabase.from("organizations").delete().eq("id", id);

  if (error) {
    showAlert(error.message, "error");
    return;
  }

  showAlert("Organisasi berhasil dihapus.");
  await loadOrganizations();
}

cancelBtn.addEventListener("click", resetForm);

document.getElementById("logoutBtn").addEventListener("click", async () => {
  await supabase.auth.signOut();
  window.location.href = "login.html";
});

document.getElementById("addButton").addEventListener("click", () => {
  resetForm();
  document.getElementById("formPanel").hidden = false;
  document.getElementById("formPanel").scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
});

cancelBtn.addEventListener("click", () => {
  resetForm();
  document.getElementById("formPanel").hidden = true;
});

const isAdmin = await checkAdmin();

if (isAdmin) {
  await loadOrganizations();
}
