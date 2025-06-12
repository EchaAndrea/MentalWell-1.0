document.addEventListener("DOMContentLoaded", function () {
  let checkboxes = document.querySelectorAll(".filter-checkbox");
  let contentArticle = document.getElementById("container-psikolog");
  let searchForm = document.getElementById("searchForm");
  let searchInput = document.getElementById("search-psikolog");

  let token = localStorage.getItem("token");

  checkboxes.forEach(function (checkbox) {
    checkbox.addEventListener("click", function () {
      let checkedValues = Array.from(checkboxes)
        .filter((chk) => chk.checked)
        .map((chk) => chk.value);

      let searchValue = searchInput.value.trim();

      if (checkedValues.length > 0 || searchValue !== "") {
        let backendURL =
          "https://mentalwell10-api-production.up.railway.app/psychologists/search";
        let queryParams = [];

        if (checkedValues.length > 0) {
          queryParams.push(
            `topics=${encodeURIComponent(checkedValues.join(","))}`
          );
        }

        if (searchValue !== "") {
          queryParams.push(`name=${encodeURIComponent(searchValue)}`);
        }

        let queryString = queryParams.join("&");
        let fullURL = `${backendURL}?${queryString}`;

        fetch(fullURL, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
          })
          .then((data) => {
            contentArticle.innerHTML = "";
            // Data ada di data.result.result (array)
            (data.result?.result || []).forEach((articleData) => {
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
              contentArticle.appendChild(articleElement);
            });
          })
          .catch((error) => {
            console.error("Error fetching results:", error);
          });
      } else {
        contentArticle.innerHTML = "";
      }
    });
  });

  searchForm.addEventListener("submit", function (event) {
    event.preventDefault();

    let searchValue = searchInput.value.trim();

    if (searchValue !== "") {
      let apiUrl = `https://mentalwell10-api-production.up.railway.app/psychologists/search?name=${encodeURIComponent(
        searchValue
      )}`;

      fetch(apiUrl, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          contentArticle.innerHTML = "";

          // Perbaiki akses array hasil
          (data.result?.result || []).forEach((articleData) => {
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
            contentArticle.appendChild(articleElement);
          });
        })
        .catch((error) => {
          console.error("Error fetching search results:", error);
        });
    } else {
      fetch(
        "https://mentalwell10-api-production.up.railway.app/psychologists/list",
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          contentArticle.innerHTML = "";

          // Perbaiki akses array hasil
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
            contentArticle.appendChild(articleElement);
          });
        })
        .catch((error) => {
          console.error("Error fetching all content:", error);
        });
    }
  });
});
