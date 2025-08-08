import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://uigdyqsypetoziciuhef.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpZ2R5cXN5cGV0b3ppY2l1aGVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg1NzkzNjQsImV4cCI6MjA1NDE1NTM2NH0.ctFsP3ITmiPKJz9RHEkwxdHSKV-E1urbMqcXYui9Gt8";
const supabase = createClient(supabaseUrl, supabaseKey);

// Global variables
let chatChannel = null;
let addMessageToChat;

// Function to decode JWT token and get user ID
function getUserIdFromToken() {
  try {
    const token = sessionStorage.getItem("authToken");
    if (!token) return null;

    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));

    return decoded.id;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
}

// Function to get current user role from token
function getUserRoleFromToken() {
  try {
    const token = sessionStorage.getItem("authToken");
    if (!token) return null;

    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));

    return decoded.role;
  } catch (error) {
    console.error("Error getting role from token:", error);
    return null;
  }
}

// Main popup chat initialization
window.initPopupChat = async function () {
  // Get user ID dan role dari token
  const tokenUserId = getUserIdFromToken();
  const tokenRole = getUserRoleFromToken();

  if (!tokenUserId || !tokenRole) {
    alert("Tidak dapat mengambil data user dari token. Silakan login ulang.");
    return;
  }

  // Store current user ID dan role
  localStorage.setItem("current_user_id", tokenUserId);
  localStorage.setItem("current_user_role", tokenRole);

  // Set nama psikolog/pasien
  const activeRole = localStorage.getItem("active_role");
  let nama = "Nama";
  if (activeRole === "psikolog") {
    nama = localStorage.getItem("active_patient_name") || "Pasien";
  } else {
    nama = localStorage.getItem("active_psychologist_name") || "Psikolog";
  }
  const namaPsikolog = document.getElementById("namaPsikolog");
  if (namaPsikolog) namaPsikolog.textContent = nama;

  // Fungsi untuk menutup chat popup
  window.closeChat = function () {
    if (chatChannel) {
      chatChannel.unsubscribe();
      chatChannel = null;
    }

    const chatPopup = document.getElementById("chatPopupCustom");
    if (chatPopup) {
      chatPopup.classList.add("d-none");
      chatPopup.classList.remove("d-flex");
    }
    const chatOverlay = document.getElementById("chatOverlay");
    if (chatOverlay) {
      chatOverlay.classList.add("d-none");
      chatOverlay.classList.remove("d-block");
    }
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

  // Fungsi untuk menambahkan pesan ke chat
  addMessageToChat = function (
    content,
    isFromCurrentUser,
    type = "text",
    fileUrl = null,
    fileName = null,
    senderId = null,
    prevSenderId = null
  ) {
    const chatBody = document.getElementById("chatBody");
    if (!chatBody) {
      console.error("Chat body not found");
      return null;
    }

    const messageContainer = document.createElement("div");
    messageContainer.className = `message-container ${
      isFromCurrentUser ? "right" : "left"
    }`;

    // Tambahkan class same-sender atau diff-sender
    if (prevSenderId !== null && senderId !== null) {
      if (prevSenderId === senderId) {
        messageContainer.classList.add("same-sender");
      } else {
        messageContainer.classList.add("diff-sender");
      }
    }

    const msgDiv = document.createElement("div");
    msgDiv.className = `chat-bubble ${isFromCurrentUser ? "right" : "left"}`;

    msgDiv.textContent = content;

    messageContainer.appendChild(msgDiv);
    chatBody.appendChild(messageContainer);
    chatBody.scrollTop = chatBody.scrollHeight;

    return messageContainer;
  };

  // Fungsi untuk mengirim pesan text
  window.sendMessage = async function () {
    const input = document.getElementById("chatInput");
    const message = input.value.trim();
    if (!message) return;

    const conversationId = localStorage.getItem("active_conversation_id");
    if (!conversationId) {
      alert("conversation_id tidak ditemukan di localStorage!");
      return;
    }

    const senderRole = localStorage.getItem("current_user_role");
    const senderId = parseInt(localStorage.getItem("current_user_id"), 10);
    const id = generateId();

    // Clear input immediately
    input.value = "";

    // Tambahkan pesan ke chat body langsung (optimistic update)
    addMessageToChat(message, true, "text");

    // Kirim ke database
    try {
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
        console.error("Error sending message:", error);

        const errorMsg = error.message?.toLowerCase() || "";
        if (
          error.code === "42501" ||
          errorMsg.includes("violates row-level security") ||
          errorMsg.includes("not allowed")
        ) {
          alert(
            "Sesi Anda telah berakhir sehingga pesan tidak dapat dikirim.\nSilakan mulai sesi baru atau hubungi admin jika Anda merasa ini adalah kesalahan."
          );
        } else {
          alert(
            "Maaf, terjadi kendala saat mengirim pesan. Silakan coba kembali nanti."
          );
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);

      const msg = error.message?.toLowerCase() || "";
      if (
        msg.includes("violates row-level security") ||
        msg.includes("not allowed")
      ) {
        alert(
          "Sesi Anda telah berakhir sehingga pesan tidak dapat dikirim.\nSilakan mulai sesi baru atau hubungi admin jika Anda merasa ini adalah kesalahan."
        );
      } else {
        alert(
          "Maaf, terjadi kendala saat mengirim pesan. Silakan coba kembali nanti."
        );
      }
    }
  };

  // Event listeners
  const chatInput = document.getElementById("chatInput");
  if (chatInput) {
    chatInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        window.sendMessage();
      }
    });
  }

  const sendBtn = document.getElementById("sendBtn");
  if (sendBtn) {
    sendBtn.addEventListener("click", function (e) {
      e.preventDefault();
      window.sendMessage();
    });
  }

  const closeBtn = document.querySelector(".btn-close-popup");
  if (closeBtn) {
    closeBtn.addEventListener("click", window.closeChat);
  }

  // Load chat
  const conversationId = localStorage.getItem("active_conversation_id");
  if (!conversationId || conversationId === "undefined") {
    alert("conversation_id tidak ditemukan di localStorage!");
    return;
  }

  // Load messages first, then subscribe
  await loadMessages(conversationId);
  subscribeToMessages(conversationId);

  // Show the chat popup using Bootstrap classes
  const chatPopup = document.getElementById("chatPopupCustom");
  const chatOverlay = document.getElementById("chatOverlay");
  if (chatPopup && chatOverlay) {
    chatOverlay.classList.remove("d-none");
    chatOverlay.classList.add("d-block");
    chatPopup.classList.remove("d-none");
    chatPopup.classList.add("d-flex");
  }
};

// Load messages from database
async function loadMessages(conversationId) {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("sent_at", { ascending: true });

  if (error) {
    console.error("Error loading messages:", error);
    return;
  }

  if (data) {
    const chatBody = document.getElementById("chatBody");
    if (chatBody) {
      chatBody.innerHTML = "";
    }

    const currentUserId = parseInt(localStorage.getItem("current_user_id"), 10);

    let prevSenderId = null;
    data.forEach((msg, index) => {
      const isFromCurrentUser = Number(msg.sender_id) === currentUserId;

      addMessageToChat(
        msg.content,
        isFromCurrentUser,
        msg.type,
        null,
        null,
        msg.sender_id,
        prevSenderId
      );
      prevSenderId = msg.sender_id;
    });
  }
}

// Subscribe to real-time messages
function subscribeToMessages(conversationId) {
  // Unsubscribe jika sudah ada channel sebelumnya
  if (chatChannel) {
    chatChannel.unsubscribe();
  }

  // Buat channel baru
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
        if (!payload || !payload.new) {
          console.warn(
            "%c📴 Sesi ini telah berakhir. Anda tidak dapat menerima pesan baru.",
            "color: #d97706; font-weight: bold;"
          );
          console.info(
            "%cSilakan mulai sesi baru jika ingin melanjutkan percakapan.",
            "color: #6b7280;"
          );
          return;
        }

        const msg = payload.new;
        const currentUserId = Number(localStorage.getItem("current_user_id"));
        const isFromCurrentUser = Number(msg.sender_id) === currentUserId;

        // Cari senderId sebelumnya dari chatBody
        let prevSenderId = null;
        const chatBody = document.getElementById("chatBody");
        if (chatBody && chatBody.lastChild) {
          prevSenderId = chatBody.lastChild.getAttribute("data-sender-id");
        }

        if (!isFromCurrentUser) {
          const msgDiv = addMessageToChat(
            msg.content,
            isFromCurrentUser,
            msg.type,
            null,
            null,
            msg.sender_id,
            prevSenderId
          );
          if (msgDiv) msgDiv.setAttribute("data-sender-id", msg.sender_id);
        }
      }
    )
    .subscribe((status, err) => {
      if (err) {
        console.error("Error subscribing to messages:", err);
        return;
      }
    });
}
