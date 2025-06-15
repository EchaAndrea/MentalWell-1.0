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
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', form.judul.value.trim());
    formData.append('category', form.kategori.value.trim());
    formData.append('date', form.tanggal.value.trim());
    formData.append('content', form.konten.value.trim());
    if (inputGambar.files[0]) formData.append('image', inputGambar.files[0]);

    try {
      const res = await fetch('https://mentalwellbackend-production.up.railway.app/article', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer {{admin_token}}' },
        body: formData
      });
      const result = await res.json();
      if (res.ok && result.status === 'success') {
        Swal.fire({ icon: 'success', title: 'Artikel berhasil ditambahkan!', text: `Judul: ${result.data.title}` })
          .then(() => window.location.href = '/src/templates/admin-artikel.html');
        form.reset();
        namaFile.value = '';
      } else {
        Swal.fire({ icon: 'error', title: 'Gagal', text: result.message || 'Terjadi kesalahan.' });
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Gagal', text: 'Tidak dapat terhubung ke server.' });
    }
  });
});
