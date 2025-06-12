const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const contentArticle = document.getElementById("content-articel");

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const searchTerm = searchInput.value.trim(); // Ambil di sini!

  if (searchTerm !== "") {
    const apiUrl = `https://mentalwell10-api-production.up.railway.app/articles?title=${encodeURIComponent(
      searchTerm
    )}`;

    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        console.log("Hasil fetch:", data); // Tambahkan ini
        console.log("searchTerm:", searchTerm); // Tambahkan ini
        contentArticle.innerHTML = "";

        // Filter judul yang mengandung kata kunci (case-insensitive)
        const filteredArticles = (data.articles || []).filter((articleData) =>
          articleData.title.toLowerCase().includes(searchTerm.toLowerCase())
        );

        filteredArticles.forEach((articleData) => {
          console.log("Artikel ditemukan:", articleData); // Tambahkan ini
          const articleElement = document.createElement("article");
          articleElement.innerHTML = `
          <div class="image-articel">
          <img src="${articleData.image}" alt="articel">
          </div>
          <div class="isi-articel">
              <h2>${articleData.title}</h2>
              <div class="content"> 
                <p id="contentParagraph">${articleData.content}</p>
              </div>
              <div class="button-articel">
              <button type="button" onclick="redirectToDetail('${articleData.id}')"> Baca Selengkapnya</button>
              </div>
          </div>
          `;
          contentArticle.appendChild(articleElement);
        });

        // Jika tidak ada hasil
        if (filteredArticles.length === 0) {
          contentArticle.innerHTML = "<p>Tidak ada artikel ditemukan.</p>";
        }
      })
      .catch((error) => {
        console.error("Error fetching search results:", error);
      });
  } else {
    fetch("https://mentalwell10-api-production.up.railway.app/articles")
      .then((response) => response.json())
      .then((data) => {
        contentArticle.innerHTML = "";

        // Perbaikan di sini juga: akses data.articles
        (data.articles || []).forEach((articleData) => {
          const articleElement = document.createElement("article");

          articleElement.innerHTML = `
          <div class="image-articel">
          <img src="${articleData.image}" alt="articel">
          </div>
          <div class="isi-articel">
              <h2>${articleData.title}</h2>
              <div class="content"> 
                <p id="contentParagraph">${articleData.content}</p>
              </div>
              <div class="button-articel">
              <button type="button" onclick="redirectToDetail('${articleData.id}')"> Baca Selengkapnya</button>
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

function redirectToDetail(id) {
  window.location.href = `/detailartikel?id=${id}`;
}
