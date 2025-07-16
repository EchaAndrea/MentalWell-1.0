const authToken = sessionStorage.getItem("authToken");

const statusDropdown = document.getElementById("statusDropdown2");
const tableBody = document.querySelector("tbody");
const loadingIndicator = document.getElementById("loading-indicator");

loadingIndicator.style.display = "block";

// Reset dropdown ke kosong dulu saat page load
if (statusDropdown) {
  statusDropdown.value = "";
}

// Fungsi redirect ke detail konseling (hanya chat)
const redirectToCounselingDetail = (counselingId) => {
  // Langsung redirect ke halaman chat dengan id konseling
  window.location.href = `https://mentalwell-10-frontend.vercel.app/aturkonseling?id=${counselingId}`;
};

// Update status ketersediaan psikolog
statusDropdown.addEventListener("change", () => {
  const selectedValue = statusDropdown.value;

  Swal.fire({
    title: "Memuat...",
    text: "Harap tunggu sejenak. Status ketersediaan anda akan segera berubah ",
    allowOutsideClick: false,
    showCancelButton: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });

  fetch(
    "https://mentalwell10-api-production.up.railway.app/psychologist/availability",
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ availability: selectedValue }),
    }
  )
    .then((response) => response.json())
    .then((data) => {
      Swal.close();
      if (data.status === "success") {
        const formattedValue =
          selectedValue === "unavailable" ? "Tidak Tersedia" : "Tersedia";
        Swal.fire({
          title: `Berhasil Mengubah Ketersediaan Menjadi ${formattedValue}!`,
          icon: "success",
          timer: 3000,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          title: "Gagal!",
          text: data.message || "Gagal mengubah status.",
          icon: "error",
        });
      }
    })
    .catch((error) => {
      Swal.close();
      Swal.fire({
        title: "Error",
        text: "Terjadi kesalahan koneksi.",
        icon: "error",
      });
      console.error("Error update availability:", error);
    });
});

// Event klik pada tabel untuk redirect ke chat konseling
tableBody.addEventListener("click", (event) => {
  const isIcon = event.target.tagName === "IMG" && event.target.alt === "tulis";
  if (!isIcon) return;
  const counselingId = event.target.getAttribute("data-counseling-id");
  if (counselingId) {
    redirectToCounselingDetail(counselingId);
  }
});

// Fetch daftar konseling (hanya chat)
function fetchCounselings() {
  fetch(
    "https://mentalwell10-api-production.up.railway.app/psychologist/counselings",
    {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    }
  )
    .then((response) => response.json())
    .then((data) => {
      loadingIndicator.style.display = "none";
      if (data.status !== "success") throw new Error(data.message);

      const sortedCounselings = data.counselings.sort((a, b) => {
        // Urutkan berdasarkan ID descending
        return b.id - a.id;
      });

      // Render tabel konseling
      tableBody.innerHTML = "";
      sortedCounselings.forEach((counseling) => {
        const row = tableBody.insertRow();

        const nameCell = row.insertCell(0);
        const dateCell = row.insertCell(1);
        const timeCell = row.insertCell(2);
        const typeCell = row.insertCell(3);
        const statusCell = row.insertCell(4);
        const actionCell = row.insertCell(5);

        nameCell.textContent = counseling.patient_name;
        dateCell.textContent = formatDate(counseling.schedule_date);
        timeCell.textContent = counseling.schedule_time;
        typeCell.textContent = "Chat";
        statusCell.textContent =
          counseling.status === "finished" ? "Selesai" : "Belum Selesai";

        const actionImage = document.createElement("img");
        actionImage.src = "/src/public/dashboard/tulis.png";
        actionImage.alt = "tulis";
        actionImage.setAttribute("data-counseling-id", `${counseling.id}`);
        actionCell.appendChild(actionImage);
      });
    })
    .catch((error) => {
      loadingIndicator.style.display = "none";
      Swal.fire({
        title: "Gagal Memuat Data",
        text: error.message || "Terjadi kesalahan koneksi.",
        icon: "error",
      });
      console.error("Error during data fetching:", error);
    });
}

// Fungsi sederhana untuk set status dropdown
function setAvailabilityDropdown() {
  console.log("Calling setAvailabilityDropdown...");

  fetch(
    "https://mentalwell10-api-production.up.railway.app/psychologist/availability",
    {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    }
  )
    .then((response) => response.json())
    .then((data) => {
      console.log("Availability API response:", data);

      if (data.status === "success" && data.availability && statusDropdown) {
        console.log("Current dropdown value:", statusDropdown.value);
        console.log("API says availability should be:", data.availability);

        // Langsung set tanpa flag
        statusDropdown.value = data.availability;

        console.log("Dropdown value after setting:", statusDropdown.value);

        // Cek semua option untuk debug
        console.log("Available options:");
        for (let i = 0; i < statusDropdown.options.length; i++) {
          const option = statusDropdown.options[i];
          console.log(
            `Option ${i}: value="${option.value}", text="${option.text}", selected=${option.selected}`
          );
        }
      }
    })
    .catch((error) => {
      console.error("Error fetching availability:", error);
    });
}

// Panggil langsung tanpa delay
setAvailabilityDropdown();
fetchCounselings();

function formatDate(dateString) {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString("id-ID", options);
}

function updateCounselingStatus(counselingId, newStatus) {
  fetch(
    `https://mentalwell10-api-production.up.railway.app/psychologist/counseling/${counselingId}/status`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: newStatus }),
    }
  )
    .then((response) => response.json())
    .then((data) => {
      if (data.status === "success") {
        Swal.fire({
          title: "Status berhasil diubah!",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
        fetchCounselings();
      } else {
        Swal.fire({
          title: "Gagal!",
          text: data.message || "Gagal mengubah status.",
          icon: "error",
        });
      }
    })
    .catch((error) => {
      Swal.fire({
        title: "Error",
        text: "Terjadi kesalahan koneksi.",
        icon: "error",
      });
      console.error("Error update counseling status:", error);
    });
}
