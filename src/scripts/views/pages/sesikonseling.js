document.addEventListener("DOMContentLoaded", () => {
  const sessions = [
    {
      name: "John Doe M.Si., M.Psi., Psikolog",
      date: "27 November 2025",
      time: "16:00 - 17:00",
      mode: "Via Chat",
      status: "Belum selesai",
      photo: "/src/public/beranda/man.png",
      chatUrl: "/src/templates/popupchat.html"
    },
    {
      name: "John Doe M.Si., M.Psi., Psikolog",
      date: "28 November 2025",
      time: "10:00 - 11:00",
      mode: "Via Chat",
      status: "Selesai",
      photo: "/src/public/beranda/man.png",
      chatUrl: "/src/templates/popupchat.html"
    },
  ];

  const sessionList = document.getElementById("session-list");
  const popupContainer = document.getElementById("popup-container");

  sessions.forEach((session) => {
    const sessionElement = document.createElement("div");
    sessionElement.classList.add("container-sesi");

    const isDisabled = session.status === "Selesai";

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
          class="btn-konseling${isDisabled ? ' disabled' : ''}"
          ${isDisabled ? 'disabled' : ''}
        >
          KONSELING
        </button>
      </div>
    `;

    const button = sessionElement.querySelector(".btn-konseling");

    if (!isDisabled && button) {
      button.addEventListener("click", () => {
        fetch(session.chatUrl)
          .then((res) => {
            if (!res.ok) throw new Error("Gagal memuat popup chat");
            return res.text();
          })
          .then((html) => {
            popupContainer.innerHTML = html;
            popupContainer.style.display = "flex";
            initPopup();
          })
          .catch((err) => alert(err.message));
      });
    }

    sessionList.appendChild(sessionElement);
  });

  function initPopup() {
    const closeBtn = popupContainer.querySelector("button[onclick='toggleChat()']");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        popupContainer.style.display = "none";
        popupContainer.innerHTML = "";
      });
    }

    const input = popupContainer.querySelector("#chatInput");
    if (input) {
      input.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
          sendMessage();
        }
      });
    }
  }
});
