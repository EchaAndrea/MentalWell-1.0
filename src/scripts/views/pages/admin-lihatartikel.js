document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formArtikel');
  const inputGambar = document.getElementById('gambar');
  const namaFile = document.getElementById('namaFile');
  const btnKembali = document.getElementById('btnKembali');

  const ENDPOINT = 'https://mentalwellbackend-production.up.railway.app';
  const TOKEN = '{{admin_token}}';

  // Tampilkan nama file saat gambar dipilih
  inputGambar.addEventListener('change', () => {
    const file = inputGambar.files[0];
    namaFile.value = file ? file.name : '';
  });

  // Tangani tombol kembali
  if (btnKembali) {
    btnKembali.addEventListener('click', () => {
      window.location.href = '/src/templates/admin-artikel.html';
    });
  }

  // Tangani submit form
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', form.judul.value.trim());
    formData.append('content', form.konten.value.trim());
    if (inputGambar.files[0]) formData.append('image', inputGambar.files[0]);
    if (form.references && form.references.value.trim()) {
      formData.append('references', form.references.value.trim());
    }

    try {
      const res = await fetch(`https://mentalwellbackend-production.up.railway.app/article`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${TOKEN}` },
        body: formData
      });
      const result = await res.json();
      if (res.ok && result.status === 'success') {
        Swal.fire({
          icon: 'success',
          title: 'Artikel berhasil dibuat!',
          text: result.message
        }).then(() => {
          window.location.href = '/src/templates/admin-artikel.html';
        });
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
