
import { supabase } from "./supabase.js";

const welcomeName = document.getElementById("welcomeName");
const dashboardMessage = document.getElementById("dashboardMessage");
const logoutButton = document.getElementById("logoutButton");

// Periksa sesi dan role admin
async function checkAdmin() {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        window.location.replace("./login.html");
        return null;
    }

    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", user.id)
        .single();

    if (profileError || profile?.role !== "admin") {
        await supabase.auth.signOut();
        window.location.replace("./login.html");
        return null;
    }

    welcomeName.textContent = `Welcome, ${profile.full_name || "Admin"}!`;

    return user;
}

// Ambil jumlah data dari database
async function getCount(table) {
    const { count, error } = await supabase
        .from(table)
        .select("*", { count: "exact", head: true });

    if (error) throw error;

    return count ?? 0;
}

async function loadDashboard() {
    try {
        const user = await checkAdmin();

        if (!user) return;

        const [
            projects,
            experiences,
            certifications,
            messages
        ] = await Promise.all([
            getCount("projects"),
            getCount("experiences"),
            getCount("certifications"),
            getCount("messages")
        ]);

        document.getElementById("totalProjects").textContent = projects;
        document.getElementById("totalExperiences").textContent = experiences;
        document.getElementById("totalCertifications").textContent = certifications;
        document.getElementById("totalMessages").textContent = messages;

        dashboardMessage.textContent = "Data dashboard berhasil dimuat.";

    } catch (error) {
        console.error("Dashboard error:", error);

        dashboardMessage.textContent =
            "Gagal memuat data. Periksa koneksi dan izin database.";
    }
}

// Logout
logoutButton.addEventListener("click", async () => {
    logoutButton.disabled = true;

    const { error } = await supabase.auth.signOut();

    if (error) {
        console.error("Logout error:", error);
        logoutButton.disabled = false;
        alert("Logout gagal. Silakan coba lagi.");
        return;
    }

    window.location.replace("./login.html");
});

loadDashboard();
