document.addEventListener("DOMContentLoaded", async () => {
  // Deklarasi variabel input di atas
  const judul = document.getElementById("judul");
  const kategori = document.getElementById("kategori");
  const tanggal = document.getElementById("tanggal");
  const konten = document.getElementById("konten");
  const references = document.getElementById("references");
  const gambar = document.getElementById("previewImage");
  const btnSimpan = document.getElementById("btnSimpan");
  const btnKembali = document.getElementById("btnKembali");

  const params = new URLSearchParams(window.location.search);
  const artikelId = params.get("artikel_id");
  if (!artikelId) return;

  let data;
  try {
    // Fetch semua artikel
    const articles = await fetchArticles();
    // Cari artikel sesuai id
    data = articles.find((a) => String(a.id) === String(artikelId));
    if (!data) throw new Error("Artikel tidak ditemukan");
  } catch (err) {
    Swal.fire({ icon: "error", title: "Gagal", text: err.message });
    return;
  }

  // Isi value input/textarea, dan set readonly/disabled
  if (judul) {
    judul.value = data.title || "";
    judul.readOnly = true;
  }
  if (kategori) {
    kategori.value = data.category || "-";
    kategori.readOnly = true;
  }
  if (tanggal) {
    tanggal.value = data.created_at
      ? new Date(data.created_at).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
      : "-";
    tanggal.readOnly = true;
  }
  if (konten) {
    konten.value = data.content || "";
    konten.readOnly = true;
  }
  if (references) {
    references.value = data.references || "-";
    references.readOnly = true;
  }
  if (gambar && data.image) {
    gambar.src = data.image;
  }
  if (btnSimpan) btnSimpan.disabled = true;

  if (btnKembali) {
    btnKembali.addEventListener("click", () => {
      window.location.href = "/src/templates/admin-artikel.html";
    });
  }
});

async function fetchArticles() {
  const TOKEN = sessionStorage.getItem("authToken");
  if (!TOKEN) {
    window.location.href = "https://mentalwell-10-frontend.vercel.app/";
    return [];
  }
  const res = await fetch(
    `https://mentalwell10-api-production.up.railway.app/articles`,
    {
      headers: { Authorization: `Bearer ${TOKEN}` },
    }
  );
  if (!res.ok) throw new Error("Gagal mengambil data artikel");
  const result = await res.json();
  if (result.status === "success") {
    return result.articles;
  } else {
    throw new Error(result.message || "Gagal mengambil data artikel");
  }
}
