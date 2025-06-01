document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formArtikel');
  const inputGambar = document.getElementById('gambar');
  const namaFile = document.getElementById('namaFile');
  const btnKembali = document.getElementById('btnKembali');

  // Tampilkan nama file saat gambar dipilih
  inputGambar.addEventListener('change', () => {
    const file = inputGambar.files[0];
    if (file) {
      namaFile.value = file.name;
    } else {
      namaFile.value = '';
    }
  });

  // Tangani tombol kembali
  if (btnKembali) {
    btnKembali.addEventListener('click', () => {
      window.location.href = '/src/templates/admin-artikel.html'; // Ganti sesuai rute halaman artikel utama
    });
  }

  // Tangani submit form
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Ambil data dari form
    const dataArtikel = {
      judul: form.judul.value,
      kategori: form.kategori.value,
      tanggal: form.tanggal.value,
      konten: form.konten.value,
      gambar: namaFile.value,
    };

    console.log('Data artikel yang akan dikirim:', dataArtikel);

    // Tampilkan notifikasi sukses
    Swal.fire({
      icon: 'success',
      title: 'Artikel berhasil ditambahkan!',
      text: `Judul: ${dataArtikel.judul}`,
      confirmButtonText: 'OK'
    }).then(() => {
      window.location.href = '/src/templates/admin-artikel.html';
      form.reset(); // Kosongkan form
      namaFile.value = ''; // Kosongkan nama file
    });
  });
});
