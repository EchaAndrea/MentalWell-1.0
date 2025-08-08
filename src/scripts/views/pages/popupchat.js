import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://uigdyqsypetoziciuhef.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpZ2R5cXN5cGV0b3ppY2l1aGVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg1NzkzNjQsImV4cCI6MjA1NDE1NTM2NH0.ctFsP3ITmiPKJz9RHEkwxdHSKV-E1urbMqcXYui9Gt8";
const supabase = createClient(supabaseUrl, supabaseKey);

// Global variables
let chatChannel = null;

// Helper functions
function getUserData() {
  const token = sessionStorage.getItem("authToken");
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return { id: payload.id, role: payload.role };
  } catch {
    return null;
  }
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function showError(message) {
  alert(message);
}

// Main chat functions
window.initPopupChat = async function () {
  const userData = getUserData();
  if (!userData) {
    showError("Tidak dapat mengambil data user. Silakan login ulang.");
    return;
  }

  localStorage.setItem("current_user_id", userData.id);
  localStorage.setItem("current_user_role", userData.role);

  // Set nama di header
  const activeRole = localStorage.getItem("active_role");
  const nama =
    activeRole === "psikolog"
      ? localStorage.getItem("active_patient_name") || "Pasien"
      : localStorage.getItem("active_psychologist_name") || "Psikolog";

  const namaPsikolog = document.getElementById("namaPsikolog");
  if (namaPsikolog) namaPsikolog.textContent = nama;

  // Setup event listeners
  setupEventListeners();

  // Load dan subscribe
  const conversationId = localStorage.getItem("active_conversation_id");
  if (!conversationId) {
    showError("conversation_id tidak ditemukan!");
    return;
  }

  await loadMessages(conversationId);
  subscribeToMessages(conversationId);
  showChatPopup();
};

function setupEventListeners() {
  // Close chat
  window.closeChat = () => {
    if (chatChannel) chatChannel.unsubscribe();
    document.getElementById("chatPopupCustom")?.classList.add("d-none");
    document.getElementById("chatOverlay")?.classList.add("d-none");
  };

  // Send message
  window.sendMessage = async () => {
    const input = document.getElementById("chatInput");
    const message = input.value.trim();
    if (!message) return;

    const conversationId = localStorage.getItem("active_conversation_id");
    const senderId = parseInt(localStorage.getItem("current_user_id"));
    const senderRole = localStorage.getItem("current_user_role");
    const id = generateId();

    input.value = "";
    addMessageToChat(message, true, id);

    try {
      const { error } = await supabase.from("messages").insert([
        {
          id,
          conversation_id: conversationId,
          sender_id: senderId,
          sender_role: senderRole,
          content: message,
          type: "text",
          sent_at: new Date().toISOString(),
          is_read: false,
        },
      ]);

      if (error) {
        document.querySelector(`[data-message-id="${id}"]`)?.remove();
        showError("Gagal mengirim pesan. Coba lagi.");
      }
    } catch (error) {
      document.querySelector(`[data-message-id="${id}"]`)?.remove();
      showError("Terjadi kesalahan. Coba lagi.");
    }
  };

  // Event bindings
  document.getElementById("chatInput")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      window.sendMessage();
    }
  });

  document
    .getElementById("sendBtn")
    ?.addEventListener("click", window.sendMessage);
  document
    .querySelector(".btn-close-popup")
    ?.addEventListener("click", window.closeChat);
}

function addMessageToChat(content, isFromCurrentUser, messageId = null) {
  const chatBody = document.getElementById("chatBody");
  if (!chatBody) return;

  // Cek duplikasi
  if (messageId && chatBody.querySelector(`[data-message-id="${messageId}"]`)) {
    return;
  }

  const messageDiv = document.createElement("div");
  messageDiv.className = `message-container ${
    isFromCurrentUser ? "right" : "left"
  }`;
  if (messageId) messageDiv.setAttribute("data-message-id", messageId);

  const bubble = document.createElement("div");
  bubble.className = `chat-bubble ${isFromCurrentUser ? "right" : "left"}`;
  bubble.textContent = content;

  messageDiv.appendChild(bubble);
  chatBody.appendChild(messageDiv);
  chatBody.scrollTop = chatBody.scrollHeight;
}

async function loadMessages(conversationId) {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("sent_at", { ascending: true });

  if (error || !data) return;

  const chatBody = document.getElementById("chatBody");
  if (chatBody) chatBody.innerHTML = "";

  const currentUserId = parseInt(localStorage.getItem("current_user_id"));
  data.forEach((msg) => {
    const isFromCurrentUser = Number(msg.sender_id) === currentUserId;
    addMessageToChat(msg.content, isFromCurrentUser, msg.id);
  });
}

function subscribeToMessages(conversationId) {
  if (chatChannel) chatChannel.unsubscribe();

  chatChannel = supabase
    .channel(`messages-${conversationId}-${Date.now()}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        if (!payload?.new) return;

        const msg = payload.new;
        const currentUserId = parseInt(localStorage.getItem("current_user_id"));
        const isFromCurrentUser = Number(msg.sender_id) === currentUserId;

        if (!isFromCurrentUser) {
          addMessageToChat(msg.content, false, msg.id);
        }
      }
    )
    .subscribe();
}

function showChatPopup() {
  const chatPopup = document.getElementById("chatPopupCustom");
  const chatOverlay = document.getElementById("chatOverlay");

  if (chatPopup && chatOverlay) {
    chatOverlay.classList.remove("d-none");
    chatPopup.classList.remove("d-none");
    chatPopup.classList.add("d-flex");
  }
}
