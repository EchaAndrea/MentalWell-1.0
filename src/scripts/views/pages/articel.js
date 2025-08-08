const articleSection = document.getElementById("content-articel");
const loadingIndicator = document.getElementById("loading-indicator");

loadingIndicator.style.display = "block";

function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

// Fetch articles dari API
async function fetchArticles() {
  try {
    const response = await fetch(
      "https://mentalwell10-api-production.up.railway.app/articles",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (response.ok) {
      loadingIndicator.style.display = "none";

      data.articles.forEach((articleData) => {
        const articleElement = document.createElement("article");
        const truncatedContent = truncateText(articleData.content, 160);

        articleElement.innerHTML = `
          <div class="image-articel">
            <img src="${articleData.image}" alt="articel">
          </div>
          <div class="isi-articel">
            <h2>${articleData.title}</h2>
            <div class="content"> 
              <p>${truncatedContent}</p>
            </div>
            <div class="button-articel">
              <button type="button" onclick="redirectToDetail('${articleData.id}')">Baca Selengkapnya</button>
            </div>
          </div>
        `;

        articleSection.appendChild(articleElement);
      });
    } else {
      console.error(
        "Error fetching articles:",
        data.message || "Failed to fetch articles"
      );
      loadingIndicator.style.display = "none";
    }
  } catch (error) {
    console.error("Error fetching articles:", error);
    loadingIndicator.style.display = "none";
  }
}

fetchArticles();

function redirectToDetail(id) {
  window.location.href = `/detailartikel?id=${id}`;
}
