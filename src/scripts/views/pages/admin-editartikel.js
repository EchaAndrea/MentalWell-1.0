document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("formArtikel");
  const btnKembali = document.getElementById("btnKembali");
  const namaFile = document.getElementById("namaFile");
  const gambarInput = document.getElementById("gambar");
  const kontenTextarea = document.getElementById("konten");

  // Ambil artikel_id dari URL
  const params = new URLSearchParams(window.location.search);
  const artikelId = params.get("artikel_id");

  // Disable semua input (readonly)
  Array.from(form.elements).forEach((el) => {
    el.readOnly = true;
    el.disabled = true;
  });
  kontenTextarea.readOnly = true;

  // Sembunyikan tombol simpan
  form.querySelector(".btn-simpan").style.display = "none";
  gambarInput.style.display = "none";

  // Fetch artikel
  try {
    const TOKEN = sessionStorage.getItem("authToken");
    if (!TOKEN) {
      window.location.href = "https://mentalwell-10-frontend.vercel.app/";
      return;
    }
    const res = await fetch(
      `https://mentalwell10-api-production.up.railway.app/articles`,
      {
        headers: { Authorization: `Bearer ${TOKEN}` },
      }
    );
    const result = await res.json();
    if (
      res.ok &&
      result.status === "success" &&
      Array.isArray(result.articles)
    ) {
      const artikel = result.articles.find(
        (a) => String(a.id) === String(artikelId)
      );
      if (!artikel) {
        Swal.fire({
          icon: "error",
          title: "Artikel tidak ditemukan",
        });
        return;
      }
      // Isi form
      form.judul.value = artikel.title || "";
      form.kategori.value = artikel.category || "";
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

  Array.from(form.elements).forEach((el) => {
    el.readOnly = false;
    el.disabled = false;
  });
  kontenTextarea.readOnly = false;
  form.querySelector(".btn-simpan").style.display = "inline-block";
  gambarInput.style.display = "block";

  // Submit handler untuk edit artikel
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData();
    // Hanya kirim field yang tidak kosong
    if (form.judul.value.trim())
      formData.append("title", form.judul.value.trim());
    if (form.kategori.value.trim())
      formData.append("category", form.kategori.value.trim());
    if (kontenTextarea.value.trim())
      formData.append("content", kontenTextarea.value.trim());
    if (gambarInput.files[0]) formData.append("image", gambarInput.files[0]);

    if (formData.keys().next().done) {
      Swal.fire({ icon: "error", title: "Tidak ada data yang diubah" });
      return;
    }

    try {
      const TOKEN = sessionStorage.getItem("authToken");
      const res = await fetch(
        `https://mentalwell10-api-production.up.railway.app/article/${artikelId}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${TOKEN}` },
          body: formData,
        }
      );
      const result = await res.json();
      if (res.ok && result.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Artikel berhasil diperbarui",
        }).then(() => {
          window.location.reload();
        });
      } else {
        Swal.fire({
          icon: "error",
          title: result.message || "Gagal memperbarui artikel",
        });
      }
    } catch (err) {
      Swal.fire({ icon: "error", title: "Gagal terhubung ke server" });
    }
  });
});
