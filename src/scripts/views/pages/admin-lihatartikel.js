document.addEventListener("DOMContentLoaded", async () => {
  const judul = document.getElementById("judul");
  const konten = document.getElementById("konten");
  const gambar = document.getElementById("previewImage");
  const references = document.getElementById("references");
  const tanggal = document.getElementById("tanggal");
  const btnKembali = document.getElementById("btnKembali");

  // Ambil id artikel dari query string
  const params = new URLSearchParams(window.location.search);
  const artikelId = params.get("artikel_id");

  try {
    const data = await fetchArtikelDetail(artikelId);
    if (judul) judul.textContent = data.title;
    if (konten) konten.textContent = data.content;
    if (gambar && data.image) gambar.src = data.image;
    if (references) references.textContent = data.references || "-";
    if (tanggal && data.created_at)
      tanggal.textContent = new Date(data.created_at).toLocaleDateString(
        "id-ID",
        { day: "2-digit", month: "long", year: "numeric" }
      );
  } catch (err) {
    Swal.fire({ icon: "error", title: "Gagal", text: err.message });
  }

  if (btnKembali) {
    btnKembali.addEventListener("click", () => {
      window.location.href = "/src/templates/admin-artikel.html";
    });
  }
});

async function fetchArtikelDetail(id) {
  const TOKEN = sessionStorage.getItem("authToken");
  const res = await fetch(
    `https://mentalwell10-api-production.up.railway.app/article/${id}`,
    { headers: { Authorization: `Bearer ${TOKEN}` } }
  );
  const result = await res.json();
  if (res.ok && result.status === "success") {
    return result.data;
  } else {
    throw new Error(result.message || "Gagal mengambil data artikel");
  }
}
