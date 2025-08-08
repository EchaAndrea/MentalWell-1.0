// Fetch article detail dari API
async function fetchArticleById(articleId) {
  try {
    const response = await fetch(
      `https://mentalwell10-api-production.up.railway.app/articles/${articleId}`
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    return data.article;
  } catch (error) {
    console.error("Error fetching article data:", error);
    throw error;
  }
}

function formatDateTime(dateString) {
  const dateObject = new Date(dateString);
  const day = dateObject.getDate();
  const monthIndex = dateObject.getMonth();
  const year = dateObject.getFullYear();
  const hours = dateObject.getHours();
  const minutes = dateObject.getMinutes();

  const monthNames = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  const formattedTime = `${hours < 10 ? "0" : ""}${hours}:${
    minutes < 10 ? "0" : ""
  }${minutes}`;
  return `${day} ${monthNames[monthIndex]} ${year}, ${formattedTime}`;
}

async function renderArticleDetails() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const articleId = urlParams.get("id");

    if (!articleId) {
      throw new Error("ID artikel tidak ditemukan di URL.");
    }

    const articleData = await fetchArticleById(articleId);

    document.getElementById(
      "judul-detail-articel"
    ).innerHTML = `<h2>${articleData.title}</h2>`;
    document.getElementById(
      "created-articel"
    ).innerHTML = `<time>Ditulis pada: ${formatDateTime(
      articleData.created_at
    )}</time>`;
    document.getElementById(
      "image-detail-articel"
    ).innerHTML = `<img src="${articleData.image}" alt="image detail article" />`;
    document.getElementById("content-detail-articel").innerHTML = `<p>${
      articleData.content ? articleData.content.replace(/\n/g, "<br>") : ""
    }</p>`;
    document.getElementById(
      "referensi-articel"
    ).innerHTML = `<p>Referensi: <br> ${
      articleData.references
        ? articleData.references.replace(/\n/g, "<br>")
        : ""
    }</p>`;
  } catch (error) {
    console.error("Error rendering article details:", error);
  }
}

renderArticleDetails();
