document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("formArtikel");
  const inputGambar = document.getElementById("gambar");
  const inputNamaFile = document.getElementById("namaFile");
  const btnKembali = document.getElementById("btnKembali");
  const ENDPOINT = "https://mentalwell10-api-production.up.railway.app";
  const TOKEN = sessionStorage.getItem("authToken");

  // Ambil id artikel dari query string
  const params = new URLSearchParams(window.location.search);
  const artikelId = params.get("artikel_id");

  // Prefill data artikel
  try {
    const data = await fetchArtikelDetail(artikelId);
    form.judul.value = data.title;
    form.konten.value = data.content;
    if (form.references) form.references.value = data.references || "";
    if (data.image) {
      document.getElementById("previewImage").src = data.image;
    }
  } catch (err) {
    Swal.fire({ icon: "error", title: "Gagal", text: err.message });
  }

  inputGambar.addEventListener("change", () => {
    const file = inputGambar.files[0];
    inputNamaFile.value = file ? file.name : "";
  });

  btnKembali.addEventListener("click", () => {
    window.location.href = "/src/templates/admin-artikel.html";
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData();
    if (form.judul.value.trim())
      formData.append("title", form.judul.value.trim());
    if (form.konten.value.trim())
      formData.append("content", form.konten.value.trim());
    if (inputGambar.files[0]) formData.append("image", inputGambar.files[0]);
    if (form.references && form.references.value.trim()) {
      formData.append("references", form.references.value.trim());
    }

    try {
      const res = await fetch(`${ENDPOINT}/article/${artikelId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${TOKEN}` },
        body: formData,
      });
      const result = await res.json();
      if (res.ok && result.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Artikel berhasil diupdate!",
          text: result.message,
        }).then(() => {
          window.location.href = "/src/templates/admin-artikel.html";
        });
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
