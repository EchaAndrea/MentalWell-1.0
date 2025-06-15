document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('formArtikel');
  const btnKembali = document.getElementById('btnKembali');
  const inputGambar = document.getElementById('gambar');
  const inputNamaFile = document.getElementById('namaFile');

  // Ganti dengan endpoint dan token asli
  const ENDPOINT = '{{endpoint link}}';
  const TOKEN = '{{admin_token}}';

  // Ambil ID artikel dari URL (misal: ...?artikel_id=4)
  const urlParams = new URLSearchParams(window.location.search);
  const artikelId = urlParams.get('artikel_id');

  // --- Ambil data artikel dari backend (GET) ---
  async function fetchArtikel() {
    if (!artikelId) return;
    try {
      const res = await fetch(`https://mentalwellbackend-production.up.railway.app/article/${artikelId}`, {
        headers: { 'Authorization': `Bearer ${TOKEN}` }
      });
      const data = await res.json();
      if (res.ok && data.data) {
        form.judul.value = data.data.title || '';
        form.kategori.value = data.data.category || '';
        form.tanggal.value = data.data.date ? data.data.date.slice(0, 10) : '';
        form.konten.value = data.data.content || '';
        inputNamaFile.value = data.data.image ? data.data.image.split('/').pop() : '';
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Gagal', text: 'Gagal mengambil data artikel.' });
    }
  }
  await fetchArtikel();

  // --- Update nama file gambar saat file dipilih ---
  inputGambar.addEventListener('change', (e) => {
    const fileName = e.target.files[0]?.name || "";
    inputNamaFile.value = fileName;
  });

  // --- Submit form: PUT ke backend ---
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!artikelId) {
      Swal.fire({ icon: 'error', title: 'Gagal', text: 'ID artikel tidak ditemukan.' });
      return;
    }

    const formData = new FormData();
    if (form.judul.value.trim()) formData.append('title', form.judul.value.trim());
    if (form.kategori.value.trim()) formData.append('category', form.kategori.value.trim());
    if (form.tanggal.value.trim()) formData.append('date', form.tanggal.value.trim());
    if (form.konten.value.trim()) formData.append('content', form.konten.value.trim());
    if (inputGambar.files[0]) formData.append('image', inputGambar.files[0]);

    if ([...formData.keys()].length === 0) {
      Swal.fire({ icon: 'error', title: 'Gagal', text: 'Tidak ada data yang diubah.' });
      return;
    }

    try {
      const res = await fetch(`${ENDPOINT}/article/${artikelId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${TOKEN}` },
        body: formData
      });
      const result = await res.json();
      if (res.ok && result.status === 'success') {
        Swal.fire({
          icon: 'success',
          title: 'Berhasil disimpan!',
          text: 'Perubahan artikel berhasil disimpan.',
          confirmButtonText: 'OK'
        }).then(() => {
          window.location.href = '/src/templates/admin-artikel.html';
        });
      } else {
        Swal.fire({ icon: 'error', title: 'Gagal', text: result.message || 'Terjadi kesalahan.' });
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Gagal', text: 'Tidak dapat terhubung ke server.' });
    }
  });

  // --- Tombol kembali ---
  btnKembali.addEventListener('click', () => {
    window.location.href = '/src/templates/admin-artikel.html';
  });
});
