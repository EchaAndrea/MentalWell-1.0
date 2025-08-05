async function fetchPsikologById(psikologId) {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `https://mentalwell10-api-production.up.railway.app/psychologists/${psikologId}`,
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
    console.error("Error fetching psikolog data:", error);
    throw error;
  }
}

async function renderPsikologDetails() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const psikologId = urlParams.get("id");
    if (!psikologId) return;

    const psikologData = await fetchPsikologById(psikologId);
    // Jika API return {id:..., name:...}
    const psikolog =
      psikologData && psikologData.id ? psikologData : psikologData.data || {};

    // Render foto
    const fotopsikolog = document.getElementById("psychologProfile");
    if (fotopsikolog) fotopsikolog.src = psikolog.profile_image;

    // Render nama
    const datapsikolog = document.querySelector(".data-psikolog h2");
    if (datapsikolog) datapsikolog.textContent = psikolog.name;

    // Render harga
    const hargaElem = document.getElementById("harga-psikolog");
    if (hargaElem) {
      hargaElem.innerHTML = `Rp. ${psikolog.price?.toLocaleString(
        "id-ID"
      )} / 60 menit`;
    }

    // Render bio
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
              <img src="${
                review.profpic || "/src/public/beranda/man.png"
              }" alt="Foto User" id="userReview" />
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

    const logosContainer2 = document.querySelector(".logos-2");
    let scrollAmount2 = 0;
    const scrollSpeed2 = 2;

    function scroll2() {
      scrollAmount2 += scrollSpeed2;
      logosContainer2.scrollLeft = scrollAmount2;

      if (
        scrollAmount2 >=
        logosContainer2.scrollWidth - logosContainer2.clientWidth
      ) {
        scrollAmount2 = 0;
      }

      requestAnimationFrame(scroll2);
    }

    scroll2();

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
        btnDaftar.textContent = "Chat Sekarang";
        btnDaftar.className = "btn btn-success"; // Warna hijau
      } else {
        btnDaftar.style.display = "block";
        btnDaftar.textContent = "Jadwalkan Sesi";
        btnDaftar.className = "btn btn-secondary"; // Warna abu
      }
    }
  } catch (error) {
    console.error("Error rendering psikolog details:", error);
    const btnDaftar = document.getElementById("btnDaftar");
    if (btnDaftar) btnDaftar.style.display = "none";
  }
}

// Satu event listener saja untuk semua interaksi
document.addEventListener("DOMContentLoaded", function () {
  renderPsikologDetails();

  const btnDaftar = document.getElementById("btnDaftar");
  const urlParams = new URLSearchParams(window.location.search);
  const psikologId = urlParams.get("id");

  if (btnDaftar) {
    btnDaftar.onclick = function () {
      // Cek status available dari atribut data-status
      if (btnDaftar.dataset.status === "available") {
        // Jika tersedia, langsung buka modal pilihan konseling
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
      window.location.href = `/jadwalkonseling-isidata?id=${psikologId}&mode=realtime`;
    };
  }
  if (btnJadwalkan) {
    btnJadwalkan.onclick = function () {
      window.location.href = `/jadwalpsikolog?id=${psikologId}`;
    };
  }
});
