
import { supabase } from "./supabase.js";

const form = document.getElementById("certificateForm");
const formPanel = document.getElementById("formPanel");
const certificateList = document.getElementById("certificateList");
const listMessage = document.getElementById("listMessage");
const formMessage = document.getElementById("formMessage");
const saveButton = document.getElementById("saveButton");

let editingId = null;

function value(id) {
    return document.getElementById(id).value.trim();
}

// Verifikasi akun admin
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

function resetForm() {
    form.reset();
    editingId = null;

    document.getElementById("sortOrder").value = 0;
    document.getElementById("isPublished").checked = true;
    document.getElementById("formTitle").textContent = "Tambah Sertifikat";
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

// Upload gambar sertifikat
async function uploadCertificateImage(file) {
    if (!file) return null;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
        throw new Error("Format gambar harus JPG, PNG, atau WebP.");
    }

    if (file.size > 5 * 1024 * 1024) {
        throw new Error("Ukuran gambar maksimal 5 MB.");
    }

    const extension = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp"
    }[file.type];

    const filePath = `certifications/${crypto.randomUUID()}.${extension}`;

    const { error } = await supabase.storage
        .from("portfolio-media")
        .upload(filePath, file, {
            contentType: file.type,
            upsert: false
        });

    if (error) throw error;

    const { data } = supabase.storage
        .from("portfolio-media")
        .getPublicUrl(filePath);

    return data.publicUrl;
}

// Ambil daftar sertifikat
async function loadCertificates() {
    listMessage.textContent = "Memuat data...";
    certificateList.replaceChildren();

    const { data, error } = await supabase
        .from("certifications")
        .select(`
            id,
            title,
            issuer,
            certificate_date,
            expiration_date,
            image_url,
            certificate_url,
            is_published,
            sort_order
        `)
        .order("sort_order", { ascending: true });

    if (error) {
        console.error(error);
        listMessage.textContent = "Gagal mengambil sertifikat: " + error.message;
        return;
    }

    if (!data || data.length === 0) {
        listMessage.textContent = "Belum ada sertifikat.";
        return;
    }

    listMessage.textContent = "";

    data.forEach((certificate) => {
        const item = document.createElement("article");
        item.className = "certificate-item";

        const image = document.createElement("img");
        image.alt = certificate.title;
        image.src = certificate.image_url ||
            "https://placehold.co/300x200?text=Certificate";

        const info = document.createElement("div");
        info.className = "certificate-info";

        const title = document.createElement("h3");
        title.textContent = certificate.title;

        const issuer = document.createElement("p");
        issuer.textContent = certificate.issuer || "Penerbit tidak dicantumkan";

        const date = document.createElement("p");
        date.textContent = certificate.certificate_date
            ? `Diterbitkan: ${certificate.certificate_date}`
            : "Tanggal belum dicantumkan";

        const status = document.createElement("span");
        status.className = certificate.is_published
            ? "status published"
            : "status";
        status.textContent = certificate.is_published
            ? "Published"
            : "Draft";

        info.append(title, issuer, date, status);

        const actions = document.createElement("div");
        actions.className = "item-actions";

        const editButton = document.createElement("button");
        editButton.className = "edit";
        editButton.textContent = "Edit";
        editButton.addEventListener("click", () => editCertificate(certificate));

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete";
        deleteButton.textContent = "Hapus";
        deleteButton.addEventListener("click", () => deleteCertificate(certificate));

        actions.append(editButton, deleteButton);
        item.append(image, info, actions);
        certificateList.appendChild(item);
    });
}

// Isi form ketika mengedit
function editCertificate(certificate) {
    editingId = certificate.id;

    document.getElementById("title").value = certificate.title || "";
    document.getElementById("issuer").value = certificate.issuer || "";
    document.getElementById("certificateDate").value =
        certificate.certificate_date || "";
    document.getElementById("expirationDate").value =
        certificate.expiration_date || "";
    document.getElementById("certificateUrl").value =
        certificate.certificate_url || "";
    document.getElementById("sortOrder").value =
        certificate.sort_order ?? 0;
    document.getElementById("isPublished").checked =
        certificate.is_published;

    document.getElementById("formTitle").textContent = "Edit Sertifikat";
    saveButton.textContent = "Update Sertifikat";
    formMessage.textContent =
        "Kosongkan pilihan gambar jika tidak ingin mengganti gambar.";

    openForm();
}

// Simpan sertifikat baru atau perubahan
form.addEventListener("submit", async (event) => {
    event.preventDefault();

    saveButton.disabled = true;
    saveButton.textContent = "Menyimpan...";
    formMessage.textContent = "";

    try {
        const title = value("title");
        const certificateDate = value("certificateDate");
        const expirationDate = value("expirationDate");

        if (!title) {
            throw new Error("Nama sertifikat wajib diisi.");
        }

        if (
            certificateDate &&
            expirationDate &&
            expirationDate < certificateDate
        ) {
            throw new Error(
                "Tanggal kedaluwarsa tidak boleh sebelum tanggal diterbitkan."
            );
        }

        const file = document.getElementById("certificateImage").files[0];
        let imageUrl = null;

        if (file) {
            imageUrl = await uploadCertificateImage(file);
        }

        const payload = {
            title,
            issuer: value("issuer") || null,
            certificate_date: certificateDate || null,
            expiration_date: expirationDate || null,
            certificate_url: value("certificateUrl") || null,
            is_published: document.getElementById("isPublished").checked,
            sort_order: Number(value("sortOrder")) || 0
        };

        if (imageUrl) {
            payload.image_url = imageUrl;
        }

        const result = editingId
            ? await supabase
                .from("certifications")
                .update(payload)
                .eq("id", editingId)
            : await supabase
                .from("certifications")
                .insert(payload);

        if (result.error) throw result.error;

        alert(editingId
            ? "Sertifikat berhasil diperbarui."
            : "Sertifikat berhasil ditambahkan."
        );

        closeForm();
        await loadCertificates();

    } catch (error) {
        console.error("Certificate save error:", error);
        formMessage.textContent =
            error.message || "Gagal menyimpan sertifikat.";
    } finally {
        saveButton.disabled = false;
        saveButton.textContent = editingId
            ? "Update Sertifikat"
            : "Simpan";
    }
});

// Hapus sertifikat
async function deleteCertificate(certificate) {
    const confirmed = confirm(
        `Yakin ingin menghapus sertifikat "${certificate.title}"?`
    );

    if (!confirmed) return;

    const { error } = await supabase
        .from("certifications")
        .delete()
        .eq("id", certificate.id);

    if (error) {
        alert("Gagal menghapus sertifikat: " + error.message);
        return;
    }

    alert("Sertifikat berhasil dihapus.");
    await loadCertificates();
}

// Tombol tambah dan batal
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

// Inisialisasi halaman
async function init() {
    const authorized = await checkAdmin();

    if (!authorized) return;

    await loadCertificates();
}

init();
