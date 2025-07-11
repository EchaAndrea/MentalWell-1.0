document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("formArtikel");
  const btnKembali = document.getElementById("btnKembali");
  const namaFile = document.getElementById("namaFile");
  const gambarInput = document.getElementById("gambar");
  const kontenTextarea = document.getElementById("konten");

  // Ambil artikel_id dari URL
  const params = new URLSearchParams(window.location.search);
  const artikelId = params.get("artikel_id");
  if (!artikelId) {
    Swal.fire("ID artikel tidak ditemukan.");
    return;
  }

  // Ambil token
  const TOKEN = sessionStorage.getItem("authToken");
  if (!TOKEN) {
    window.location.href = "https://mentalwell-10-frontend.vercel.app/";
    return;
  }

  try {
    // Ambil detail artikel (gunakan endpoint detail jika ada)
    const res = await fetch(
      `https://mentalwell10-api-production.up.railway.app/articles/${artikelId}`,
      { headers: { Authorization: `Bearer ${TOKEN}` } }
    );
    const json = await res.json();

    if (!res.ok || json.status !== "success") {
      Swal.fire("Gagal!", json.message || "Gagal mengambil data.", "error");
      return;
    }

    const artikel = json.data;
    // Isi form
    form.judul.value = artikel.title || "";
    form.kategori.value = artikel.categories || "";
    form.tanggal.value = artikel.created_at ? artikel.created_at.slice(0, 10) : "";
    kontenTextarea.value = artikel.content || "";

    // Tampilkan nama file gambar
    if (artikel.image) {
      const urlParts = artikel.image.split("/");
      namaFile.value = urlParts[urlParts.length - 1];
    } else {
      namaFile.value = "";
    }

    // Disable semua input (readonly)
    Array.from(form.elements).forEach((el) => {
      el.disabled = true;
    });
    kontenTextarea.readOnly = true;
    btnKembali.disabled = false;
    gambarInput.style.display = "none";
    form.querySelector(".btn-simpan")?.style.display = "none";
  } catch (err) {
    Swal.fire("Gagal!", "Tidak dapat terhubung ke server.", "error");
  }

  // Tombol kembali
  btnKembali.addEventListener("click", () => {
    window.history.back();
  });
});
