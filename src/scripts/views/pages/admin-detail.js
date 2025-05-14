const dummyData = {
    "01": { judul: "Kesehatan Mental Anak", kategori: "Kesehatan Mental", tanggal: "2025-06-06", konten: "Konten artikel 1", gambar: "gambar1.jpg" },
    "02": { judul: "Psikolog Remaja", kategori: "Psikologi", tanggal: "2025-06-08", konten: "Konten artikel 2", gambar: "gambar2.jpg" },
    // Tambahkan data lainnya sesuai kebutuhan
};

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formArtikel");
  const btnSimpan = document.querySelector(".btn-simpan");
  const namaFileInput = document.getElementById("namaFile");
  const inputGambar = document.getElementById("gambar");
  const btnKembali = document.getElementById("btnKembali");

  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get("mode"); // 'tambah', 'edit', 'lihat'
  const artikelId = urlParams.get("id"); // Ambil ID artikel untuk edit/lihat

  // Fungsi untuk mengisi form dengan data artikel
  function isiForm(data) {
    form.judul.value = data.judul;
    form.kategori.value = data.kategori;
    form.tanggal.value = data.tanggal;
    form.konten.value = data.konten;
    namaFileInput.value = data.gambar;
  }

  // Fungsi untuk menonaktifkan form jika dalam mode 'lihat'
  function setFormDisabled(disabled) {
    form.querySelectorAll("input, textarea, select").forEach(el => {
      el.disabled = disabled;
    });
    inputGambar.style.display = disabled ? "none" : "block";
    if (disabled) btnSimpan.style.display = "none";
  }

  // Jika mode edit atau lihat, ambil data artikel
  if (mode === "edit" || mode === "lihat") {
    // Ganti dengan data asli atau mock data
    const data = dummyData[artikelId]; // Data artikel berdasarkan ID
    if (data) {
      isiForm(data);
      if (mode === "lihat") {
        setFormDisabled(true); // Nonaktifkan form jika mode lihat
      }
    } else {
      Swal.fire("Gagal", "Data artikel tidak ditemukan", "error");
    }
  } else if (mode === "tambah") {
    // Kosongkan form untuk tambah artikel baru
    namaFileInput.value = "";
  }

  // Simpan artikel
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const formData = new FormData(form);
    const artikelBaru = Object.fromEntries(formData.entries());

    if (mode === "tambah") {
      console.log("Tambah artikel:", artikelBaru);
      Swal.fire("Berhasil", "Artikel berhasil ditambahkan!", "success").then(() => {
        window.location.href = "/src/templates/admin-artikel.html";
      });
    } else if (mode === "edit") {
      console.log("Edit artikel:", artikelBaru);
      Swal.fire("Berhasil", "Perubahan berhasil disimpan!", "success").then(() => {
        window.location.href = "/src/templates/admin-artikel.html";
      });
    }
  });

  // Update nama file gambar
  inputGambar.addEventListener("change", function () {
    const file = this.files[0];
    if (file) {
      namaFileInput.value = file.name;
    }
  });

  // Tombol kembali
  btnKembali.addEventListener("click", () => {
    history.back();
  });
});
