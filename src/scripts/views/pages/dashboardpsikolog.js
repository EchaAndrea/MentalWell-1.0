const authToken = sessionStorage.getItem("authToken");

const statusDropdown = document.getElementById("statusDropdown2");
const tableBody = document.querySelector("tbody");
const loadingIndicator = document.getElementById("loading-indicator");

loadingIndicator.style.display = "block";

// Flag untuk mencegah konflik saat set dropdown
let isSettingDropdown = false;

// Langsung load availability saat script dijalankan
loadAvailabilityStatus();

// Fungsi redirect ke detail konseling (hanya chat)
const redirectToCounselingDetail = (counselingId) => {
  // Langsung redirect ke halaman chat dengan id konseling
  window.location.href = `https://mentalwell-10-frontend.vercel.app/aturkonseling?id=${counselingId}`;
};

// Update status ketersediaan psikolog
statusDropdown.addEventListener("change", (event) => {
  // Skip hanya jika sedang setting dropdown dari API DAN event tidak dari user
  if (isSettingDropdown && !event.isTrusted) {
    console.log("Skipping change event - dropdown is being set by API");
    return;
  }

  const selectedValue = statusDropdown.value;
  console.log("User manually changed dropdown to:", selectedValue);

  // Jika ini adalah perubahan dari API, jangan kirim ke server
  if (isSettingDropdown) {
    console.log("This is API setting, not sending to server");
    return;
  }

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

// Fungsi untuk load status availability
function loadAvailabilityStatus() {
  console.log("Loading availability status...");

  // Jika dropdown belum ada, coba lagi setelah delay
  if (!statusDropdown) {
    console.log("Dropdown not found, retrying...");
    setTimeout(() => {
      loadAvailabilityStatus();
    }, 100);
    return;
  }

  console.log("Current dropdown value before API call:", statusDropdown.value);

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
      console.log("API response:", data);

      if (data.status === "success" && data.availability) {
        console.log("API returned availability:", data.availability);
        console.log(
          "Current dropdown value before setting:",
          statusDropdown.value
        );

        // Set flag untuk mencegah trigger change event
        isSettingDropdown = true;

        // Force set dropdown value
        statusDropdown.value = data.availability;

        // Trigger visual update
        statusDropdown.dispatchEvent(new Event("change", { bubbles: false }));

        console.log("Dropdown value after setting:", statusDropdown.value);
        console.log("Dropdown selectedIndex:", statusDropdown.selectedIndex);

        // Reset flag setelah selesai
        setTimeout(() => {
          isSettingDropdown = false;
          console.log("Final dropdown value:", statusDropdown.value);

          // Double check - jika masih salah, paksa set lagi
          if (statusDropdown.value !== data.availability) {
            console.warn("Dropdown value still wrong, forcing again...");
            statusDropdown.value = data.availability;
          }
        }, 50);
      } else {
        console.error("Invalid API response:", data);
      }
    })
    .catch((error) => {
      console.error("Error loading availability:", error);
    });
}

// Load status tambahan untuk memastikan
document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM Content Loaded");
  setTimeout(() => {
    loadAvailabilityStatus();
  }, 100);
  setTimeout(() => {
    loadAvailabilityStatus();
  }, 500);
  setTimeout(() => {
    loadAvailabilityStatus();
  }, 1000);
});

window.addEventListener("load", function () {
  console.log("Window Loaded");
  setTimeout(() => {
    loadAvailabilityStatus();
  }, 100);
  setTimeout(() => {
    loadAvailabilityStatus();
  }, 500);
});
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
        fetchCounselings(); // Refresh tabel
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
