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
    return articleElement;
  }

  // Function untuk search API
  async function searchPsikolog(searchValue, topicValues = []) {
    let backendURL =
      "https://mentalwell10-api-production.up.railway.app/psychologists/search";
    let queryParams = [];

    if (topicValues.length > 0) {
      queryParams.push(`topics=${encodeURIComponent(topicValues.join(","))}`);
    }

    if (searchValue !== "") {
      queryParams.push(`name=${encodeURIComponent(searchValue)}`);
    }

    let queryString = queryParams.join("&");
    let fullURL = queryString
      ? `${backendURL}?${queryString}`
      : "https://mentalwell10-api-production.up.railway.app/psychologists/list";

    try {
      const response = await fetch(fullURL, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      contentArticle.innerHTML = "";
      // Handle berbeda response format
      const results = data.result?.result || data.data || [];
      results.forEach((articleData) => {
        contentArticle.appendChild(renderPsikologCard(articleData));
      });
    } catch (error) {
      console.error("Error fetching results:", error);
    }
  }

  // Event listeners
  checkboxes.forEach(function (checkbox) {
    checkbox.addEventListener("click", function () {
      let checkedValues = Array.from(checkboxes)
        .filter((chk) => chk.checked)
        .map((chk) => chk.value);

      let searchValue = searchInput.value.trim();

      if (checkedValues.length > 0 || searchValue !== "") {
        searchPsikolog(searchValue, checkedValues);
      } else {
        contentArticle.innerHTML = "";
      }
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
