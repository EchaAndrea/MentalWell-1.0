const articleSection = document.getElementById("container-psikolog");
const loadingIndicator = document.getElementById("loading-indicator");

// Fetch data psikolog
(async function () {
  try {
    loadingIndicator.style.display = "block";

    const token = sessionStorage.getItem("authToken");

    const headers = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(
      "https://mentalwell10-api-production.up.railway.app/psychologists/list",
      {
        method: "GET",
        headers: headers,
      }
    );

    const responseData = await response.json();

    if (response.ok && responseData.status === "success") {
      loadingIndicator.style.display = "none";
      console.log("Data psikolog yang diterima:", responseData.data);
      renderPsikologList(responseData.data);
      sessionStorage.setItem(
        "all_psikolog",
        JSON.stringify(responseData.data || [])
      );
    } else {
      loadingIndicator.style.display = "none";
      Swal.fire({
        title: "Gagal!",
        text: responseData.message || "Gagal memuat data psikolog.",
        icon: "error",
        showConfirmButton: true,
      });
    }
  } catch (error) {
    console.error("Error fetching psychologist data:", error);
    loadingIndicator.style.display = "none";
    Swal.fire({
      title: "Gagal!",
      text: "Terjadi kesalahan. Silahkan coba lagi.",
      icon: "error",
      showConfirmButton: true,
    });
  }
})();

function renderPsikologList(data) {
  articleSection.innerHTML = "";

  if (!data || data.length === 0) {
    const noDataElement = document.createElement("div");
    noDataElement.classList.add("no-data-message");
    noDataElement.innerText =
      "Tidak ada psikolog yang sesuai dengan filter yang dipilih.";
    articleSection.appendChild(noDataElement);
    return;
  }

  data.forEach((articleData) => {
    const articleElement = document.createElement("div");
    articleElement.classList.add("content-psikolog");

    let formattedTopics = "-";
    if (
      articleData.topics &&
      Array.isArray(articleData.topics) &&
      articleData.topics.length > 0
    ) {
      formattedTopics = articleData.topics
        .map((topic) => topic.name)
        .join(", ");
    }

    let formattedketersediaan =
      articleData.availability === "available"
        ? "Chat Sekarang"
        : "Jadwalkan Sesi";

    articleElement.innerHTML = `
      <img class="image-psikolog" src="${
        articleData.profile_image || "default-profile.png"
      }" alt="Foto Psikolog" />
      <div class="data-psikolog">
        <h2>${articleData.name || "Nama tidak tersedia"}</h2>
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
    const allPsikolog = JSON.parse(
      sessionStorage.getItem("all_psikolog") || "[]"
    );

    console.log("All psikolog data:", allPsikolog);

    const checkedBoxes = Array.from(
      document.querySelectorAll(".filter-checkbox:checked")
    );

    console.log(
      "Checked boxes:",
      checkedBoxes.map((cb) => cb.value)
    );

    // Jika tidak ada yang diceklis, tampilkan semua psikolog
    if (checkedBoxes.length === 0) {
      console.log("No filters selected, showing all psychologists");
      renderPsikologList(allPsikolog);
      return;
    }

    // Ambil nilai dari checkbox yang diceklis
    const selectedTopicIds = checkedBoxes.map((cb) => cb.value);

    // Filter psikolog berdasarkan topik
    const filteredPsikolog = allPsikolog.filter((psikolog) => {
      if (
        !psikolog.topics ||
        !Array.isArray(psikolog.topics) ||
        psikolog.topics.length === 0
      ) {
        return false;
      }

      // Cek topik psikolog yang sesuai
      const hasMatchingTopic = psikolog.topics.some((topic) =>
        selectedTopicIds.includes(String(topic.id))
      );

      console.log(
        `Psikolog ${psikolog.name} topics:`,
        psikolog.topics,
        "matches:",
        hasMatchingTopic
      ); // Debug log
      return hasMatchingTopic;
    });

    console.log("Filtered psikolog:", filteredPsikolog); // Debug log
    renderPsikologList(filteredPsikolog);
  });
});

async function redirectToDetailPsychologist(id, mode = "") {
  try {
    const token = sessionStorage.getItem("authToken");
    if (!token) {
      const result = await Swal.fire({
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
  } catch (error) {
    console.error("Redirect error:", error);
    Swal.fire({
      title: "Gagal!",
      text: "Terjadi kesalahan. Silahkan coba lagi.",
      icon: "error",
      showConfirmButton: true,
    });
  }
}
