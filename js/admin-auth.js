
import { supabase } from "./supabase.js";

const loginForm = document.getElementById("loginForm");
const loginButton = document.getElementById("loginButton");
const message = document.getElementById("message");

function showMessage(text, type = "error") {
    message.textContent = text;
    message.className = type;
}

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    loginButton.disabled = true;
    loginButton.textContent = "MEMPROSES...";
    message.className = "";
    message.textContent = "";

    try {
        // Login menggunakan Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        // Periksa role pengguna dari tabel profiles
        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("full_name, role")
            .eq("id", data.user.id)
            .single();

        if (profileError || profile?.role !== "admin") {
            await supabase.auth.signOut();
            throw new Error("Akun ini tidak memiliki akses administrator.");
        }

        showMessage("Login berhasil. Mengalihkan ke dashboard...", "success");

        window.location.href = "./index.html";

    } catch (error) {
        showMessage(error.message || "Login gagal. Silakan coba lagi.");

        loginButton.disabled = false;
        loginButton.textContent = "MASUK KE DASHBOARD";
    }
});
