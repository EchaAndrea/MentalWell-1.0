const articleSection = document.getElementById("container-psikolog");
const loadingIndicator = document.getElementById("loading-indicator");
const apiUrl =
  "https://mentalwell10-api-production.up.railway.app/psychologists/list";

loadingIndicator.style.display = "block";

const token = localStorage.getItem("token");

fetch(apiUrl, {
  headers: token ? { Authorization: `Bearer ${token}` } : {},
})
  .then((response) => response.json())
  .then((data) => {
    loadingIndicator.style.display = "none";
    if (data.status === "success") {
      renderPsikologList(data.data);
      sessionStorage.setItem("all_psikolog", JSON.stringify(data.data || []));
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

function renderPsikologList(data) {
  articleSection.innerHTML = "";
  data.forEach((articleData) => {
    const articleElement = document.createElement("div");
    articleElement.classList.add("content-psikolog");
    let formattedExperience = articleData.experience || "-";
    let formattedketersediaan =
      articleData.availability === "available"
        ? "Tersedia"
        : "Tidak Tersedia";
    articleElement.innerHTML = `
      <img class="image-psikolog" src="${articleData.profile_image}" alt="man" />
      <div class="data-psikolog">
        <h2>${articleData.name}</h2>
        <div class="value-psikolog">
          <p>Pengalaman Kerja: ${formattedExperience}</p>
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
            <button type="button" onclick="redirectToDetailPsychologist('${articleData.id}', '${articleData.availability === "available" ? "chat" : ""}')">
              ${articleData.availability === "available" ? "Chat Sekarang" : "Lihat Selengkapnya"}
            </button>
          </div>
        </div>
      </div>
    `;
    articleSection.appendChild(articleElement);
  });
}

document.querySelectorAll('.filter-checkbox').forEach((checkbox) => {
  checkbox.addEventListener('change', function () {
    const allPsikolog = JSON.parse(sessionStorage.getItem("all_psikolog") || "[]");
    const checked = Array.from(document.querySelectorAll('.filter-checkbox:checked'));
    if (checked.length === 0) {
      renderPsikologList(allPsikolog);
      return;
    }
    const selectedValues = checked.map(cb => cb.value);
    const filtered = allPsikolog.filter(psikolog =>
      psikolog.topics && psikolog.topics.some(topic => selectedValues.includes(String(topic.id)))
    );
    renderPsikologList(filtered);
  });
});

function redirectToDetailPsychologist(id, mode = "") {
  const token = localStorage.getItem("token");
  if (!token) {
    Swal.fire({
      icon: 'warning',
      title: 'Masuk Akun Dahulu',
      text: 'Silakan masuk akun untuk melakukan daftar konseling.',
      confirmButtonText: 'Ya',
      allowOutsideClick: false,
    });
    return;
  }
  window.location.href = `/profilpsikolog?id=${id}${mode ? `&mode=${mode}` : ""}`;
}

function redirectToPembayaran(id) {
  window.location.href = `/jadwalkonseling-pembayaran?id=${id}&mode=chat`;
}

function redirectToRealtime(id) {
  const allPsikolog = JSON.parse(
    sessionStorage.getItem("all_psikolog") || "[]"
  );
  const selected = allPsikolog.find((p) => String(p.id) === String(id));
  if (selected) {
    sessionStorage.setItem("selected_psikolog", JSON.stringify(selected));
  }
  window.location.href = `/jadwalrealtime?id=${id}&mode=chat`;
}
