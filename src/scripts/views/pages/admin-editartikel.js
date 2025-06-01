document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formArtikel');
  const btnKembali = document.getElementById('btnKembali');
  const inputGambar = document.getElementById('gambar');
  const inputNamaFile = document.getElementById('namaFile');

  // === 1. Data dummy artikel yang akan diedit ===
  const dummyArtikel = {
    judul: "Pentingnya Istirahat untuk Kesehatan Mental",
    kategori: "Kesehatan Mental",
    tanggal: "2025-05-29",
    konten: `Istirahat tidak hanya penting untuk tubuh tetapi juga sangat penting untuk kesehatan mental. 
Luangkan waktu untuk diri sendiri dan jangan abaikan sinyal stres.`,
    gambar: "istirahat-mental.png"
  };

  // === 2. Isi form dengan data dummy ===
  if (form) {
    form.judul.value = dummyArtikel.judul;
    form.kategori.value = dummyArtikel.kategori;
    form.tanggal.value = dummyArtikel.tanggal;
    form.konten.value = dummyArtikel.konten;
    inputNamaFile.value = dummyArtikel.gambar;
  }

  // === 3. Update nama file gambar saat file dipilih ===
  inputGambar.addEventListener('change', (e) => {
    const fileName = e.target.files[0]?.name || "";
    inputNamaFile.value = fileName;
  });

  // === 4. Submit form: tampilkan popup konfirmasi ===
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Ambil nilai-nilai form
    const dataEdit = {
      judul: form.judul.value,
      kategori: form.kategori.value,
      tanggal: form.tanggal.value,
      konten: form.konten.value,
      gambar: inputNamaFile.value
    };

    // Simulasi penyimpanan (console.log)
    console.log("Data yang disimpan:", dataEdit);

    Swal.fire({
      icon: 'success',
      title: 'Berhasil disimpan!',
      text: 'Perubahan artikel berhasil disimpan.',
      confirmButtonText: 'OK'
    });
  });

  // === 5. Tombol kembali ke halaman daftar artikel ===
  btnKembali.addEventListener('click', () => {
    window.location.href = '/src/templates/admin-artikel.html';
  });
});
