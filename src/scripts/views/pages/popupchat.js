import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://uigdyqsypetoziciuhef.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpZ2R5cXN5cGV0b3ppY2l1aGVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg1NzkzNjQsImV4cCI6MjA1NDE1NTM2NH0.ctFsP3ITmiPKJz9RHEkwxdHSKV-E1urbMqcXYui9Gt8";
const supabase = createClient(supabaseUrl, supabaseKey);

// Function to decode JWT token and get user ID
function getUserIdFromToken() {
  try {
    const token = sessionStorage.getItem("authToken");
    if (!token) return null;

    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));

    console.log("Decoded token:", decoded);

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

    return decoded.role; // "psychologist" atau "patient"
  } catch (error) {
    console.error("Error getting role from token:", error);
    return null;
  }
}

// deklarasi window.initPopupChat
window.initPopupChat = async function () {
  console.log("Initializing popup chat...");

  // Get user ID dan role dari token
  const tokenUserId = getUserIdFromToken();
  const tokenRole = getUserRoleFromToken();

  console.log("Token User ID:", tokenUserId);
  console.log("Token Role:", tokenRole);

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

  // Fungsi untuk upload file ke Supabase Storage
  async function uploadFile(file) {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `chat-files/${fileName}`;

      const { data, error } = await supabase.storage
        .from("chat-files")
        .upload(filePath, file);

      if (error) {
        console.error("Error uploading file:", error);
        return null;
      }

      // Get public URL
      const { data: publicURL } = supabase.storage
        .from("chat-files")
        .getPublicUrl(filePath);

      return {
        url: publicURL.publicUrl,
        fileName: file.name,
        fileSize: file.size,
      };
    } catch (error) {
      console.error("Upload file error:", error);
      return null;
    }
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

    const senderRole = localStorage.getItem("current_user_role");
    const senderId = parseInt(localStorage.getItem("current_user_id"), 10);
    const id = generateId();

    console.log("Sending message:", {
      conversationId,
      senderRole,
      senderId,
      message,
    });

    // Tambahkan pesan ke chat body langsung (optimistic update)
    addMessageToChat(message, true, "text");

    // Kirim ke database
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
      alert("Gagal mengirim pesan: " + error.message);
    } else {
      console.log("Message sent successfully");
    }

    input.value = "";
  };

  // Fungsi untuk mengirim file
  window.sendFile = async function (file) {
    const conversationId = localStorage.getItem("active_conversation_id");
    if (!conversationId) {
      alert("conversation_id tidak ditemukan di localStorage!");
      return;
    }

    const senderRole = localStorage.getItem("current_user_role");
    const senderId = parseInt(localStorage.getItem("current_user_id"), 10);
    const id = generateId();

    // Show loading
    addMessageToChat("Mengirim file...", true, "file");

    // Upload file
    const uploadResult = await uploadFile(file);
    if (!uploadResult) {
      alert("Gagal upload file");
      return;
    }

    // Kirim file message
    const { error } = await supabase.from("messages").insert([
      {
        id: id,
        conversation_id: conversationId,
        sender_id: senderId,
        sender_role: senderRole,
        content: `File: ${uploadResult.fileName}`,
        type: "file",
        file_url: uploadResult.url,
        file_name: uploadResult.fileName,
        sent_at: new Date().toISOString(),
        is_read: false,
      },
    ]);

    if (error) {
      alert("Gagal mengirim file: " + error.message);
      console.error(error);
    }
  };

  // Fungsi untuk menambahkan pesan ke chat
  function addMessageToChat(
    content,
    isFromCurrentUser,
    type = "text",
    fileUrl = null,
    fileName = null
  ) {
    const chatBody = document.getElementById("chatBody");

    // Buat container untuk pesan
    const messageContainer = document.createElement("div");
    messageContainer.className = `message-container ${
      isFromCurrentUser ? "right" : "left"
    }`;

    // Buat bubble pesan
    const msgDiv = document.createElement("div");
    msgDiv.className = `chat-bubble ${isFromCurrentUser ? "right" : "left"}`;

    // Handle different message types
    if (type === "file" && fileUrl) {
      // File message
      msgDiv.innerHTML = `
        <div class="file-message">
          <strong>${fileName || "File"}</strong><br>
          <a href="${fileUrl}" target="_blank">
            Buka file
          </a>
        </div>
      `;
    } else {
      // Text message
      msgDiv.textContent = content;
    }

    messageContainer.appendChild(msgDiv);
    chatBody.appendChild(messageContainer);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  // Event listeners
  const chatInput = document.getElementById("chatInput");
  if (chatInput) {
    chatInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        window.sendMessage();
      }
    });
  }

  const fileUpload = document.getElementById("fileUpload");
  if (fileUpload) {
    fileUpload.addEventListener("change", function (e) {
      const file = e.target.files[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          alert("File terlalu besar! Maksimal 5MB.");
          return;
        }

        const allowedTypes = [
          "image/jpeg",
          "image/png",
          "image/gif",
          "application/pdf",
          "text/plain",
        ];
        if (!allowedTypes.includes(file.type)) {
          alert(
            "Tipe file tidak diizinkan! Hanya JPG, PNG, GIF, PDF, dan TXT."
          );
          return;
        }

        window.sendFile(file);
        e.target.value = "";
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

  // Load chat
  const conversationId = localStorage.getItem("active_conversation_id");
  console.log("conversationId:", conversationId);
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

  if (error) {
    console.error("Error loading messages:", error);
    return;
  }

  if (data) {
    const chatBody = document.getElementById("chatBody");
    chatBody.innerHTML = "";

    // Gunakan current_user_id dari token untuk comparison
    const currentUserId = parseInt(localStorage.getItem("current_user_id"), 10);

    console.log("Current User ID from token:", currentUserId);
    console.log("Messages:", data);

    data.forEach((msg) => {
      // Bandingkan sender_id dengan current_user_id
      // Jika sender_id === current_user_id, berarti pesan dari saya sendiri
      const isFromCurrentUser = Number(msg.sender_id) === currentUserId;

      console.log(
        `Message from sender_id: ${msg.sender_id}, current_user_id: ${currentUserId}, isFromCurrentUser: ${isFromCurrentUser}`
      );

      addMessageToChat(
        msg.content,
        isFromCurrentUser,
        msg.type,
        msg.file_url,
        msg.file_name
      );
    });
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
        const currentUserId = Number(localStorage.getItem("current_user_id"));
        const isFromCurrentUser = Number(msg.sender_id) === currentUserId;

        // Hanya tambahkan pesan dari lawan bicara (tidak dari diri sendiri)
        if (!isFromCurrentUser) {
          addMessageToChat(
            msg.content,
            isFromCurrentUser,
            msg.type,
            msg.file_url,
            msg.file_name
          );
        }
      }
    )
    .subscribe();
}

// Fungsi helper untuk menambahkan pesan ke chat
function addMessageToChat(
  content,
  isFromCurrentUser,
  type = "text",
  fileUrl = null,
  fileName = null
) {
  const chatBody = document.getElementById("chatBody");

  const messageContainer = document.createElement("div");
  messageContainer.className = `message-container ${
    isFromCurrentUser ? "right" : "left"
  }`;

  const msgDiv = document.createElement("div");
  msgDiv.className = `chat-bubble ${isFromCurrentUser ? "right" : "left"}`;

  if (type === "file" && fileUrl) {
    msgDiv.innerHTML = `
      <div class="file-message">
        <strong>${fileName || "File"}</strong><br>
        <a href="${fileUrl}" target="_blank">
          Buka file
        </a>
      </div>
    `;
  } else {
    msgDiv.textContent = content;
  }

  messageContainer.appendChild(msgDiv);
  chatBody.appendChild(messageContainer);
  chatBody.scrollTop = chatBody.scrollHeight;
}
