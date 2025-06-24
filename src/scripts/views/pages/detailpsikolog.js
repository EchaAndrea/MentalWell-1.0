async function fetchArticleById(articleId) {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `https://mentalwell10-api-production.up.railway.app/psychologists/${articleId}`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching article data:", error);
    throw error;
  }
}

async function renderArticleDetails() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const articleId = urlParams.get("id");
    if (!articleId) return;

    const articleData = await fetchArticleById(articleId);
    // Jika API return {id:..., name:...}
    const psikolog =
      articleData && articleData.id ? articleData : articleData.data || {};

    // Render foto
    const fotopsikolog = document.getElementById("psychologProfile");
    if (fotopsikolog) fotopsikolog.src = psikolog.profile_image;

    // Render nama dan bio
    const datapsikolog = document.querySelector(".data-psikolog h2");
    if (datapsikolog) datapsikolog.textContent = psikolog.name;

    const biodatapsikolog = document.getElementById("biodata-psikolog");
    if (biodatapsikolog) biodatapsikolog.innerHTML = `<p>${psikolog.bio}</p>`;

    // Render pengalaman praktik
    const pengalamanpraktik = document.getElementById("praktik");
    if (pengalamanpraktik)
      pengalamanpraktik.textContent = psikolog.experience || "-";

    // Render topik keahlian
    const topicList = document.getElementById("topiclist");
    if (topicList) {
      if (psikolog.topics && psikolog.topics.length > 0) {
        topicList.innerHTML = psikolog.topics
          .map((topic) => `<li>${topic.name}</li>`)
          .join("");
      } else {
        topicList.innerHTML = "<li>Tidak ada topik.</li>";
      }
    }

    // Render ulasan pengguna
    const userReviewsContainer = document.getElementById("userReviews");
    const ulasanPengguna = document.getElementById("ulasan-pengguna");
    if (userReviewsContainer && ulasanPengguna) {
      if (psikolog.reviews && psikolog.reviews.length > 0) {
        userReviewsContainer.innerHTML = psikolog.reviews
          .map(
            (review) => `
            <div class="isi-ulasan">
              <img src="/src/public/beranda/man.png" alt="Foto User" id="userReview" />
              <div class="komentar-user">
                <h3>${review.patient || "Pengguna Tanpa Nama"}</h3>
                <p>${review.review}</p>
              </div>
            </div>
          `
          )
          .join("");
        ulasanPengguna.style.display = "block";
      } else {
        userReviewsContainer.innerHTML = "<p>Tidak ada ulasan pengguna.</p>";
        ulasanPengguna.style.display = "none";
      }
    }

    // Render ketersediaan (availability)
    const availabilityTimes = document.getElementById("availabilityTimes");
    if (availabilityTimes) {
      availabilityTimes.innerHTML =
        psikolog.availability === "available"
          ? "<span class='jadwal-hijau'>Tersedia</span>"
          : "<span class='jadwal-merah'>Tidak Tersedia</span>";
    }

    // --- BUTTON DAFTAR KONSELING SESUAI STATUS ---
    const btnDaftar = document.getElementById("btnDaftar");
    if (btnDaftar) {
      btnDaftar.dataset.status = psikolog.availability;
      if (psikolog.availability === "available") {
        btnDaftar.style.display = "block";
        btnDaftar.textContent = "Konseling";
        btnDaftar.onclick = function () {
          // Tampilkan modal pilihan
          const modalEl = document.getElementById("modalPilihKonseling");
          modalEl.classList.add("modal-bottom");
          const modal = new bootstrap.Modal(modalEl);
          modal.show();

          // Pilihan Chat Sekarang
          const btnChatSekarang = document.getElementById("btnChatSekarang");
          if (btnChatSekarang) {
            btnChatSekarang.onclick = function () {
              window.location.href = `/jadwalkonseling-isidata?id=${psikolog.id}&mode=chat`;
            };
          }
          // Pilihan Jadwalkan
          const btnJadwalkan = document.getElementById("btnJadwalkan");
          if (btnJadwalkan) {
            btnJadwalkan.onclick = function () {
              window.location.href = `/jadwalpsikolog?id=${psikolog.id}`;
            };
          }
        };
      } else {
        btnDaftar.style.display = "block";
        btnDaftar.textContent = "Jadwalkan Konseling";
        btnDaftar.onclick = function () {
          window.location.href = `/jadwalpsikolog?id=${psikolog.id}`;
        };
      }
    }
  } catch (error) {
    console.error("Error rendering article details:", error);
    const btnDaftar = document.getElementById("btnDaftar");
    if (btnDaftar) btnDaftar.style.display = "none";
  }
}

// Satu event listener saja untuk semua interaksi
document.addEventListener("DOMContentLoaded", function () {
  renderArticleDetails();

  const btnDaftar = document.getElementById("btnDaftar");
  const urlParams = new URLSearchParams(window.location.search);
  const psikologId = urlParams.get("id");

  if (btnDaftar) {
    btnDaftar.onclick = function () {
      // Cek status available dari atribut data-status
      if (btnDaftar.dataset.status === "available") {
        const modalEl = document.getElementById("modalPilihKonseling");
        // Tambahkan class modal-bottom
        modalEl.classList.add("modal-bottom");
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
      } else {
        // Jika tidak tersedia, langsung redirect ke jadwal psikolog
        window.location.href = `/jadwalpsikolog?id=${psikologId}`;
      }
    };
  }

  const btnChatSekarang = document.getElementById("btnChatSekarang");
  const btnJadwalkan = document.getElementById("btnJadwalkan");

  if (btnChatSekarang) {
    btnChatSekarang.onclick = function () {
      window.location.href = `/jadwalkonseling-isidata?id=${psikologId}&mode=chat`;
    };
  }
  if (btnJadwalkan) {
    btnJadwalkan.onclick = function () {
      window.location.href = `/jadwalpsikolog?id=${psikologId}`;
    };
  }
});
