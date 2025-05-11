document.addEventListener("DOMContentLoaded", function () {
  const sessions = [
    {
      name: "John Doe M.Si., M.Psi., Psikolog",
      date: "27 November 2025",
      time: "16:00 - 17:00",
      mode: "Via Chat",
      status: "Belum selesai",
      photo: "/src/public/beranda/man.png",
    },
    {
      name: "John Doe M.Si., M.Psi., Psikolog",
      date: "28 November 2025",
      time: "10:00 - 11:00",
      mode: "Via Chat",
      status: "Selesai",
      photo: "/src/public/beranda/man.png",
    },
  ];

  const sessionList = document.getElementById("session-list");

  sessions.forEach((session) => {
    const sessionElement = document.createElement("div");
    sessionElement.classList.add("container-sesi");

    sessionElement.innerHTML = `
      <img src="${session.photo}" alt="Foto Pasien" class="session-photo" />
      <div class="info-sesi">
        <div class="info-text">
          <p>
            ${session.name}<br />
            ${session.date}<br />
            ${session.time}<br />
            ${session.mode}
          </p>
        </div>
      </div>
      <div class="status-sesi">
        <span class="status">${session.status}</span>
        <button 
          type="button" 
          class="btn-konseling${session.status === 'Selesai' ? ' disabled' : ''}"
          ${session.status === 'Selesai' ? 'disabled' : ''}
        >
          ${session.status === 'Selesai' ? 'ISI ULASAN' : 'KONSELING'}
        </button>
      </div>
    `;

    const button = sessionElement.querySelector(".btn-konseling");
    if (session.status !== "Selesai") {
      button.addEventListener("click", toggleChat);
    }

    sessionList.appendChild(sessionElement);
  });

  const input = document.getElementById("chatInput");
  if (input) {
    input.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        sendMessage();
      }
    });
  }

  const fileUpload = document.getElementById("fileUpload");
  if (fileUpload) {
    fileUpload.addEventListener("change", function () {
      if (this.files.length > 0) {
        addChatBubble(`📎 File dikirim: ${this.files[0].name}`, "right");
        scrollToBottom();
      }
    });
  }
});

// ✅ Gunakan hanya 1 versi fungsi toggleChat
function toggleChat() {
  const popup = document.getElementById("chatPopup");
  const chatBody = document.getElementById("chatBody");

  if (popup.style.display === "flex") {
    popup.style.display = "none";
  } else {
    popup.style.display = "flex";
    // Hanya tambahkan pesan default jika belum ada bubble
    if (chatBody && chatBody.children.length === 0) {
      addChatBubble("Halo, ada yang bisa saya bantu?", "left");
    }
  }
}

function sendMessage() {
  const input = document.getElementById("chatInput");
  const message = input.value.trim();
  if (message !== "") {
    addChatBubble(message, "right");
    input.value = "";
    scrollToBottom();

    setTimeout(() => {
      addChatBubble("Terima kasih sudah berbagi, saya akan bantu semampu saya.", "left");
      scrollToBottom();
    }, 800);
  }
}

function addChatBubble(text, position) {
  const chatBody = document.getElementById("chatBody");
  const bubble = document.createElement("div");
  bubble.className = `chat-bubble ${position}`;
  bubble.textContent = text;
  chatBody.appendChild(bubble);
}

function scrollToBottom() {
  const chatBody = document.getElementById("chatBody");
  chatBody.scrollTop = chatBody.scrollHeight;
}
