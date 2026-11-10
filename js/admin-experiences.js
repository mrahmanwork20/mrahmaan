
import { supabase } from "./supabase.js";

const form = document.getElementById("experienceForm");
const formPanel = document.getElementById("formPanel");
const experienceList = document.getElementById("experienceList");
const listMessage = document.getElementById("listMessage");
const formMessage = document.getElementById("formMessage");
const saveButton = document.getElementById("saveButton");

let editingId = null;

async function checkAdmin() {
    const { data: { user }, error } = await supabase.auth.getUser();

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

function value(id) {
    return document.getElementById(id).value.trim();
}

function resetForm() {
    form.reset();
    editingId = null;

    document.getElementById("isPublished").checked = true;
    document.getElementById("sortOrder").value = 0;
    document.getElementById("formTitle").textContent = "Tambah Experience";
    saveButton.textContent = "Simpan";
    formMessage.textContent = "";
}

function openForm() {
    formPanel.hidden = false;
    formPanel.scrollIntoView({ behavior: "smooth" });
}

function closeForm() {
    formPanel.hidden = true;
    resetForm();
}

document.getElementById("isCurrent").addEventListener("change", (event) => {
    const endDate = document.getElementById("endDate");
    endDate.disabled = event.target.checked;

    if (event.target.checked) endDate.value = "";
});

// Ambil data experiences
async function loadExperiences() {
    listMessage.textContent = "Memuat data...";
    experienceList.replaceChildren();

    const { data, error } = await supabase
        .from("experiences")
        .select(`
            id,
            title,
            company,
            employment_type,
            location,
            description,
            start_date,
            end_date,
            is_current,
            is_published,
            sort_order
        `)
        .order("sort_order", { ascending: true });

    if (error) {
        console.error(error);
        listMessage.textContent = "Gagal mengambil data experiences: " + error.message;
        return;
    }

    if (!data || data.length === 0) {
        listMessage.textContent = "Belum ada pengalaman kerja.";
        return;
    }

    listMessage.textContent = "";

    data.forEach((experience) => {
        const item = document.createElement("article");
        item.className = "experience-item";

        const info = document.createElement("div");

        const title = document.createElement("h3");
        title.textContent = experience.title;

        const company = document.createElement("p");
        company.textContent =
            `${experience.company} · ${experience.employment_type || "Experience"}`;

        const period = document.createElement("p");
        period.textContent =
            `${experience.start_date || "-"} — ${
                experience.is_current
                    ? "Sekarang"
                    : experience.end_date || "-"
            }`;

        const status = document.createElement("span");
        status.className = experience.is_published
            ? "status published"
            : "status";
        status.textContent = experience.is_published
            ? "Published"
            : "Draft";

        info.append(title, company, period, status);

        const actions = document.createElement("div");
        actions.className = "item-actions";

        const editButton = document.createElement("button");
        editButton.className = "edit";
        editButton.textContent = "Edit";
        editButton.addEventListener("click", () => editExperience(experience));

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete";
        deleteButton.textContent = "Hapus";
        deleteButton.addEventListener("click", () => deleteExperience(experience));

        actions.append(editButton, deleteButton);
        item.append(info, actions);
        experienceList.appendChild(item);
    });
}

// Edit experience
function editExperience(experience) {
    editingId = experience.id;

    document.getElementById("title").value = experience.title || "";
    document.getElementById("company").value = experience.company || "";
    document.getElementById("employmentType").value =
        experience.employment_type || "Full-time";
    document.getElementById("location").value = experience.location || "";
    document.getElementById("description").value = experience.description || "";
    document.getElementById("startDate").value = experience.start_date || "";
    document.getElementById("endDate").value = experience.end_date || "";
    document.getElementById("isCurrent").checked = experience.is_current;
    document.getElementById("isPublished").checked = experience.is_published;
    document.getElementById("sortOrder").value = experience.sort_order ?? 0;

    document.getElementById("endDate").disabled = experience.is_current;
    document.getElementById("formTitle").textContent = "Edit Experience";
    saveButton.textContent = "Update Experience";

    openForm();
}

// Tambah atau update experience
form.addEventListener("submit", async (event) => {
    event.preventDefault();

    saveButton.disabled = true;
    saveButton.textContent = "Menyimpan...";

    try {
        const isCurrent = document.getElementById("isCurrent").checked;
        const startDate = value("startDate");
        const endDate = value("endDate");

        if (startDate && endDate && endDate < startDate && !isCurrent) {
            throw new Error("Tanggal selesai tidak boleh sebelum tanggal mulai.");
        }

        const payload = {
            title: value("title"),
            company: value("company"),
            employment_type: value("employmentType") || null,
            location: value("location") || null,
            description: value("description") || null,
            start_date: startDate || null,
            end_date: isCurrent ? null : (endDate || null),
            is_current: isCurrent,
            is_published: document.getElementById("isPublished").checked,
            sort_order: Number(value("sortOrder")) || 0
        };

        if (!payload.title || !payload.company) {
            throw new Error("Posisi dan perusahaan wajib diisi.");
        }

        const result = editingId
            ? await supabase
                .from("experiences")
                .update(payload)
                .eq("id", editingId)
            : await supabase
                .from("experiences")
                .insert(payload);

        if (result.error) throw result.error;

        alert(editingId
            ? "Experience berhasil diperbarui."
            : "Experience berhasil ditambahkan."
        );

        closeForm();
        await loadExperiences();

    } catch (error) {
        console.error("Experience save error:", error);
        formMessage.textContent = error.message || "Gagal menyimpan data.";
    } finally {
        saveButton.disabled = false;
        saveButton.textContent = editingId
            ? "Update Experience"
            : "Simpan";
    }
});

// Hapus experience
async function deleteExperience(experience) {
    const confirmed = confirm(
        `Yakin ingin menghapus pengalaman "${experience.title}"?`
    );

    if (!confirmed) return;

    const { error } = await supabase
        .from("experiences")
        .delete()
        .eq("id", experience.id);

    if (error) {
        alert("Gagal menghapus: " + error.message);
        return;
    }

    alert("Experience berhasil dihapus.");
    await loadExperiences();
}

// Tombol form
document.getElementById("addButton").addEventListener("click", () => {
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

// Inisialisasi
async function init() {
    const authorized = await checkAdmin();
    if (!authorized) return;

    await loadExperiences();
}

init();
