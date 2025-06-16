const articleSection = document.getElementById("container-rekomendasi");
const apiUrl =
  "https://mentalwell10-api-production.up.railway.app/psychologists/list";
const loadingIndicator = document.getElementById("loading-indicator");

loadingIndicator.style.display = "block";

const token = localStorage.getItem("token");

if (!token) {
  loadingIndicator.style.display = "none";
  articleSection.innerHTML =
    "<p>Token tidak ditemukan. Silakan login ulang.</p>";
} else {
  fetch(apiUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      loadingIndicator.style.display = "none";

      if (!data.data || data.data.length === 0) {
        articleSection.innerHTML = "<p>Data psikolog tidak ditemukan.</p>";
        return;
      }

      data.data.forEach((articleData) => {
        const articleElement = document.createElement("div");
        articleElement.classList.add("content-rekomendasi");

        articleElement.innerHTML = `
          <div class="rekomendasi-image">
            <img src="${articleData.profile_image}" alt="gambar orang" />
          </div>
          <h2 class="nama-psikolog">${articleData.name}</h2>
          <div class="btn-detail">
            <button type="button" onclick="redirectToDetailPsychologist('${articleData.id}')">
              Lihat Detail
            </button>
          </div>
        `;

        articleSection.appendChild(articleElement);
      });
    })
    .catch((error) => {
      loadingIndicator.style.display = "none";
      articleSection.innerHTML = `<p>Gagal mengambil data psikolog: ${error.message}</p>`;
      console.error("Error fetching data from API:", error);
    });
}

function redirectToDetailPsychologist(id) {
  window.location.href = `/profilpsikolog?id=${id}`;
}

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

  if (
    scrollAmount2 >=
    originalLogosContainer2.scrollWidth - originalLogosContainer2.clientWidth
  ) {
    scrollAmount2 = 0;
  }

  requestAnimationFrame(scroll2);
}

scroll2();
