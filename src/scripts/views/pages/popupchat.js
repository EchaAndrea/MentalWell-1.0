const chatOverlay = document.getElementById("chatOverlay");
const chatPopup = document.getElementById("chatPopup");
const namaPsikologDiv = document.getElementById("namaPsikolog");
const chatBody = document.getElementById("chatBody");
const chatInput = document.getElementById("chatInput");
const fileUpload = document.getElementById("fileUpload");
const chatTargetName = document.getElementById("chatTargetName");

// Ambil counseling_id dan role dari localStorage
const COUNSELING_ID = localStorage.getItem("active_counseling_id");
const ROLE = localStorage.getItem("active_role"); // "psikolog" atau "pasien"
const TOKEN =
  sessionStorage.getItem("authToken") || localStorage.getItem("token");

// Ambil detail psikolog (untuk sisi pasien)
async function fetchPsychologistDetail() {
  try {
    // Dapatkan detail counseling dulu untuk ambil psychologist_id
    const counselingRes = await fetch(
      `https://mentalwell10-api-production.up.railway.app/counseling/${COUNSELING_ID}`,
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          Origin: "https://mentalwell-10-frontend.vercel.app",
        },
      }
    );
    if (!counselingRes.ok) throw new Error("Gagal ambil data counseling");
    const counselingData = await counselingRes.json();
    const psychologistId = counselingData.data.psychologist_id;

    // Ambil detail psikolog
    const res = await fetch(
      `https://mentalwell10-api-production.up.railway.app/psychologists/${psychologistId}`,
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          Origin: "https://mentalwell-10-frontend.vercel.app",
        },
      }
    );
    if (!res.ok) throw new Error("Gagal ambil data psikolog");
    const data = await res.json();
    if (namaPsikologDiv) namaPsikologDiv.textContent = data.data.name || "-";
    if (chatTargetName)
      chatTargetName.textContent =
        "Kamu sedang chat dengan " + (data.data.name || "-");
  } catch (err) {
    if (namaPsikologDiv) namaPsikologDiv.textContent = "Psikolog";
    if (chatTargetName)
      chatTargetName.textContent = "Kamu sedang chat dengan Psikolog";
  }
}

// Ambil detail pasien (untuk sisi psikolog)
async function fetchCounselingDetail() {
  try {
    const res = await fetch(
      `https://mentalwell10-api-production.up.railway.app/psychologist/counseling/${COUNSELING_ID}`,
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          Origin: "https://mentalwell-10-frontend.vercel.app",
        },
      }
    );
    if (!res.ok) throw new Error("Gagal ambil data counseling");
    const data = await res.json();
    if (chatTargetName)
      chatTargetName.textContent =
        "Kamu sedang chat dengan " + (data.data.name || "-");
    if (namaPsikologDiv)
      namaPsikologDiv.textContent = data.data.psychologist_name || "-";
  } catch (err) {
    if (chatTargetName)
      chatTargetName.textContent = "Kamu sedang chat dengan Pasien";
    if (namaPsikologDiv) namaPsikologDiv.textContent = "Psikolog";
  }
}

// Fungsi buka chat
window.openChat = function () {
  if (chatOverlay && chatPopup) {
    chatOverlay.style.display = "block";
    chatPopup.style.display = "block";
    if (ROLE === "psikolog") {
      fetchCounselingDetail();
    } else {
      fetchPsychologistDetail();
    }
  }
};

// Fungsi tutup chat
window.closeChat = function () {
  if (chatOverlay && chatPopup) {
    chatOverlay.style.display = "none";
    chatPopup.style.display = "none";
  }
};

// Kirim pesan (integrasi Supabase Realtime di sini)
window.sendMessage = async function () {
  const message = chatInput.value.trim();
  if (message !== "") {
    appendMessage(message, "right");
    chatInput.value = "";
    chatBody.scrollTop = chatBody.scrollHeight;
    // TODO: Kirim pesan ke Supabase Realtime
    // await supabase.from('messages').insert({ ... });
  }
};

// Fungsi menambah pesan ke chat
function appendMessage(text, side = "left") {
  const bubble = document.createElement("div");
  bubble.className = `chat-bubble ${side}`;
  bubble.textContent = text;
  chatBody.appendChild(bubble);
}

// Enter untuk kirim pesan
if (chatInput) {
  chatInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      window.sendMessage();
    }
  });
}

// Preview nama file jika upload file
if (fileUpload) {
  fileUpload.addEventListener("change", function () {
    if (fileUpload.files.length > 0) {
      const file = fileUpload.files[0];
      appendMessage(`📎 ${file.name}`, "right");
      chatBody.scrollTop = chatBody.scrollHeight;
      // TODO: Upload file ke server/Supabase Storage
    }
  });
}

// Klik overlay untuk tutup chat
if (chatOverlay) {
  chatOverlay.addEventListener("click", window.closeChat);
}
