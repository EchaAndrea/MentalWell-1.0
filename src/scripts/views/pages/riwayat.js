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
      if (data.counselings.length === 0) {
        const noDataElement = document.createElement("p");
        noDataElement.textContent = "Tidak ada riwayat konseling.";
        containerRiwayat.appendChild(noDataElement);
      } else {
        data.counselings.forEach((riwayat) => {
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

          riwayatElement.innerHTML = `
            <img src="${riwayat.psychologist_profpic}" alt="Foto Psikolog" id="psychologPhoto" />
            <div class="info-riwayat">
              <div class="info-text">
                <p>
                  ${riwayat.psychologist_name}<br />
                  ${formattedScheduleDate}<br />
                  ${formattedScheduleTime} WIB<br />
                </p>
              </div>
              <div class="status-button">
                <span class="status-riwayat">${formattedStatus}</span>
              </div>
            </div>
          `;

          containerRiwayat.appendChild(riwayatElement);
        });
      }
    } else {
      console.error("Invalid data format received from the server.");
    }
  })
  .catch((error) => console.error("Error fetching data from API:", error));
