document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formArtikel");
  const btnKembali = document.getElementById("btnKembali");
  const inputGambar = document.getElementById("gambar");
  const inputNamaFile = document.getElementById("namaFile");
  const kategoriSelect = document.getElementById("kategori");

  const ENDPOINT = "https://mentalwell10-api-production.up.railway.app";
  const TOKEN = sessionStorage.getItem("authToken"); // <-- perbaiki token

  // Tampilkan nama file saat gambar dipilih
  inputGambar.addEventListener("change", () => {
    const file = inputGambar.files[0];
    inputNamaFile.value = file ? file.name : "";
  });

  // Tombol kembali
  btnKembali.addEventListener("click", () => {
    window.location.href = "/src/templates/admin-artikel.html";
  });

  // Submit form untuk tambah artikel
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", form.judul.value.trim());
    formData.append("content", form.konten.value.trim());
    if (inputGambar.files[0]) formData.append("image", inputGambar.files[0]);
    if (form.references && form.references.value.trim()) {
      formData.append("references", form.references.value.trim());
    }
    const kategoriDipilih = [parseInt(kategoriSelect.value)];
    formData.append("categories", JSON.stringify(kategoriDipilih));

    try {
      const res = await fetch(`${ENDPOINT}/article`, {
        method: "POST",
        headers: { Authorization: `Bearer ${TOKEN}` },
        body: formData,
      });
      const result = await res.json();
      if (res.ok && result.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Artikel berhasil dibuat!",
          text: result.message,
        }).then(() => {
          window.location.href = "/src/templates/admin-artikel.html";
        });
        form.reset();
        inputNamaFile.value = "";
      } else {
        Swal.fire({
          icon: "error",
          title: "Gagal",
          text: result.message || "Terjadi kesalahan.",
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Tidak dapat terhubung ke server.",
      });
    }
  });
});
