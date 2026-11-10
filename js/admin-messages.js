
import { supabase } from "./supabase.js";

const messageList = document.getElementById("messageList");
const alertBox = document.getElementById("alert");
const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const modal = document.getElementById("messageModal");

let messages = [];
let selectedMessage = null;

function showAlert(message, type = "success") {
  alertBox.textContent = message;
  alertBox.className = `mb-5 p-4 rounded-lg text-sm ${
    type === "success"
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800"
  }`;
}

function formatDate(date) {
  return new Date(date).toLocaleString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function statusLabel(status) {
  const labels = {
    unread: "Unread",
    read: "Read",
    replied: "Replied",
    archived: "Archived"
  };

  return labels[status] || status;
}

function statusClass(status) {
  const classes = {
    unread: "bg-red-100 text-red-700",
    read: "bg-blue-100 text-blue-700",
    replied: "bg-green-100 text-green-700",
    archived: "bg-gray-200 text-gray-700"
  };

  return classes[status] || "bg-gray-100 text-gray-700";
}

async function checkAdmin() {
  const { data: { user }, error } = await supabase.auth.getUser();

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

async function loadMessages() {
  messageList.textContent = "Memuat pesan...";

  const { data, error } = await supabase
    .from("messages")
    .select("id, name, email, subject, message, status, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    messageList.textContent = "Gagal mengambil pesan.";
    showAlert(error.message, "error");
    return;
  }

  messages = data || [];
  updateStatistics();
  renderMessages();
}

function updateStatistics() {
  document.getElementById("totalMessages").textContent = messages.length;
  document.getElementById("unreadMessages").textContent =
    messages.filter((item) => item.status === "unread").length;
  document.getElementById("readMessages").textContent =
    messages.filter((item) => item.status === "read").length;
  document.getElementById("repliedMessages").textContent =
    messages.filter((item) => item.status === "replied").length;
}

function renderMessages() {
  const keyword = searchInput.value.trim().toLowerCase();
  const selectedStatus = statusFilter.value;

  const filtered = messages.filter((item) => {
    const matchesKeyword = [
      item.name,
      item.email,
      item.subject,
      item.message
    ].some((value) => (value || "").toLowerCase().includes(keyword));

    const matchesStatus =
      selectedStatus === "all" || item.status === selectedStatus;

    return matchesKeyword && matchesStatus;
  });

  document.getElementById("resultCount").textContent =
    `${filtered.length} pesan`;

  messageList.replaceChildren();

  if (!filtered.length) {
    const empty = document.createElement("p");
    empty.className = "text-gray-500 text-sm";
    empty.textContent = "Tidak ada pesan yang ditemukan.";
    messageList.appendChild(empty);
    return;
  }

  filtered.forEach((item) => {
    const card = document.createElement("article");
    card.className = "border rounded-xl p-5 hover:border-yellow-400 transition";

    const top = document.createElement("div");
    top.className = "flex flex-col md:flex-row md:justify-between gap-3";

    const info = document.createElement("div");

    const name = document.createElement("h4");
    name.className = "font-bold";
    name.textContent = item.name;

    const email = document.createElement("p");
    email.className = "text-gray-500 text-sm mt-1";
    email.textContent = item.email;

    const subject = document.createElement("p");
    subject.className = "font-medium mt-3";
    subject.textContent = item.subject;

    const preview = document.createElement("p");
    preview.className = "text-gray-600 text-sm mt-2";
    preview.textContent = (item.message || "").slice(0, 160) +
      ((item.message || "").length > 160 ? "..." : "");

    const date = document.createElement("p");
    date.className = "text-gray-400 text-xs mt-3";
    date.textContent = formatDate(item.created_at);

    const badge = document.createElement("span");
    badge.className = `${statusClass(item.status)} px-3 py-1 rounded-full text-xs h-fit`;
    badge.textContent = statusLabel(item.status);

    info.append(name, email, subject);
    top.append(info, badge);

    const actions = document.createElement("div");
    actions.className = "flex flex-wrap gap-2 mt-4";

    const detailBtn = makeButton("Lihat Detail", "bg-gray-950 text-white");
    detailBtn.addEventListener("click", () => openMessage(item));

    const deleteBtn = makeButton("Hapus", "bg-red-100 text-red-700");
    deleteBtn.addEventListener("click", () => deleteMessage(item.id));

    actions.append(detailBtn, deleteBtn);
    card.append(top, preview, date, actions);
    messageList.appendChild(card);
  });
}

function makeButton(label, classes) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = label;
  button.className = `${classes} px-4 py-2 rounded-lg text-sm hover:opacity-80`;
  return button;
}

function openMessage(item) {
  selectedMessage = item;

  document.getElementById("detailName").textContent = item.name;
  document.getElementById("detailEmail").textContent = item.email;
  document.getElementById("detailSubject").textContent = item.subject;
  document.getElementById("detailDate").textContent =
    formatDate(item.created_at);
  document.getElementById("detailMessage").textContent = item.message;

  modal.classList.remove("hidden");
  modal.classList.add("flex");

  // Otomatis ubah Unread menjadi Read ketika dibuka.
  if (item.status === "unread") {
    updateStatus(item.id, "read", false);
  }
}

function closeModal() {
  modal.classList.add("hidden");
  modal.classList.remove("flex");
  selectedMessage = null;
}

async function updateStatus(id, status, showNotification = true) {
  const { error } = await supabase
    .from("messages")
    .update({ status })
    .eq("id", id);

  if (error) {
    showAlert(error.message, "error");
    return;
  }

  if (showNotification) {
    showAlert(`Status pesan diubah menjadi ${statusLabel(status)}.`);
  }

  await loadMessages();

  if (selectedMessage?.id === id) {
    selectedMessage = messages.find((item) => item.id === id) || null;
  }
}

async function deleteMessage(id) {
  const confirmed = confirm("Yakin ingin menghapus pesan ini?");
  if (!confirmed) return;

  const { error } = await supabase
    .from("messages")
    .delete()
    .eq("id", id);

  if (error) {
    showAlert(error.message, "error");
    return;
  }

  if (selectedMessage?.id === id) {
    closeModal();
  }

  showAlert("Pesan berhasil dihapus.");
  await loadMessages();
}

document.getElementById("replyBtn").addEventListener("click", async () => {
  if (!selectedMessage) return;

  await updateStatus(selectedMessage.id, "replied");
});

document.getElementById("readBtn").addEventListener("click", async () => {
  if (!selectedMessage) return;

  await updateStatus(selectedMessage.id, "read");
});

document.getElementById("archiveBtn").addEventListener("click", async () => {
  if (!selectedMessage) return;

  await updateStatus(selectedMessage.id, "archived");
});

document.getElementById("closeModal").addEventListener("click", closeModal);

modal.addEventListener("click", (event) => {
  if (event.target === modal) closeModal();
});

searchInput.addEventListener("input", renderMessages);
statusFilter.addEventListener("change", renderMessages);

document.getElementById("refreshBtn").addEventListener("click", loadMessages);

document.getElementById("logoutBtn").addEventListener("click", async () => {
  await supabase.auth.signOut();
  window.location.href = "login.html";
});

const isAdmin = await checkAdmin();

if (isAdmin) {
  await loadMessages();
}
