document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("formArtikel");
  const btnKembali = document.getElementById("btnKembali");
  const namaFile = document.getElementById("namaFile");
  const gambarInput = document.getElementById("gambar");
  const kontenTextarea = document.getElementById("konten");

  // Ambil artikel_id dari URL
  const params = new URLSearchParams(window.location.search);
  const artikelId = params.get("artikel_id");
  console.log("artikelId:", artikelId); // Tambahkan ini untuk debug

  // Disable semua input (readonly)
  Array.from(form.elements).forEach((el) => {
    el.readOnly = true;
    el.disabled = true;
  });
  kontenTextarea.readOnly = true;

  // Fetch artikel
  try {
    const TOKEN = sessionStorage.getItem("authToken");
    if (!TOKEN) {
      window.location.href = "https://mentalwell-10-frontend.vercel.app/";
      return;
    }
    const res = await fetch(
      `https://mentalwell10-api-production.up.railway.app/articles/${artikelId}`,
      {
        headers: { Authorization: `Bearer ${TOKEN}` },
      }
    );
    const result = await res.json();
    if (res.ok && result.status === "success" && result.article) {
      const artikel = result.article;
      form.judul.value = artikel.title || "";
      form.kategori.value =
        Array.isArray(artikel.categories) && artikel.categories.length > 0
          ? artikel.categories.map((c) => c.name).join(", ")
          : "";
      form.tanggal.value = artikel.created_at
        ? artikel.created_at.slice(0, 10)
        : "";
      kontenTextarea.value = artikel.content || "";

      // Tampilkan nama file gambar
      if (artikel.image) {
        const urlParts = artikel.image.split("/");
        namaFile.value = urlParts[urlParts.length - 1];
      } else {
        namaFile.value = "";
      }
    } else {
      Swal.fire({
        icon: "error",
        title: "Gagal memuat artikel",
      });
    }
  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "Gagal terhubung ke server",
    });
  }

  // Tombol kembali
  btnKembali.addEventListener("click", () => {
    window.history.back();
  });
});
