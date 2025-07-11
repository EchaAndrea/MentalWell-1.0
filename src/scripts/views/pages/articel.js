const articleSection = document.getElementById("content-articel");
const loadingIndicator = document.getElementById("loading-indicator");
const apiUrl = "https://mentalwell10-api-production.up.railway.app/articles";

loadingIndicator.style.display = "block";

function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

fetch(apiUrl)
  .then((response) => response.json())
  .then((data) => {
    loadingIndicator.style.display = "none";

    // Perbaikan di sini: akses data.articles
    (data.articles || []).forEach((articleData) => {
      const articleElement = document.createElement("article");

      // Batasi isi artikel yang tampil, misal 120 karakter
      const truncatedContent = truncateText(articleData.content, 150);

      articleElement.innerHTML = `
                    <div class="image-articel">
                    <img src="${articleData.image}" alt="articel">
                    </div>
                    <div class="isi-articel">
                        <h2>${articleData.title}</h2>
                        <div class="content"> 
                          <p id="contentParagraph">${truncatedContent}</p>
                        </div>
                        <div class="button-articel">
                          <button type="button" onclick="redirectToDetail('${articleData.id}')"> Baca Selengkapnya</button>
                        </div>
                    </div>
                `;

      articleSection.appendChild(articleElement);
    });
  })
  .catch((error) => {
    console.error("Error fetching data from API:", error);
    loadingIndicator.style.display = "none";
  });

function redirectToDetail(id) {
  window.location.href = `/detailartikel?id=${id}`;
}
