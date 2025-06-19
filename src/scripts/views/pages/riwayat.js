const authToken = sessionStorage.getItem("authToken");
const containerRiwayat = document.querySelector(".content-riwayat");

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

        let formattedStatus = "";
        if (riwayat.status === "finished") formattedStatus = "Selesai";
        else if (riwayat.status === "waiting") formattedStatus = "Menunggu";
        else if (riwayat.status === "failed") formattedStatus = "Gagal";
        else formattedStatus = riwayat.status;

        // Button logic
        let buttonHTML = "";
        let buttonClass = "btn-konseling";
        let buttonDisabled = "";
        let buttonText = "";
        let buttonId = "";

        if (riwayat.status === "finished") {
          buttonText = "ISI ULASAN";
          buttonId = "button-riwayat-ulasan";
          // Disable jika sudah pernah isi ulasan
          if (riwayat.has_review) {
            buttonDisabled = "disabled";
            buttonClass += " disabled";
          }
        } else {
          buttonText = "KONSELING";
          buttonId = "button-riwayat-konseling";
          // Disable jika status bukan approved atau status waiting/failed
          if (
            riwayat.payment_status !== "approved" ||
            riwayat.status === "waiting" ||
            riwayat.status === "failed"
          ) {
            buttonDisabled = "disabled";
            buttonClass += " disabled";
          }
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
            riwayat.status !== "finished"
          ) {
            btn.addEventListener("click", () => {
              localStorage.setItem("active_counseling_id", riwayat.id);
              fetch("/src/templates/popupchat.html")
                .then((res) => {
                  if (!res.ok) throw new Error("Gagal memuat popup chat");
                  return res.text();
                })
                .then((html) => {
                  const popupContainer =
                    document.getElementById("popup-container");
                  popupContainer.innerHTML = html;
                  popupContainer.style.display = "flex";
                  if (typeof initPopup === "function") initPopup();
                })
                .catch((err) => alert(err.message));
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
