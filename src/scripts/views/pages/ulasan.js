authToken = sessionStorage.getItem("authToken");

let currentCounselingId;

function openUlasanPopup(counselingId, status) {
  currentCounselingId = counselingId;
  document.getElementById("container-ulasan").style.display = "flex";
  document.getElementById("overlay").style.display = "block";
  var navbarLinks = document.querySelectorAll(".navbar");
  navbarLinks.forEach(function (link) {
    link.style.pointerEvents = "none";
  });
}

function closeUlasanPopup() {
  document.getElementById("container-ulasan").style.display = "none";
  document.body.classList.remove("popup-open");
  document.getElementById("overlay").style.display = "none";
  var navbarLinks = document.querySelectorAll(".navbar");
  navbarLinks.forEach(function (link) {
    link.style.pointerEvents = "auto";
  });
}

// Fungsi untuk menampilkan pesan peringatan
function showReviewRequiredMessage() {
  Swal.fire({
    title: "Ulasan Diperlukan!",
    text: "Silakan isi ulasan terlebih dahulu untuk melanjutkan.",
    icon: "warning",
    confirmButtonText: "OK",
    confirmButtonColor: "#3085d6",
  });
}

// Fungsi untuk cek apakah button perlu diklik untuk ulasan
function handleReviewButtonClick(counselingId, hasReview) {
  if (!hasReview) {
    showReviewRequiredMessage();
    return;
  }
  openUlasanPopup(counselingId, "completed");
}

function authenticate(event) {
  event.preventDefault();
  alert("Authentication logic goes here!");
}

function submitUlasan(ulasan) {
  // Validasi input kosong
  if (!ulasan.trim()) {
    Swal.fire({
      title: "Ulasan Kosong!",
      text: "Mohon isi ulasan terlebih dahulu sebelum mengirim.",
      icon: "error",
      confirmButtonText: "OK",
    });
    return;
  }

  Swal.fire({
    title: "Memuat...",
    text: "Harap tunggu sejenak. Ulasan akan segera dikirim",
    allowOutsideClick: false,
    showCancelButton: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });

  fetch(
    `https://mentalwell10-api-production.up.railway.app/counseling/${currentCounselingId}/review`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ review: ulasan }),
    }
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to submit review. Status: " + response.status);
      }
      return response.json();
    })
    .then((data) => {
      Swal.close();

      Swal.fire({
        title: "Berhasil Membuat Ulasan!",
        text: "Terima kasih atas ulasan yang Anda berikan.",
        icon: "success",
        showConfirmButton: false,
        timer: 2000,
      });
      updateButtonAfterSubmission(currentCounselingId);
      // Clear textarea setelah berhasil submit
      document.getElementById("ulasan").value = "";
    })
    .catch((error) => {
      console.error("Error submitting review:", error);
      Swal.fire({
        title: "Gagal Mengirim Ulasan!",
        text: "Terjadi kesalahan saat mengirim ulasan. Silakan coba lagi.",
        icon: "error",
        confirmButtonText: "OK",
      });
    })
    .finally(() => {
      closeUlasanPopup();
    });
}

function updateButtonAfterSubmission(counselingId) {
  const buttonElement = document.querySelector(
    `button[data-counseling-id="${counselingId}"]`
  );

  if (buttonElement) {
    buttonElement.disabled = true;
    buttonElement.classList.add("disabled");
    buttonElement.textContent = "ULASAN";
  }
}

document
  .querySelector(".content-ulasan")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    const ulasan = document.getElementById("ulasan").value;

    submitUlasan(ulasan);
  });
