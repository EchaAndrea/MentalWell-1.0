document.addEventListener("DOMContentLoaded", async () => {
  const sessionList = document.getElementById("session-list");
  const popupContainer = document.getElementById("popup-container");
  const token = localStorage.getItem("token") || sessionStorage.getItem("authToken");

  try {
    const res = await fetch(
      "https://mentalwell10-api-production.up.railway.app/counselings/patient",
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    if (!res.ok) throw new Error("Gagal memuat data sesi konseling");
    const data = await res.json();

    // Asumsikan data.result.counselings adalah array sesi dari backend
    const sessions = data.result?.counselings || [];
    if (sessions.length === 0) {
      sessionList.innerHTML = `<div class="alert alert-info">Belum ada sesi konseling.</div>`;
      return;
    }

    sessions.forEach((session) => {
      const sessionElement = document.createElement("div");
      sessionElement.classList.add("container-sesi");

      const isDisabled = session.status === "Selesai";

      sessionElement.innerHTML = `
        <img src="${session.psychologist_photo || '/src/public/beranda/man.png'}" alt="Foto Psikolog" class="session-photo" />
        <div class="info-sesi">
          <div class="info-text">
            <p>
              ${session.psychologist_name || '-'}<br />
              ${session.schedule_date || '-'}<br />
              ${session.schedule_time || '-'}<br />
              ${session.type === 'on_demand' ? 'Via Chat' : (session.type || '-')}
            </p>
          </div>
        </div>
        <div class="status-sesi">
          <span class="status">${session.status || '-'}</span>
          <button 
            type="button" 
            class="btn-konseling${isDisabled ? ' disabled' : ''}"
            ${isDisabled ? 'disabled' : ''}
            data-counseling-id="${session.counseling_id}"
          >
            KONSELING
          </button>
        </div>
      `;

      const button = sessionElement.querySelector(".btn-konseling");

      if (!isDisabled && button) {
        button.addEventListener("click", () => {
          // Simpan id sesi ke localStorage/sessionStorage jika perlu
          localStorage.setItem("active_counseling_id", session.counseling_id);

          fetch("/src/templates/popupchat.html")
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
  } catch (err) {
    sessionList.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
  }

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
