const articleSection = document.getElementById("container-psikolog");
const loadingIndicator = document.getElementById("loading-indicator");

(async () => {
  const apiUrl =
    "https://mentalwell10-api-production.up.railway.app/psychologists/list";
  loadingIndicator.style.display = "block";
  const token = sessionStorage.getItem("authToken");

  try {
    const response = await fetch(apiUrl, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const data = await response.json();

    loadingIndicator.style.display = "none";
    if (data.status === "success") {
      renderPsikologList(data.data);
      sessionStorage.setItem("all_psikolog", JSON.stringify(data.data || []));
    } else {
      const errorElement = document.createElement("div");
      errorElement.classList.add("error-message");
      errorElement.innerText = "Gagal memuat data psikolog.";
      articleSection.appendChild(errorElement);
    }
  } catch (error) {
    console.error("Error fetching data from API:", error);
    loadingIndicator.style.display = "none";
  }
})();

function renderPsikologList(data) {
  articleSection.innerHTML = "";
  data.forEach((articleData) => {
    const articleElement = document.createElement("div");
    articleElement.classList.add("content-psikolog");
    let formattedTopics = articleData.topics
      ? articleData.topics.map((topic) => topic.name).join(", ")
      : "-";
    let formattedketersediaan =
      articleData.availability === "available"
        ? "Chat Sekarang"
        : "Jadwalkan Sesi";
    articleElement.innerHTML = `
      <img class="image-psikolog" src="${
        articleData.profile_image
      }" alt="man" />
      <div class="data-psikolog">
        <h2>${articleData.name}</h2>
        <div class="value-psikolog">
          <p>Topik: ${formattedTopics}</p>
        </div>
        <div class="list-button-psikolog">
          <div class="${
            articleData.availability === "available"
              ? "jadwal-hijau"
              : "jadwal-abu"
          }">
            <p>${formattedketersediaan}</p>
          </div>
          <div class="button-psikolog">
            <button type="button" onclick="redirectToDetailPsychologist('${
              articleData.id
            }', '${articleData.availability === "available" ? "chat" : ""}')">
              Lihat Selengkapnya
            </button>
          </div>
        </div>
      </div>
    `;
    articleSection.appendChild(articleElement);
  });
}

document.querySelectorAll(".filter-checkbox").forEach((checkbox) => {
  checkbox.addEventListener("change", function () {
    applyFilters();
  });
});

// Tambahkan event listener untuk search form
const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("search-psikolog");

if (searchForm) {
  searchForm.addEventListener("submit", function (event) {
    event.preventDefault();
    applyFilters();
  });
}

function applyFilters() {
  const allPsikolog = JSON.parse(
    sessionStorage.getItem("all_psikolog") || "[]"
  );

  const checked = Array.from(
    document.querySelectorAll(".filter-checkbox:checked")
  );
  const searchValue = searchInput ? searchInput.value.trim().toLowerCase() : "";

  let filtered = allPsikolog;

  // Filter berdasarkan checkbox topics
  if (checked.length > 0) {
    const selectedValues = checked.map((cb) => cb.value);
    filtered = filtered.filter(
      (psikolog) =>
        psikolog.topics &&
        psikolog.topics.some((topic) =>
          selectedValues.includes(String(topic.id))
        )
    );
  }

  // Filter berdasarkan nama (search text)
  if (searchValue !== "") {
    filtered = filtered.filter((psikolog) =>
      psikolog.name.toLowerCase().includes(searchValue)
    );
  }

  renderPsikologList(filtered);
}

function redirectToDetailPsychologist(id, mode = "") {
  const token = sessionStorage.getItem("authToken");
  if (!token) {
    Swal.fire({
      icon: "warning",
      title: "Masuk Akun Dahulu",
      text: "Silakan masuk akun untuk melakukan daftar konseling.",
      confirmButtonText: "Ya",
      allowOutsideClick: false,
    });
    return;
  }
  window.location.href = `/profilpsikolog?id=${id}${
    mode ? `&mode=${mode}` : ""
  }`;
}
