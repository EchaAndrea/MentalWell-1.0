// Function to fetch data from the API based on article ID
async function fetchArticleById(articleId) {
  try {
    // Ganti URL agar pakai articleId
    const response = await fetch(
      `https://mentalwell10-api-production.up.railway.app/articles/${articleId}`
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    // Ambil data dari data.article, bukan data[0]
    return data.article;
  } catch (error) {
    console.error("Error fetching article data:", error);
    throw error; // Re-throw the error to propagate it further
  }
}

function formatDateTime(dateString) {
  const dateObject = new Date(dateString);
  const day = dateObject.getDate();
  const monthIndex = dateObject.getMonth();
  const year = dateObject.getFullYear();
  const hours = dateObject.getHours();
  const minutes = dateObject.getMinutes();

  // Nama bulan dalam bahasa Indonesia
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

  // Format jam dan menit dengan leading zero jika kurang dari 10
  const formattedTime = `${hours < 10 ? "0" : ""}${hours}:${
    minutes < 10 ? "0" : ""
  }${minutes}`;

  const formattedDateTime = `${day} ${monthNames[monthIndex]} ${year}, ${formattedTime}`;
  return formattedDateTime;
}

async function renderArticleDetails() {
  try {
    // Mendapatkan ID artikel dari URL
    const urlParams = new URLSearchParams(window.location.search);
    const articleId = urlParams.get("id");
    console.log("Article ID:", articleId); // Debug

    if (!articleId) {
      throw new Error("ID artikel tidak ditemukan di URL.");
    }

    // Mendapatkan elemen HTML untuk menampilkan data artikel
    const judulDetailArticel = document.getElementById("judul-detail-articel");
    const createdArticel = document.getElementById("created-articel");
    const imageDetailArticel = document.getElementById("image-detail-articel");
    const contentDetailArticel = document.getElementById(
      "content-detail-articel"
    );
    const referensiArticel = document.getElementById("referensi-articel");

    const articleData = await fetchArticleById(articleId);

    const formattedDateTime = formatDateTime(articleData.created_at);
    createdArticel.innerHTML = `<time> Ditulis pada: ${formattedDateTime}</time>`;

    judulDetailArticel.innerHTML = `<h2>${articleData.title}</h2>`;
    imageDetailArticel.innerHTML = `<img src="${articleData.image}" alt="image detail artice" />`;
    const formattedContent = articleData.content
      ? articleData.content.replace(/\n/g, "<br>")
      : "";
    contentDetailArticel.innerHTML = `<p>${formattedContent}</p>`;
    const formattedReferences = articleData.references
      ? articleData.references.replace(/\n/g, "<br>")
      : "";
    referensiArticel.innerHTML = `<p>Referensi : <br> ${formattedReferences}<p>`;
  } catch (error) {
    console.error("Error rendering article details:", error);
  }
}

renderArticleDetails();
