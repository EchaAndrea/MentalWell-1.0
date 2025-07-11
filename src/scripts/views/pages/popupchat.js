import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://uigdyqsypetoziciuhef.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpZ2R5cXN5cGV0b3ppY2l1aGVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg1NzkzNjQsImV4cCI6MjA1NDE1NTM2NH0.ctFsP3ITmiPKJz9RHEkwxdHSKV-E1urbMqcXYui9Gt8";
const supabase = createClient(supabaseUrl, supabaseKey);

// Global variables
let chatChannel = null;
let addMessageToChat; // Declare globally to avoid duplication

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

// Main popup chat initialization
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
    // Unsubscribe dari channel sebelum menutup
    if (chatChannel) {
      console.log("Unsubscribing from chat channel");
      chatChannel.unsubscribe();
      chatChannel = null;
    }

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
      console.log("Starting file upload for:", file.name);

      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `chat-files/${fileName}`;

      console.log("Uploading to path:", filePath);

      const { data, error } = await supabase.storage
        .from("chat-files")
        .upload(filePath, file);

      if (error) {
        console.error("Error uploading file:", error);
        throw new Error(error.message);
      }

      console.log("File uploaded successfully:", data);

      // Get public URL
      const { data: publicURL } = supabase.storage
        .from("chat-files")
        .getPublicUrl(filePath);

      console.log("Public URL:", publicURL.publicUrl);

      return {
        url: publicURL.publicUrl,
        fileName: file.name,
        fileSize: file.size,
      };
    } catch (error) {
      console.error("Upload file error:", error);
      throw error;
    }
  }

  // Fungsi untuk menambahkan pesan ke chat (SINGLE DEFINITION)
  addMessageToChat = function (
    content,
    isFromCurrentUser,
    type = "text",
    fileUrl = null,
    fileName = null
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

    const msgDiv = document.createElement("div");
    msgDiv.className = `chat-bubble ${isFromCurrentUser ? "right" : "left"}`;

    // Debug log
    console.log("Adding message:", {
      content: content.substring(0, 50) + "...",
      isFromCurrentUser,
      containerClass: messageContainer.className,
      bubbleClass: msgDiv.className,
    });

    // Handle different message types
    if (type === "file" && fileUrl) {
      msgDiv.innerHTML = `
        <div class="file-message">
          <span>📎</span>
          <div>
            <strong>${fileName || "File"}</strong><br>
            <a href="${fileUrl}" target="_blank" style="color: inherit;">
              Buka file
            </a>
          </div>
        </div>
      `;
    } else {
      msgDiv.textContent = content;
    }

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

    console.log("Sending message:", {
      conversationId,
      senderRole,
      senderId,
      message,
    });

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
        alert("Gagal mengirim pesan: " + error.message);
      } else {
        console.log("Message sent successfully");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Gagal mengirim pesan: " + error.message);
    }
  };

  // Fungsi untuk mengirim file
  window.sendFile = async function (file) {
    console.log("sendFile called with:", file);

    const conversationId = localStorage.getItem("active_conversation_id");
    if (!conversationId) {
      alert("conversation_id tidak ditemukan di localStorage!");
      return;
    }

    const senderRole = localStorage.getItem("current_user_role");
    const senderId = parseInt(localStorage.getItem("current_user_id"), 10);
    const id = generateId();

    console.log("Sending file:", {
      conversationId,
      senderRole,
      senderId,
      fileName: file.name,
    });

    // Show loading message
    const loadingMsgDiv = addMessageToChat("📎 Mengirim file...", true, "text");

    try {
      // Upload file
      const uploadResult = await uploadFile(file);

      // Remove loading message
      if (loadingMsgDiv) loadingMsgDiv.remove();

      // Add file message to chat
      addMessageToChat(
        `File: ${uploadResult.fileName}`,
        true,
        "file",
        uploadResult.url,
        uploadResult.fileName
      );

      // Kirim file message ke database
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
        console.error("Error saving file message:", error);
        alert("Gagal menyimpan pesan file: " + error.message);
      } else {
        console.log("File message sent successfully");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      // Remove loading message and show error
      if (loadingMsgDiv) loadingMsgDiv.remove();
      addMessageToChat("❌ Gagal mengirim file", true, "text");
      alert("Gagal mengirim file: " + error.message);
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

  const fileUpload = document.getElementById("fileUpload");
  if (fileUpload) {
    fileUpload.addEventListener("change", function (e) {
      const file = e.target.files[0];
      console.log("File selected:", file);

      if (file) {
        // Validasi file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          alert("File terlalu besar! Maksimal 10MB.");
          e.target.value = "";
          return;
        }

        // Validasi tipe file
        const allowedTypes = [
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/gif",
          "image/webp",
          "application/pdf",
          "text/plain",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ];

        if (!allowedTypes.includes(file.type)) {
          alert(
            "Tipe file tidak diizinkan!\nDiizinkan: JPG, PNG, GIF, WEBP, PDF, TXT, DOC, DOCX"
          );
          e.target.value = "";
          return;
        }

        console.log("File validation passed, calling sendFile");
        window.sendFile(file);
        e.target.value = "";
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
  console.log("conversationId:", conversationId);
  if (!conversationId || conversationId === "undefined") {
    alert("conversation_id tidak ditemukan di localStorage!");
    return;
  }

  // Load messages first, then subscribe
  await loadMessages(conversationId);
  subscribeToMessages(conversationId);
};

// Load messages from database
async function loadMessages(conversationId) {
  console.log("Loading messages for conversation:", conversationId);

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

    console.log("Current User ID:", currentUserId);
    console.log("Messages loaded:", data.length);

    data.forEach((msg, index) => {
      const isFromCurrentUser = Number(msg.sender_id) === currentUserId;

      console.log(
        `Message ${index + 1}: sender_id=${
          msg.sender_id
        }, current_user_id=${currentUserId}, isFromCurrentUser=${isFromCurrentUser}`
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

// Subscribe to real-time messages
function subscribeToMessages(conversationId) {
  console.log("🟢 Memulai langganan real-time untuk percakapan:", conversationId);

  // Unsubscribe jika sudah ada channel sebelumnya
  if (chatChannel) {
    console.log("ℹ️ Menghentikan langganan sebelumnya...");
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

        console.log("💬 Pesan baru diterima:", {
          dari: msg.sender_id,
          isi: msg.content?.substring(0, 50) + "...",
        });

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
    .subscribe((status, err) => {
      if (err) {
        console.error("🚫 Tidak dapat berlangganan ke pesan baru:", err);
        console.warn(
          "%cPercakapan tidak aktif atau akses telah dibatasi.",
          "color: #b91c1c; font-style: italic;"
        );
        return;
      }

      console.log("✅ Sesi aktif. Menunggu pesan masuk...");
    });
}

