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
      <img
        src="${session.photo}"
        alt="Foto Pasien"
        class="session-photo"
      />
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

    // Tambahkan event listener hanya untuk tombol KONSELING
    const button = sessionElement.querySelector(".btn-konseling");
    if (session.status !== "Selesai") {
      button.addEventListener("click", function () {
        window.location.href = "/src/templates/chat.html";
      });
    }

    sessionList.appendChild(sessionElement);
  });
});
