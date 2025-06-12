const articleSection = document.getElementById("container-psikolog");
const loadingIndicator = document.getElementById("loading-indicator");
const apiUrl =
  "https://mentalwell10-api-production.up.railway.app/psychologists/list";

loadingIndicator.style.display = "block";

// Ambil token dari localStorage (atau sessionStorage) setelah login
const token = localStorage.getItem("token");

fetch(apiUrl, {
  headers: token ? { Authorization: `Bearer ${token}` } : {},
})
  .then((response) => response.json())
  .then((data) => {
    loadingIndicator.style.display = "none";
    if (data.status === "success") {
      (data.data || []).forEach((articleData) => {
        const articleElement = document.createElement("div");
        articleElement.classList.add("content-psikolog");

        let formattedExperience = articleData.experience || "-";
        let formattedketersediaan =
          articleData.availability === "available"
            ? "Tersedia"
            : "Tidak Tersedia";

        articleElement.innerHTML = `
          <img class="image-psikolog" src="${
            articleData.profile_image
          }" alt="man" />
          <div class="data-psikolog">
            <h2>${articleData.name}</h2>
            <div class="value-psikolog">
              <p>Pengalaman Kerja ${formattedExperience}</p>
            </div>
            <div class="list-button-psikolog">
              <div class="${
                articleData.availability === "available"
                  ? "jadwal-hijau"
                  : "jadwal-merah"
              }">
                <p>${formattedketersediaan}</p>
              </div>
              <div class="button-psikolog">
                <button type="button" onclick="redirectToDetailPsychologist('${
                  articleData.id
                }')">Lihat Selengkapnya</button>
              </div>
            </div>
          </div>
        `;
        articleSection.appendChild(articleElement);
      });
    } else {
      loadingIndicator.style.display = "none";
      const errorElement = document.createElement("div");
      errorElement.classList.add("error-message");
      errorElement.innerText = "Gagal memuat data psikolog.";
      articleSection.appendChild(errorElement);
    }
  })
  .catch((error) => {
    console.error("Error fetching data from API:", error);
    loadingIndicator.style.display = "none";
    const errorElement = document.createElement("div");
    errorElement.classList.add("error-message");
    errorElement.innerText = "Terjadi kesalahan pada server.";
    articleSection.appendChild(errorElement);
  });

function redirectToDetailPsychologist(id) {
  window.location.href = `/profilpsikolog?id=${id}`;
}
