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

    // Ambil data dari API
    const articleData = await fetchArticleById(articleId);

    // Render foto
    const fotopsikolog = document.getElementById("psychologProfile");
    if (fotopsikolog) fotopsikolog.src = articleData.profile_image;

    // Render nama dan bio
    const datapsikolog = document.querySelector(".data-psikolog h2");
    if (datapsikolog) datapsikolog.textContent = articleData.name;

    const biodatapsikolog = document.getElementById("biodata-psikolog");
    if (biodatapsikolog)
      biodatapsikolog.innerHTML = `<p>${articleData.bio}</p>`;

    // Render pengalaman praktik
    const pengalamanpraktik = document.getElementById("praktik");
    if (pengalamanpraktik)
      pengalamanpraktik.textContent = articleData.experience || "-";

    // Render topik keahlian
    const topicList = document.getElementById("topiclist");
    if (topicList) {
      if (articleData.topics && articleData.topics.length > 0) {
        topicList.innerHTML = articleData.topics
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
      if (articleData.reviews && articleData.reviews.length > 0) {
        userReviewsContainer.innerHTML = articleData.reviews
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
        articleData.availability === "available"
          ? "<span class='jadwal-hijau'>Tersedia</span>"
          : "<span class='jadwal-merah'>Tidak Tersedia</span>";
    }

    // Update button state sesuai availability
    updateButtonState(articleData.availability);
  } catch (error) {
    console.error("Error rendering article details:", error);
  }
}

// Jalankan saat halaman siap
document.addEventListener("DOMContentLoaded", renderArticleDetails);

async function fetchPsychologistAvailability() {
  const urlParams = new URLSearchParams(window.location.search);
  const psychologistId = urlParams.get("id");
  if (!psychologistId) {
    // Jangan fetch jika id tidak ada
    return;
  }
  const url = `https://mentalwell10-api-production.up.railway.app/availability/psychologist/${psychologistId}`;

  try {
    showLoadingIndicator();
    const response = await fetch(url);
    const data = await response.json();

    // Update the button state directly based on availability
    updateButtonState(data.availability);
    hideLoadingIndicator();
  } catch (error) {
    console.error(error);
    // Handle the error as needed
    hideLoadingIndicator();
  }
}

function updateButtonState(availability) {
  const btnDaftar = document.getElementById("btnDaftar");
  if (!btnDaftar) return;
  btnDaftar.disabled = false;
  btnDaftar.classList.remove("disabled");
}

function showLoadingIndicator() {
  // Get loading indicator element and show it
  const loadingIndicator = document.getElementById("loading-indicator");
  loadingIndicator.style.display = "block";
}

function hideLoadingIndicator() {
  // Hide loading indicator
  const loadingIndicator = document.getElementById("loading-indicator");
  loadingIndicator.style.display = "none";
}

// Render artikel details ketika halaman dimuat
renderArticleDetails();
fetchPsychologistAvailability();

const logosContainer2 = document.querySelector(".logos-2");
const originalLogosContainer2 = document.querySelector(".logos-2");
const clone2 = originalLogosContainer2.cloneNode(true);
originalLogosContainer2.parentNode.insertBefore(
  clone2,
  originalLogosContainer2.nextSibling
);

let scrollAmount2 = 0;
const scrollSpeed2 = 2;

function scroll2() {
  scrollAmount2 += scrollSpeed2;
  originalLogosContainer2.scrollLeft = scrollAmount2;

  // Reset to the beginning when it reaches the end
  if (
    scrollAmount2 >=
    originalLogosContainer2.scrollWidth - originalLogosContainer2.clientWidth
  ) {
    scrollAmount2 = 0;
  }

  requestAnimationFrame(scroll2);
}

scroll2();

function redirectToDetailPsychologist(id) {
  window.location.href = `/jadwalpsikolog?id=${psikologId}`;
}

document.addEventListener("DOMContentLoaded", function () {
  const btnDaftar = document.getElementById("btnDaftar");
  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get("mode");
  const psikologId = urlParams.get("id");

  if (btnDaftar) {
    btnDaftar.onclick = function () {
      if (mode === "chat") {
        // Langsung ke halaman isi data (jadwalkonseling) dengan mode chat
        window.location.href = `/jadwalkonseling?mode=chat&id=${psikologId}`;
      } else {
        // Alur biasa (jadwalkan)
        window.location.href = `/jadwalpsikolog?id=${psikologId}`;
      }
    };
  }
});
