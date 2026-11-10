import { supabase } from "./supabase.js";

const form = document.getElementById("projectForm");
const formPanel = document.getElementById("projectFormPanel");
const projectList = document.getElementById("projectList");
const listMessage = document.getElementById("listMessage");
const formMessage = document.getElementById("formMessage");
const saveButton = document.getElementById("saveButton");

let editingId = null;

// Pastikan hanya admin yang dapat membuka halaman ini
async function checkAdmin() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    window.location.replace("./login.html");
    return false;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || profile?.role !== "admin") {
    await supabase.auth.signOut();
    window.location.replace("./login.html");
    return false;
  }

  return true;
}

function getValue(id) {
  return document.getElementById(id).value.trim();
}

function showFormMessage(message) {
  formMessage.textContent = message;
}

function resetForm() {
  form.reset();
  editingId = null;

  document.getElementById("sortOrder").value = 0;
  document.getElementById("isPublished").checked = true;
  document.getElementById("isFeatured").checked = false;
  document.getElementById("formTitle").textContent = "Tambah Project";
  saveButton.textContent = "Simpan Project";

  showFormMessage("");
}

function openForm() {
  formPanel.hidden = false;
  formPanel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function closeForm() {
  formPanel.hidden = true;
  resetForm();
}

// Membuat slug otomatis dari nama project
document.getElementById("title").addEventListener("input", (event) => {
  if (editingId) return;

  const slug = event.target.value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  document.getElementById("slug").value = slug;
});

// Upload gambar ke Supabase Storage
async function uploadProjectImage(file) {
  if (!file) return null;

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

  if (!allowedTypes.includes(file.type)) {
    throw new Error("Format gambar harus JPG, PNG, atau WebP.");
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Ukuran gambar maksimal 5 MB.");
  }

  const extension =
    file.type === "image/jpeg"
      ? "jpg"
      : file.type === "image/png"
        ? "png"
        : "webp";

  const filePath = `projects/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage
    .from("portfolio-media")
    .upload(filePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) throw error;

  const { data } = supabase.storage
    .from("portfolio-media")
    .getPublicUrl(filePath);

  return data.publicUrl;
}

// Ambil semua project
async function loadProjects() {
  listMessage.textContent = "Memuat proyek...";
  projectList.replaceChildren();

  const { data, error } = await supabase
    .from("projects")
    .select(
      `
        id,
        title,
        slug,
        category,
        role,
        description,
        image_url,
        project_url,
        repository_url,
        technologies,
        is_published,
        is_featured,
        sort_order
    `,
    )
    .order("sort_order", { ascending: true });

  if (error) {
    console.error(error);
    listMessage.textContent = "Gagal mengambil data proyek.";
    return;
  }

  if (!data || data.length === 0) {
    listMessage.textContent =
      "Belum ada proyek. Tambahkan proyek pertama kamu.";
    return;
  }

  listMessage.textContent = "";

  data.forEach((project) => {
    const item = document.createElement("article");
    item.className = "project-item";

    const image = document.createElement("img");
    image.alt = project.title;

    if (project.image_url) {
      image.src = project.image_url;
    } else {
      image.src = "https://placehold.co/300x200?text=No+Image";
    }

    const info = document.createElement("div");
    info.className = "project-info";

    const title = document.createElement("h3");
    title.textContent = project.title;

    const details = document.createElement("p");
    details.textContent = `${project.category || "Uncategorized"} · ${project.slug}`;

    const status = document.createElement("span");
    status.className = project.is_published ? "status published" : "status";

    status.textContent = project.is_published ? "Published" : "Draft";

    info.append(title, details, status);

    const actions = document.createElement("div");
    actions.className = "project-actions";

    const editButton = document.createElement("button");
    editButton.className = "edit-btn";
    editButton.textContent = "Edit";
    editButton.addEventListener("click", () => editProject(project));

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-btn";
    deleteButton.textContent = "Hapus";
    deleteButton.addEventListener("click", () => deleteProject(project));

    actions.append(editButton, deleteButton);
    item.append(image, info, actions);

    projectList.appendChild(item);
  });
}

// Isi form untuk mengedit project
function editProject(project) {
  editingId = project.id;

  document.getElementById("title").value = project.title || "";
  document.getElementById("slug").value = project.slug || "";
  document.getElementById("category").value = project.category || "";
  document.getElementById("role").value = project.role || "";
  document.getElementById("description").value = project.description || "";
  document.getElementById("technologies").value = (
    project.technologies || []
  ).join(", ");

  document.getElementById("projectUrl").value = project.project_url || "";

  document.getElementById("repositoryUrl").value = project.repository_url || "";

  document.getElementById("sortOrder").value = project.sort_order ?? 0;

  document.getElementById("isPublished").checked = project.is_published;

  document.getElementById("isFeatured").checked = project.is_featured;

  document.getElementById("formTitle").textContent = "Edit Project";
  saveButton.textContent = "Update Project";

  showFormMessage(
    "Kosongkan pilihan gambar jika tidak ingin mengganti gambar.",
  );
  openForm();
}

// Simpan project baru atau perubahan project
form.addEventListener("submit", async (event) => {
  event.preventDefault();

  saveButton.disabled = true;
  saveButton.textContent = "Menyimpan...";
  showFormMessage("");

  try {
    const title = getValue("title");
    const slug = getValue("slug");

    if (!title || !slug) {
      throw new Error("Nama project dan slug wajib diisi.");
    }

    const file = document.getElementById("projectImage").files[0];

    let imageUrl = null;

    if (file) {
      imageUrl = await uploadProjectImage(file);
    }

    const payload = {
      title,
      slug,
      category: getValue("category") || null,
      role: getValue("role") || null,
      description: getValue("description") || null,
      technologies: getValue("technologies")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      project_url: getValue("projectUrl") || null,
      repository_url: getValue("repositoryUrl") || null,
      is_published: document.getElementById("isPublished").checked,
      is_featured: document.getElementById("isFeatured").checked,
      sort_order: Number(document.getElementById("sortOrder").value) || 0,
    };

    // Jangan mengubah gambar lama jika tidak ada file baru
    if (imageUrl) {
      payload.image_url = imageUrl;
    }

    let result;

    if (editingId) {
      result = await supabase
        .from("projects")
        .update(payload)
        .eq("id", editingId);
    } else {
      result = await supabase.from("projects").insert(payload);
    }

    if (result.error) throw result.error;

    alert(
      editingId
        ? "Project berhasil diperbarui."
        : "Project berhasil ditambahkan.",
    );

    closeForm();
    await loadProjects();
  } catch (error) {
    console.error("Save project error:", error);
    showFormMessage(error.message || "Gagal menyimpan project.");
  } finally {
    saveButton.disabled = false;
    saveButton.textContent = editingId ? "Update Project" : "Simpan Project";
  }
});

// Hapus project
async function deleteProject(project) {
  const confirmed = confirm(
    `Yakin ingin menghapus project "${project.title}"?`,
  );

  if (!confirmed) return;

  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", project.id);

  if (error) {
    console.error(error);
    alert("Gagal menghapus project: " + error.message);
    return;
  }

  alert("Project berhasil dihapus.");
  await loadProjects();
}

// Tombol tambah dan batal
document.getElementById("addProjectButton").addEventListener("click", () => {
  resetForm();
  openForm();
});

document.getElementById("cancelButton").addEventListener("click", closeForm);

// Logout
document.getElementById("logoutButton").addEventListener("click", async () => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    alert("Logout gagal: " + error.message);
    return;
  }

  window.location.replace("./login.html");
});

// Jalankan halaman
async function init() {
  const authorized = await checkAdmin();

  if (!authorized) return;

  await loadProjects();
}

init();
