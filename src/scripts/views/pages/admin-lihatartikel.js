document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const artikelId = params.get("artikel_id");
  if (!artikelId) return;

  try {
    const data = await fetchArtikelDetail(artikelId);
    document.getElementById("judul").textContent = data.title;
    document.getElementById("konten").textContent = data.content;
    document.getElementById("kategori").textContent = data.category || "-";
    document.getElementById("tanggal").textContent = data.created_at
      ? new Date(data.created_at).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
      : "-";
    document.getElementById("references").textContent = data.references || "-";
    if (data.image) document.getElementById("previewImage").src = data.image;
  } catch (err) {
    Swal.fire({ icon: "error", title: "Gagal", text: err.message });
  }

  document.getElementById("btnKembali")?.addEventListener("click", () => {
    window.location.href = "/src/templates/admin-artikel.html";
  });
});

async function fetchArtikelDetail(id) {
  const TOKEN = sessionStorage.getItem("authToken");
  if (!TOKEN) throw new Error("Token tidak ditemukan. Silakan login ulang.");
  const res = await fetch(
    `https://mentalwell10-api-production.up.railway.app/article/${id}`,
    { headers: { Authorization: `Bearer ${TOKEN}` } }
  );
  if (!res.ok) throw new Error("Gagal mengambil data artikel");
  const result = await res.json();
  if (result.status === "success") {
    return result.data;
  } else {
    throw new Error(result.message || "Gagal mengambil data artikel");
  }
}
