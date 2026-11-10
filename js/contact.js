
import { supabase } from "./supabase.js";

const contactForm = document.getElementById("contactForm");
const contactStatus = document.getElementById("contactStatus");
const contactSubmit = document.getElementById("contactSubmit");

if (contactForm) {
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("contactName").value.trim();
    const email = document.getElementById("contactEmail").value.trim();
    const subject = document.getElementById("contactSubject").value.trim();
    const message = document.getElementById("contactMessage").value.trim();
    const honeypot = document.getElementById("website").value;

    // Abaikan pengiriman yang terdeteksi sebagai bot.
    if (honeypot) return;

    if (!name || !email || !subject || !message) {
      showStatus("Semua kolom wajib diisi.", false);
      return;
    }

    if (message.length < 10) {
      showStatus("Pesan minimal harus 10 karakter.", false);
      return;
    }

    contactSubmit.disabled = true;
    contactSubmit.textContent = "Mengirim...";
    contactStatus.textContent = "";

    try {
      const { error } = await supabase
        .from("messages")
        .insert({
          name,
          email,
          subject,
          message
        });

      if (error) throw error;

      showStatus(
        "Pesan berhasil dikirim. Terima kasih telah menghubungi saya!",
        true
      );

      contactForm.reset();

    } catch (error) {
      console.error("Contact form error:", error);
      showStatus(
        "Pesan belum berhasil dikirim. Silakan coba kembali.",
        false
      );
    } finally {
      contactSubmit.disabled = false;
      contactSubmit.textContent = "Kirim Pesan";
    }
  });
}

function showStatus(message, success) {
  contactStatus.textContent = message;
  contactStatus.className = success
    ? "text-sm text-green-600 mt-3"
    : "text-sm text-red-600 mt-3";
}
