async function fetchPsikologById(psikologId) {
  try {
    const response = await fetch(
      `https://mentalwell10-api-production.up.railway.app/psychologists/${psikologId}`
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching psikolog data:", error);
    throw error; // Re-throw the error to propagate it further
  }
}

async function renderPsikologDetails() {
  try {
    // Mendapatkan ID psikolog dari URL
    const urlParams = new URLSearchParams(window.location.search);
    const psikologId = urlParams.get("id");
    // Mendapatkan elemen HTML untuk menampilkan data psikolog
    const fotopsikolog = document.querySelector(".foto-psikolog img");
    const datapsikolog = document.querySelector("h2");
    const biodatapsikolog = document.getElementById("biodata-psikolog");
    const pengalamanpraktik = document.getElementById("praktik");
    const topikKeahlian = document.getElementById("topik-keahlian"); // Updated ID
    const topicList = document.getElementById("topiclist");

    const psikologData = await fetchPsikologById(psikologId);
    // Menampilkan data psikolog pada elemen HTML
    fotopsikolog.src = `${psikologData.profile_image}`;
    datapsikolog.innerHTML = `${psikologData.name}`;
    biodatapsikolog.innerHTML = `<p>${psikologData.bio}</p>`;
    pengalamanpraktik.innerHTML = `${psikologData.experience}`;
    // Menampilkan topik-topik psikolog
    if (
      psikologData.psychologist_topics &&
      psikologData.psychologist_topics.length > 0
    ) {
      const topicsList = psikologData.psychologist_topics
        .map((topic) => `<li>${topic.topic_name}</li>`)
        .join("");
      topicList.innerHTML = topicsList;
      topikKeahlian.style.display = "block"; // Show the container if there are topics
    } else {
      topicList.innerHTML = "<li>Tidak ada topik.</li>";
      topikKeahlian.style.display = "none"; // Hide the container if there are no topics
    }

    const ulasanPengguna = document.getElementById("ulasan-pengguna");
    const userReviewsContainer = document.getElementById("userReviews");

    if (psikologData.counselings && psikologData.counselings.length > 0) {
      const userReviews = psikologData.counselings
        .map(
          (counseling) => `
          <div class="isi-ulasan">
            <img src="/src/public/beranda/man.png" alt="Foto User" id="userReview" />
            <div class="komentar-user">
              <h3>${counseling.patients || "Pengguna Tanpa Nama"}</h3>
              <p>${counseling.review}</p>
            </div>
          </div>
        `
        )
        .join("");
      userReviewsContainer.innerHTML = userReviews;
      ulasanPengguna.style.display = "block"; // Tampilkan kontainer jika ada ulasan pengguna
    } else {
      userReviewsContainer.innerHTML = "<p>Tidak ada ulasan pengguna.</p>";
      ulasanPengguna.style.display = "none"; // Sembunyikan kontainer jika tidak ada ulasan pengguna
    }
  } catch (error) {
    console.error("Error rendering psikolog details:", error);
  }
}

// Render psikolog details ketika halaman dimuat
renderPsikologDetails();
