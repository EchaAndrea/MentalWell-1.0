import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://xxxx.supabase.co"; // ganti dengan URL projectmu
const supabaseKey = "public-anon-key"; // ganti dengan anon/public key projectmu
const supabase = createClient(supabaseUrl, supabaseKey);

document.addEventListener("DOMContentLoaded", function () {
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

    // Fungsi untuk mengirim pesan
    window.sendMessage = async function () {
      const input = document.getElementById("chatInput");
      const message = input.value.trim();
      if (!message) return;
      const counselingId = localStorage.getItem("active_counseling_id");
      const senderRole = localStorage.getItem("active_role"); // 'pasien' atau 'psikolog'
      const senderName =
        senderRole === "psikolog"
          ? localStorage.getItem("active_psychologist_name")
          : localStorage.getItem("active_patient_name");
      await supabase.from("messages").insert([
        {
          counseling_id: counselingId,
          sender_role: senderRole,
          sender_name: senderName,
          message: message,
        },
      ]);
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

    const counselingId = localStorage.getItem("active_counseling_id");
    loadMessages(counselingId);
    subscribeToMessages(counselingId);
  };

  // Inisialisasi otomatis jika popup sudah ada di DOM
  if (document.getElementById("chatInput")) {
    window.initPopupChat();
  }
});

async function loadMessages(counselingId) {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("counseling_id", counselingId)
    .order("created_at", { ascending: true });
  if (data) {
    const chatBody = document.getElementById("chatBody");
    chatBody.innerHTML = "";
    data.forEach((msg) => {
      const msgDiv = document.createElement("div");
      msgDiv.className =
        msg.sender_role === "pasien"
          ? "alert alert-primary p-2 mb-1 align-self-end"
          : "alert alert-secondary p-2 mb-1 align-self-start";
      msgDiv.textContent = msg.message;
      chatBody.appendChild(msgDiv);
    });
    chatBody.scrollTop = chatBody.scrollHeight;
  }
}

function subscribeToMessages(counselingId) {
  supabase
    .channel("messages")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `counseling_id=eq.${counselingId}`,
      },
      (payload) => {
        const msg = payload.new;
        const chatBody = document.getElementById("chatBody");
        const msgDiv = document.createElement("div");
        msgDiv.className =
          msg.sender_role === "pasien"
            ? "alert alert-primary p-2 mb-1 align-self-end"
            : "alert alert-secondary p-2 mb-1 align-self-start";
        msgDiv.textContent = msg.message;
        chatBody.appendChild(msgDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
      }
    )
    .subscribe();
}
