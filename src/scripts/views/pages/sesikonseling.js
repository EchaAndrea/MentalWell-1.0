document.addEventListener("DOMContentLoaded", async () => {
  const sessionList = document.getElementById("session-list");
  const popupContainer = document.getElementById("popup-container");
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("authToken");

  try {
    const res = await fetch(
      "https://mentalwell10-api-production.up.railway.app/counselings",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!res.ok) throw new Error("Gagal memuat data sesi konseling");
    const data = await res.json();

    // Ambil array sesi dari data.counselings sesuai response API terbaru
    let sessions = data.counselings || [];
    if (sessions.length === 0) {
      sessionList.innerHTML = `<div class="alert alert-info">Belum ada sesi konseling.</div>`;
      return;
    }

    // Urutkan: yang belum selesai di atas, yang finished di bawah
    sessions = [
      ...sessions.filter((s) => s.status !== "finished"),
      ...sessions.filter((s) => s.status === "finished"),
    ];

    sessions.forEach((session) => {
      const sessionElement = document.createElement("div");
      sessionElement.classList.add("container-sesi");

      // Format tanggal seperti di riwayat
      const scheduleDate = new Date(session.schedule_date);
      const optionsSchedule = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      };
      const formattedScheduleDate = scheduleDate.toLocaleDateString(
        "id-ID",
        optionsSchedule
      );

      let formattedScheduleTime = session.schedule_time
        ? session.schedule_time
            .replace(":", ".")
            .replace("-", " - ")
            .replace(":", ".")
        : "-";

      const isDisabled =
        session.status === "finished" || session.status === "Selesai";

      sessionElement.innerHTML = `
        <img src="${
          session.psychologist_profpic || "/src/public/beranda/man.png"
        }" alt="Foto Psikolog" class="session-photo" />
        <div class="info-sesi">
          <div class="info-text">
            <p>
              ${session.psychologist_name || "-"}<br />
              ${formattedScheduleDate}<br />
              ${formattedScheduleTime} WIB<br />
              Via Chat
            </p>
          </div>
          <div class="status-sesi">
            <span class="status">${session.status || "-"}</span>
            <button 
              type="button" 
              class="btn-konseling"
              ${isDisabled ? "disabled" : ""}
              data-counseling-id="${session.id}"
            >
              KONSELING
            </button>
          </div>
        </div>
      `;

      const button = sessionElement.querySelector(".btn-konseling");

      if (!isDisabled && button) {
        button.addEventListener("click", () => {
          localStorage.setItem("active_counseling_id", session.id);

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
