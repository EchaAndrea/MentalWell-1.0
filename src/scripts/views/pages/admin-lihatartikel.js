document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('formArtikel');
  const btnKembali = document.getElementById('btnKembali');
  const inputNamaFile = document.getElementById('namaFile');

  const ENDPOINT = '{{endpoint link}}';
  const TOKEN = '{{admin_token}}';
  const urlParams = new URLSearchParams(window.location.search);
  const artikelId = urlParams.get('artikel_id');

  if (artikelId) {
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

  // Buat semua input, textarea, dan file readonly atau disabled
  const semuaElemenForm = form.querySelectorAll('input, textarea, select');
  semuaElemenForm.forEach(el => {
    el.disabled = true;
  });

  // Nonaktifkan label file
  const labelFile = form.querySelector('label[for="gambar"]');
  if (labelFile) {
    labelFile.style.pointerEvents = 'none';
    labelFile.setAttribute('aria-disabled', 'true');
    labelFile.style.opacity = 0.6;
  }

  // Tombol kembali tetap aktif
  if (btnKembali) {
    btnKembali.disabled = false;
    btnKembali.style.pointerEvents = '';
    btnKembali.style.cursor = 'pointer';
    btnKembali.addEventListener('click', () => {
      window.location.href = '/src/templates/admin-artikel.html';
    });
  }
});
