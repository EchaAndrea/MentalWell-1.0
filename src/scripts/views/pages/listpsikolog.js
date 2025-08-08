const articleSection = document.getElementById("container-psikolog");
const loadingIndicator = document.getElementById("loading-indicator");

(async () => {
  loadingIndicator.style.display = "block";
  const token = sessionStorage.getItem("authToken");

  try {
    const response = await fetch(
      "https://mentalwell10-api-production.up.railway.app/psychologists/list",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      }
    );

    const data = await response.json();

    if (response.ok && data.status === "success") {
      loadingIndicator.style.display = "none";
      renderPsikologList(data.data);
      sessionStorage.setItem("all_psikolog", JSON.stringify(data.data || []));
    } else {
      loadingIndicator.style.display = "none";
      const errorElement = document.createElement("div");
      errorElement.classList.add("error-message");
      errorElement.innerText = data.message || "Gagal memuat data psikolog.";
      articleSection.appendChild(errorElement);
    }
  } catch (error) {
    console.error("Error fetching data from API:", error);
    loadingIndicator.style.display = "none";
    const errorElement = document.createElement("div");
    errorElement.classList.add("error-message");
    errorElement.innerText = "Terjadi kesalahan. Silahkan coba lagi.";
    articleSection.appendChild(errorElement);
  }
})();

function renderPsikologList(data) {
  articleSection.innerHTML = "";
  data.forEach((articleData) => {
    const articleElement = document.createElement("div");
    articleElement.classList.add("content-psikolog");

    // Format topics dengan batasan 4 topik
    let formattedTopics = "-";
    if (articleData.topics && articleData.topics.length > 0) {
      const topicNames = articleData.topics.map((topic) => topic.name);
      if (topicNames.length <= 4) {
        formattedTopics = topicNames.join(", ");
      } else {
        const firstFour = topicNames.slice(0, 4);
        const remaining = topicNames.length - 4;
        formattedTopics = firstFour.join(", ") + `, +${remaining} lainnya`;
      }
    }

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

  // Debug logging
  console.log("Total psikolog:", allPsikolog.length);
  console.log("Checked checkboxes:", checked.length);
  console.log("Search value:", searchValue);

  // Filter berdasarkan checkbox topics
  if (checked.length > 0) {
    const selectedValues = checked.map((cb) => cb.value);
    console.log("Selected topic IDs:", selectedValues);

    filtered = filtered.filter((psikolog) => {
      if (!psikolog.topics || psikolog.topics.length === 0) {
        return false;
      }

      const hasMatchingTopic = psikolog.topics.some((topic) =>
        selectedValues.includes(String(topic.id))
      );

      if (hasMatchingTopic) {
        console.log(
          "Psikolog matched:",
          psikolog.name,
          "topics:",
          psikolog.topics.map((t) => t.name)
        );
      }

      return hasMatchingTopic;
    });

    console.log("After topic filter:", filtered.length);
  }

  // Filter berdasarkan nama dan topik (search text)
  if (searchValue !== "") {
    filtered = filtered.filter((psikolog) => {
      // Search di nama
      const nameMatch = psikolog.name.toLowerCase().includes(searchValue);

      // Search di topik
      const topicMatch =
        psikolog.topics &&
        psikolog.topics.some((topic) =>
          topic.name.toLowerCase().includes(searchValue)
        );

      return nameMatch || topicMatch;
    });

    console.log("After search filter:", filtered.length);
  }

  console.log("Final filtered results:", filtered.length);
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
