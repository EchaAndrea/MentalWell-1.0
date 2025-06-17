document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const artikelId = params.get("artikel_id");
  if (!artikelId) return;

  try {
    const data = await fetchArtikelDetail(artikelId);

    // Isi value input/textarea, dan set readonly/disabled
    const judul = document.getElementById("judul");
    if (judul) {
      judul.value = data.title || "";
      judul.readOnly = true;
    }

    const kategori = document.getElementById("kategori");
    if (kategori) {
      kategori.value = data.category || "-";
      kategori.readOnly = true;
    }

    const tanggal = document.getElementById("tanggal");
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

    const konten = document.getElementById("konten");
    if (konten) {
      konten.value = data.content || "";
      konten.readOnly = true;
    }

    const references = document.getElementById("references");
    if (references) {
      references.value = data.references || "-";
      references.readOnly = true;
    }

    const gambar = document.getElementById("previewImage");
    if (gambar && data.image) {
      gambar.src = data.image;
    }

    // Disable tombol simpan jika ada
    const btnSimpan = document.getElementById("btnSimpan");
    if (btnSimpan) btnSimpan.disabled = true;
  } catch (err) {
    Swal.fire({ icon: "error", title: "Gagal", text: err.message });
  }

  document.getElementById("btnKembali")?.addEventListener("click", () => {
    window.location.href = "/src/templates/admin-artikel.html";
  });
});

async function fetchArtikelDetail(id) {
  // Ambil token setiap kali fetch
  const TOKEN = sessionStorage.getItem("authToken");
  if (!TOKEN) {
    window.location.href = "https://mentalwell-10-frontend.vercel.app/";
    return;
  }
  try {
    const res = await fetch(
      `https://mentalwell10-api-production.up.railway.app/article/${id}`,
      {
        headers: { Authorization: `Bearer ${TOKEN}` },
      }
    );
    if (!res.ok) {
      throw new Error("Gagal mengambil data artikel");
    }
    const result = await res.json();
    if (result.status === "success") {
      return result.data;
    } else {
      throw new Error(result.message || "Gagal mengambil data artikel");
    }
  } catch (err) {
    throw new Error("Failed to fetch: " + err.message);
  }
}
