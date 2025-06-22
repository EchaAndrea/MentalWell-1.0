const authToken = sessionStorage.getItem("authToken");
const containerRiwayat = document.querySelector(".content-riwayat");
const popupContainer = document.getElementById("popup-container");

fetch("https://mentalwell10-api-production.up.railway.app/counselings", {
  method: "GET",
  headers: {
    Authorization: `Bearer ${authToken}`,
    "Content-Type": "application/json",
  },
})
  .then((response) => {
    if (!response.ok) {
      throw new Error("Failed to fetch data. Status: " + response.status);
    }
    return response.json();
  })
  .then((data) => {
    if (data && Array.isArray(data.counselings)) {
      let sessions = data.counselings;

      // Urutkan: Terbayar paling atas, lalu lainnya
      sessions.sort((a, b) => {
        const getOrder = (item) => {
          if (item.payment_status === "approved" && item.status !== "finished")
            return 0; // Terbayar
          if (item.status === "finished") return 1; // Selesai
          if (item.payment_status === "rejected" || item.status === "failed")
            return 2; // Gagal
          if (item.payment_status === "refunded") return 3; // Pengembalian Selesai
          return 4; // Lainnya
        };
        return getOrder(a) - getOrder(b);
      });

      sessions.forEach((riwayat) => {
        const riwayatElement = document.createElement("div");
        riwayatElement.classList.add("container-riwayat");

        const scheduleDate = new Date(riwayat.schedule_date);
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

        let formattedScheduleTime = riwayat.schedule_time
          .replace(":", ".")
          .replace("-", " - ")
          .replace(":", ".");

        // Status mapping
        let formattedStatus = "";
        if (riwayat.payment_status === "refunded") {
          formattedStatus = "Pengembalian Selesai";
        } else if (
          riwayat.payment_status === "approved" &&
          riwayat.status !== "finished"
        ) {
          formattedStatus = "Terbayar";
        } else if (
          riwayat.payment_status === "rejected" ||
          riwayat.status === "failed"
        ) {
          formattedStatus = "Gagal";
        } else if (riwayat.status === "finished") {
          formattedStatus = "Selesai";
        } else if (riwayat.status === "waiting") {
          formattedStatus = "Menunggu";
        } else {
          formattedStatus = riwayat.status;
        }

        // Button logic
        let buttonHTML = "";
        let buttonClass = "btn-konseling";
        let buttonDisabled = "";
        let buttonText = "";
        let buttonId = "";

        if (riwayat.status === "finished") {
          buttonText = "ISI ULASAN";
          buttonId = "button-riwayat-ulasan";
          if (riwayat.has_review) {
            buttonDisabled = "disabled";
            buttonClass += " disabled";
          }
        } else if (
          riwayat.payment_status === "approved" &&
          riwayat.status !== "finished" &&
          riwayat.payment_status !== "refunded" &&
          riwayat.payment_status !== "rejected" &&
          riwayat.status !== "failed"
        ) {
          // TERBAYAR: tombol aktif
          buttonText = "KONSELING";
          buttonId = "button-riwayat-konseling";
          // Tidak disable
        } else {
          buttonText = "KONSELING";
          buttonId = "button-riwayat-konseling";
          buttonDisabled = "disabled";
          buttonClass += " disabled";
        }

        buttonHTML = `<button 
          type="button" 
          class="${buttonClass}" 
          id="${buttonId}"
          data-counseling-id="${riwayat.id}"
          ${buttonDisabled}
        >${buttonText}</button>`;

        riwayatElement.innerHTML = `
          <img src="${riwayat.psychologist_profpic}" alt="Foto Psikolog" id="psychologPhoto" />
          <div class="info-riwayat">
            <div class="info-text">
              <p>
                ${riwayat.psychologist_name}<br />
                ${formattedScheduleDate}<br />
                ${formattedScheduleTime} WIB<br />
                Via Chat
              </p>
            </div>
            <div class="status-button">
              <span class="status-riwayat">${formattedStatus}</span>
              ${buttonHTML}
            </div>
          </div>
        `;

        // Event untuk button
        const btn = riwayatElement.querySelector("button");
        if (btn) {
          if (riwayat.status === "finished" && !riwayat.has_review) {
            btn.addEventListener("click", () => {
              openUlasanPopup(riwayat.id, riwayat.status);
            });
          } else if (
            riwayat.payment_status === "approved" &&
            riwayat.status !== "finished" &&
            riwayat.status !== "failed"
          ) {
            btn.addEventListener("click", () => {
              localStorage.setItem("active_counseling_id", riwayat.id);
              localStorage.setItem("active_role", "pasien");
              localStorage.setItem(
                "active_psychologist_name",
                riwayat.psychologist_name
              );
              localStorage.setItem("active_patient_name", riwayat.patient_name);

              // Setelah dapat data counseling dari API:
              const conversationId = riwayat.conversation_id;
              if (conversationId) {
                localStorage.setItem("active_conversation_id", conversationId);
                console.log(
                  "conversation_id yang akan disimpan:",
                  conversationId
                );
              } else {
                alert("conversation_id tidak ditemukan di data counseling!");
              }

              fetch("/src/templates/popupchat.html")
                .then((res) => res.text())
                .then((html) => {
                  popupContainer.innerHTML = html;
                  popupContainer.style.display = "flex";
                  const overlay = document.getElementById("chatOverlay");
                  if (overlay) overlay.style.display = "block";

                  // Hapus script module popupchat.js yang sudah ada
                  document
                    .querySelectorAll(
                      'script[src="/src/scripts/views/pages/popupchat.js"]'
                    )
                    .forEach((s) => s.remove());

                  // Inject script module popupchat.js
                  const script = document.createElement("script");
                  script.type = "module";
                  script.src = "/src/scripts/views/pages/popupchat.js";
                  script.onload = () => {
                    if (window.initPopupChat) window.initPopupChat();
                  };
                  document.body.appendChild(script);
                })
                .catch((err) => alert(err.message));
            });
          } else {
            btn.addEventListener("click", () => {
              const counselingId = btn.getAttribute("data-counseling-id");
              fetch(
                `https://mentalwell10-api-production.up.railway.app/counseling/${counselingId}`,
                {
                  headers: { Authorization: `Bearer ${authToken}` },
                }
              )
                .then((res) => res.json())
                .then((data) => {
                  const conversationId = data.counseling.conversation_id;
                  if (conversationId) {
                    localStorage.setItem(
                      "active_conversation_id",
                      conversationId
                    );
                    // lanjutkan buka popup chat
                  } else {
                    alert(
                      "conversation_id tidak ditemukan di data counseling!"
                    );
                  }
                });
            });
          }
        }

        containerRiwayat.appendChild(riwayatElement);
      });
    } else {
      console.error("Invalid data format received from the server.");
    }
  })
  .catch((error) => console.error("Error fetching data from API:", error));
