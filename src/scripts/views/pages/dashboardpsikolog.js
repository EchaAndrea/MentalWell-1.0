const authToken = sessionStorage.getItem("authToken");

const statusDropdown = document.getElementById("statusDropdown2");
const tableBody = document.querySelector("tbody");
const loadingIndicator = document.getElementById("loading-indicator");

loadingIndicator.style.display = "block";

// Flag untuk mencegah multiple calls
let isAvailabilityFetched = false;

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
        // Reset flag agar bisa fetch lagi jika diperlukan
        isAvailabilityFetched = false;
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

function fetchAvailability() {
  if (isAvailabilityFetched) {
    console.log("Availability already fetched, skipping..."); // Debug log
    return;
  }

  console.log("Fetching availability..."); // Debug log
  fetch(
    "https://mentalwell10-api-production.up.railway.app/psychologist/availability",
    {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    }
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log("Availability response:", data); // Debug log
      if (data.status === "success" && data.hasOwnProperty("availability")) {
        const availability = data.availability;
        console.log("Setting dropdown to:", availability); // Debug log
        console.log(
          "Current dropdown value before setting:",
          statusDropdown.value
        ); // Debug log

        // Set dropdown value berdasarkan response API dengan force
        statusDropdown.value = availability;

        // Double check - jika value tidak berubah, force set lagi
        if (statusDropdown.value !== availability) {
          console.warn("Dropdown value didn't change, forcing..."); // Debug log
          setTimeout(() => {
            statusDropdown.value = availability;
            console.log("Forced dropdown value:", statusDropdown.value); // Debug log
          }, 100);
        }

        console.log(
          "Current dropdown value after setting:",
          statusDropdown.value
        ); // Debug log
        isAvailabilityFetched = true;
      } else {
        console.warn(
          "Invalid availability response or missing availability field:",
          data
        );
        // Set ke available sebagai fallback jika tidak ada data yang valid
        statusDropdown.value = "available";
        isAvailabilityFetched = true;
      }
    })
    .catch((error) => {
      console.error("Error fetching availability:", error);
      // Set ke available sebagai fallback jika error
      statusDropdown.value = "available";
      isAvailabilityFetched = true;
    });
}

// Panggil setelah DOM siap untuk memastikan elemen dropdown sudah siap
document.addEventListener("DOMContentLoaded", () => {
  // Pastikan dropdown element siap sebelum memanggil fetchAvailability
  if (statusDropdown) {
    console.log("DOM loaded, calling fetchAvailability"); // Debug log
    // Panggil langsung tanpa delay
    fetchAvailability();
  } else {
    console.error("Status dropdown element not found!");
  }
});

// Juga panggil setelah window load untuk memastikan semua resource siap
window.addEventListener("load", () => {
  if (statusDropdown && !isAvailabilityFetched) {
    console.log("Window loaded, calling fetchAvailability again"); // Debug log
    // Panggil lagi untuk memastikan jika belum berhasil
    setTimeout(() => {
      fetchAvailability();
    }, 500);
  }
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
