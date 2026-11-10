import { supabase } from "./supabase.js";

function makeElement(tag, className = "", text = "") {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== null && text !== undefined) element.textContent = String(text);
  return element;
}

function formatMonthYear(value) {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(date).toUpperCase();
}

function safeHttpUrl(value) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

function showMessage(container, message) {
  if (!container) return;
  const p = makeElement("p", "project-message", message);
  container.replaceChildren(p);
}

export { supabase, makeElement, formatMonthYear, safeHttpUrl, showMessage };
