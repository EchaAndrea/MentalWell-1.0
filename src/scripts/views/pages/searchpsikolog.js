document.addEventListener("DOMContentLoaded", function () {
  let searchForm = document.getElementById("searchForm");
  let searchInput = document.getElementById("search-psikolog");
  let checkboxes = document.querySelectorAll(".filter-checkbox");

  // Function untuk filter dan search gabungan
  function filterAndSearch() {
    const allPsikolog = JSON.parse(
      sessionStorage.getItem("all_psikolog") || "[]"
    );
    let filteredData = [...allPsikolog];

    // 1. Filter berdasarkan checkbox topik terlebih dahulu
    const checkedBoxes = Array.from(checkboxes).filter((cb) => cb.checked);
    if (checkedBoxes.length > 0) {
      const selectedTopicIds = checkedBoxes.map((cb) => cb.value);
      filteredData = filteredData.filter((psikolog) => {
        if (
          !psikolog.topics ||
          !Array.isArray(psikolog.topics) ||
          psikolog.topics.length === 0
        ) {
          return false;
        }
        return psikolog.topics.some((topic) =>
          selectedTopicIds.includes(String(topic.id))
        );
      });
    }

    // 2. Filter berdasarkan nama jika ada input search
    const searchValue = searchInput.value.trim();
    if (searchValue !== "") {
      filteredData = filteredData.filter(
        (psikolog) =>
          psikolog.name &&
          psikolog.name.toLowerCase().includes(searchValue.toLowerCase())
      );
    }

    // 3. Render hasil filter
    if (window.renderPsikologList) {
      window.renderPsikologList(filteredData);
    }
  }

  // Event listener untuk form search
  searchForm.addEventListener("submit", function (event) {
    event.preventDefault();
    filterAndSearch();
  });

  // Event listener untuk checkbox
  checkboxes.forEach(function (checkbox) {
    checkbox.addEventListener("change", function () {
      filterAndSearch();
    });
  });

  // Event listener untuk clear search
  searchInput.addEventListener("input", function () {
    // Jika search dikosongkan, tapi masih ada checkbox yang diceklis
    if (this.value.trim() === "") {
      filterAndSearch();
    }
  });
});
