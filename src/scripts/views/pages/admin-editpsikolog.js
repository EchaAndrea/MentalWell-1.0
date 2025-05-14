// Fungsi menyimpan data dan redirect ke halaman admin-psikolog.html
document.getElementById('formArtikel').addEventListener('submit', function (e) {
  e.preventDefault();

  const nama = this.judul.value;
  const email = this.kategori.value;
  const noHp = this.tanggal.value;
  const tanggalLahir = this.konten.value;
  const jenisKelamin = this['jenis-kelamin'].value;
  const pengalaman = this.pengalaman.value;
  const topik = this.topik.value;
  const bio = this.bio.value;
  const gambar = this.gambar.files[0];

  const psikologData = {
    nama,
    email,
    noHp,
    tanggalLahir,
    jenisKelamin,
    pengalaman,
    topik,
    bio,
    gambarName: gambar ? gambar.name : ""
  };

  // Simpan ke localStorage (bisa diganti dengan proses API kalau perlu)
  localStorage.setItem('psikologBaru', JSON.stringify(psikologData));

  // Redirect ke halaman admin psikolog
  window.location.href = '/src/pages/admin-psikolog.html';
});

// Fungsi tampilkan nama file
document.getElementById('gambar').addEventListener('change', function () {
  const fileName = this.files[0]?.name || '';
  document.getElementById('namaFile').value = fileName;
});

// Klik input text → aktifkan input file
document.getElementById('namaFile').addEventListener('click', function () {
  document.getElementById('gambar').click();
});

// Tombol kembali
document.getElementById('btnKembali').addEventListener('click', function () {
  window.location.href = '/src/pages/admin-psikolog.html';
});
