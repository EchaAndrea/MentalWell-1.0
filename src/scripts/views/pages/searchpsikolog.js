document.addEventListener("DOMContentLoaded", function () {
  let checkboxes = document.querySelectorAll(".filter-checkbox");
  let contentArticle = document.getElementById("container-psikolog");
  let searchForm = document.getElementById("searchForm");
  let searchInput = document.getElementById("search-psikolog");

  let token = sessionStorage.getItem("authToken");

  // Function untuk render psikolog cards
  function renderPsikologCard(articleData) {
    const articleElement = document.createElement("div");
    articleElement.classList.add("content-psikolog");

    // Format topics - pastikan menggunakan field yang benar
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
    return articleElement;
  }

  // Function untuk search API
  async function searchPsikolog(searchValue, topicValues = []) {
    try {
      console.log("=== SEARCH DEBUG ===");
      console.log("Search value:", searchValue);
      console.log("Topic values:", topicValues);

      let apiUrl =
        "https://mentalwell10-api-production.up.railway.app/psychologists/list";
      let queryParams = [];

      // Jika ada filter nama atau topik, gunakan endpoint search
      if (searchValue !== "" || topicValues.length > 0) {
        apiUrl =
          "https://mentalwell10-api-production.up.railway.app/psychologists/search";

        if (topicValues.length > 0) {
          queryParams.push(`topics=${topicValues.join(",")}`);
        }

        if (searchValue !== "") {
          queryParams.push(`name=${encodeURIComponent(searchValue)}`);
        }

        if (queryParams.length > 0) {
          apiUrl = `${apiUrl}?${queryParams.join("&")}`;
        }
      }

      console.log("Final API URL:", apiUrl);

      const headers = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: headers,
      });

      const responseData = await response.json();

      // Debug logging untuk melihat response
      console.log("API URL:", apiUrl);
      console.log("Search response:", responseData);
      console.log("Response data:", responseData.data);

      if (response.ok && responseData.status === "success") {
        contentArticle.innerHTML = "";

        const results = responseData.data || [];
        console.log("Results length:", results.length);

        if (results.length === 0) {
          const noDataElement = document.createElement("div");
          noDataElement.classList.add("no-data-message");
          noDataElement.innerText =
            "Tidak ada psikolog yang sesuai dengan pencarian.";
          contentArticle.appendChild(noDataElement);
          return;
        }

        results.forEach((articleData) => {
          contentArticle.appendChild(renderPsikologCard(articleData));
        });
      } else {
        contentArticle.innerHTML = "";
        Swal.fire({
          title: "Gagal!",
          text: responseData.message || "Gagal mencari data psikolog.",
          icon: "error",
          showConfirmButton: true,
        });
      }
    } catch (error) {
      console.error("Error fetching search results:", error);
      contentArticle.innerHTML = "";
      Swal.fire({
        title: "Gagal!",
        text: "Terjadi kesalahan saat mencari psikolog. Silahkan coba lagi.",
        icon: "error",
        showConfirmButton: true,
      });
    }
  }

  // Function untuk fetch semua psikolog
  async function fetchAllPsikolog() {
    try {
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
        sessionStorage.setItem(
          "all_psikolog",
          JSON.stringify(responseData.data || [])
        );

        contentArticle.innerHTML = "";
        responseData.data.forEach((articleData) => {
          contentArticle.appendChild(renderPsikologCard(articleData));
        });
      }
    } catch (error) {
      console.error("Error fetching all psychologists:", error);
    }
  }

  // Event listeners
  checkboxes.forEach(function (checkbox) {
    checkbox.addEventListener("change", function () {
      let checkedValues = Array.from(checkboxes)
        .filter((chk) => chk.checked)
        .map((chk) => chk.value);

      let searchValue = searchInput.value.trim();

      searchPsikolog(searchValue, checkedValues);
    });
  });

  searchForm.addEventListener("submit", function (event) {
    event.preventDefault();
    let searchValue = searchInput.value.trim();
    let checkedValues = Array.from(checkboxes)
      .filter((chk) => chk.checked)
      .map((chk) => chk.value);

    searchPsikolog(searchValue, checkedValues);
  });
});
