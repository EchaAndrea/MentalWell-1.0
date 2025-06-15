document.addEventListener("DOMContentLoaded", () => {
  const sessionList = document.getElementById("session-list");
  const popupContainer = document.getElementById("popup-container");

  // Ganti URL di bawah dengan endpoint backend-mu
  fetch(
    "https://mentalwell10-api-production.up.railway.app/realtime/counseling/list"
  )
    .then((res) => {
      if (!res.ok) throw new Error("Gagal memuat data sesi konseling");
      return res.json();
    })
    .then((data) => {
      // Asumsikan data.sessions adalah array sesi dari backend
      (data.sessions || []).forEach((session) => {
        const sessionElement = document.createElement("div");
        sessionElement.classList.add("container-sesi");

        const isDisabled = session.status === "Selesai";

        sessionElement.innerHTML = `
          <img src="${
            session.photo || "/src/public/beranda/man.png"
          }" alt="Foto Pasien" class="session-photo" />
          <div class="info-sesi">
            <div class="info-text">
              <p>
                ${session.psychologist_name || "-"}<br />
                ${session.schedule_date || "-"}<br />
                ${session.schedule_time || "-"}<br />
                ${
                  session.type === "on_demand"
                    ? "Via Chat"
                    : session.type || "-"
                }
              </p>
            </div>
          </div>
          <div class="status-sesi">
            <span class="status">${session.status || "-"}</span>
            <button 
              type="button" 
              class="btn-konseling${isDisabled ? " disabled" : ""}"
              ${isDisabled ? "disabled" : ""}
            >
              KONSELING
            </button>
          </div>
        `;

        const button = sessionElement.querySelector(".btn-konseling");

        if (!isDisabled && button) {
          button.addEventListener("click", () => {
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
    })
    .catch((err) => {
      sessionList.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
    });

  function initPopup() {
    const closeBtn = popupContainer.querySelector(
      "button[onclick='toggleChat()']"
    );
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
