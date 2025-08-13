const articleSection = document.getElementById("container-rekomendasi");
const loadingIndicator = document.getElementById("loading-indicator");
const apiUrl =
  "https://mentalwell10-api-production.up.railway.app/psychologists/list";

loadingIndicator.style.display = "block";

fetch(apiUrl)
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
    data.data.forEach((psikolog) => {
      const el = document.createElement("div");
      el.classList.add("content-rekomendasi");
      el.innerHTML = `
        <div class="rekomendasi-image">
          <img src="${psikolog.profile_image}" alt="${psikolog.name}" />
        </div>
        <h2 class="nama-psikolog">${psikolog.name}</h2>
        <div class="btn-detail">
          <button type="button" onclick="redirectToDetailPsychologist('${psikolog.id}')">
            Lihat Detail
          </button>
        </div>
      `;
      articleSection.appendChild(el);
    });
  })
  .catch((error) => {
    loadingIndicator.style.display = "none";
    articleSection.innerHTML = `<p>Gagal mengambil data psikolog: ${error.message}</p>`;
    console.error("Error fetching data from API:", error);
  });

function redirectToDetailPsychologist(id) {
  window.location.href = `/profilpsikolog?id=${id}`;
}

const logosContainer2 = document.querySelector(".logos-2");
let scrollAmount2 = 0;
const scrollSpeed2 = 1.5; 

function scroll2() {
  scrollAmount2 += scrollSpeed2;

  if (scrollAmount2 >= logosContainer2.scrollWidth - logosContainer2.clientWidth) {
    scrollAmount2 = 0;
  }

  logosContainer2.scrollLeft = scrollAmount2;
  requestAnimationFrame(scroll2);
}

scroll2();