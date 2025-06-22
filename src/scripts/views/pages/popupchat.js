import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://uigdyqsypetoziciuhef.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpZ2R5cXN5cGV0b3ppY2l1aGVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg1NzkzNjQsImV4cCI6MjA1NDE1NTM2NH0.ctFsP3ITmiPKJz9RHEkwxdHSKV-E1urbMqcXYui9Gt8";
const supabase = createClient(supabaseUrl, supabaseKey);

// deklarasi window.initPopupChat
window.initPopupChat = function () {
  // Set nama psikolog/pasien
  const role = localStorage.getItem("active_role");
  let nama = "Nama";
  if (role === "psikolog") {
    nama = localStorage.getItem("active_patient_name") || "Pasien";
  } else {
    nama = localStorage.getItem("active_psychologist_name") || "Psikolog";
  }
  const namaPsikolog = document.getElementById("namaPsikolog");
  if (namaPsikolog) namaPsikolog.textContent = nama;

  // Fungsi untuk menutup chat popup
  window.closeChat = function () {
    const chatPopup = document.getElementById("chatPopupCustom");
    if (chatPopup) chatPopup.style.display = "none";
    const chatOverlay = document.getElementById("chatOverlay");
    if (chatOverlay) chatOverlay.style.display = "none";
    const popupContainer = document.getElementById("popup-container");
    if (popupContainer) {
      popupContainer.innerHTML = "";
      popupContainer.style.display = "none";
    }
  };

  // Fungsi untuk generate ID unik
  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }

  // Fungsi untuk mengirim pesan
  window.sendMessage = async function () {
    const input = document.getElementById("chatInput");
    const message = input.value.trim();
    if (!message) return;
    const conversationId = localStorage.getItem("active_conversation_id");
    if (!conversationId) {
      alert("conversation_id tidak ditemukan di localStorage!");
      return;
    }
    const senderRole = localStorage.getItem("active_role");
    const senderId = parseInt(localStorage.getItem("active_user_id"), 10);
    const id = generateId();

    // Hanya kirim field yang ADA di tabel messages
    const { error } = await supabase.from("messages").insert([
      {
        id: id,
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
      alert("Gagal mengirim pesan: " + error.message);
      console.error(error);
    }
    input.value = "";
  };

  // Enter untuk kirim pesan
  const chatInput = document.getElementById("chatInput");
  if (chatInput) {
    chatInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        window.sendMessage();
      }
    });
  }

  // Optional: Preview nama file yang diupload
  const fileUpload = document.getElementById("fileUpload");
  if (fileUpload) {
    fileUpload.addEventListener("change", function (e) {
      const file = e.target.files[0];
      if (file) {
        const chatBody = document.getElementById("chatBody");
        const fileDiv = document.createElement("div");
        fileDiv.className = "alert alert-secondary p-2 mb-1 align-self-end";
        fileDiv.textContent = `File: ${file.name}`;
        chatBody.appendChild(fileDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
      }
    });
  }

  const sendBtn = document.getElementById("sendBtn");
  if (sendBtn) {
    sendBtn.addEventListener("click", window.sendMessage);
  }

  const closeBtn = document.querySelector(".btn-close-popup");
  if (closeBtn) {
    closeBtn.addEventListener("click", window.closeChat);
  }

  // Pastikan conversationId valid sebelum load chat
  const conversationId = localStorage.getItem("active_conversation_id");
  console.log("conversationId:", conversationId); // Debug
  if (!conversationId || conversationId === "undefined") {
    alert("conversation_id tidak ditemukan di localStorage!");
    return;
  }
  loadMessages(conversationId);
  subscribeToMessages(conversationId);
};

async function loadMessages(conversationId) {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("sent_at", { ascending: true });
  if (data) {
    const chatBody = document.getElementById("chatBody");
    chatBody.innerHTML = "";
    data.forEach((msg) => {
      const msgDiv = document.createElement("div");
      msgDiv.className =
        msg.sender_role === "pasien"
          ? "alert alert-primary p-2 mb-1 align-self-end"
          : "alert alert-secondary p-2 mb-1 align-self-start";
      msgDiv.textContent = msg.content;
      chatBody.appendChild(msgDiv);
    });
    chatBody.scrollTop = chatBody.scrollHeight;
  }
}

let chatChannel = null;

function subscribeToMessages(conversationId) {
  if (chatChannel) {
    chatChannel.unsubscribe();
  }
  chatChannel = supabase
    .channel("messages")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        const msg = payload.new;
        const chatBody = document.getElementById("chatBody");
        const msgDiv = document.createElement("div");
        msgDiv.className =
          msg.sender_role === "pasien"
            ? "alert alert-primary p-2 mb-1 align-self-end"
            : "alert alert-secondary p-2 mb-1 align-self-start";
        msgDiv.textContent = msg.content;
        chatBody.appendChild(msgDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
      }
    )
    .subscribe();
}
