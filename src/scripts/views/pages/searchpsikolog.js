document.addEventListener("DOMContentLoaded", function () {
  let searchForm = document.getElementById("searchForm");
  let searchInput = document.getElementById("search-psikolog");
  let contentArticle = document.getElementById("container-psikolog");

  // Function untuk search by name
  searchForm.addEventListener("submit", function (event) {
    event.preventDefault();
    let searchValue = searchInput.value.trim();

    if (searchValue === "") {
      // Jika search kosong, ambil data dari sessionStorage dan tampilkan semua
      const allPsikolog = JSON.parse(
        sessionStorage.getItem("all_psikolog") || "[]"
      );
      if (window.renderPsikologList) {
        window.renderPsikologList(allPsikolog);
      }
      return;
    }

    // Filter berdasarkan nama dari data yang sudah ada di sessionStorage
    const allPsikolog = JSON.parse(
      sessionStorage.getItem("all_psikolog") || "[]"
    );
    const filteredByName = allPsikolog.filter(
      (psikolog) =>
        psikolog.name &&
        psikolog.name.toLowerCase().includes(searchValue.toLowerCase())
    );

    if (window.renderPsikologList) {
      window.renderPsikologList(filteredByName);
    }
  });

  // Clear search when input is cleared
  searchInput.addEventListener("input", function () {
    if (this.value.trim() === "") {
      const allPsikolog = JSON.parse(
        sessionStorage.getItem("all_psikolog") || "[]"
      );
      if (window.renderPsikologList) {
        window.renderPsikologList(allPsikolog);
      }
    }
  });
});
