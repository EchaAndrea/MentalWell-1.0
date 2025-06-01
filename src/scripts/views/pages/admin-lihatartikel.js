document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formArtikel');
  const btnKembali = document.getElementById('btnKembali');

  // Dummy data artikel
  const artikelData = {
    judul: "Mengenal Kesehatan Mental Remaja",
    kategori: "Psikologi Anak",
    tanggal: "2025-05-28",
    konten: `Remaja sering menghadapi tekanan akademik, sosial, dan emosional. 
Penting bagi mereka untuk memiliki sistem dukungan yang baik serta pemahaman dasar mengenai kesehatan mental.`,
    gambar: "mental-remaja.jpg"
  };

  // Isi form dengan data dummy
  if (form) {
    form.judul.value = artikelData.judul;
    form.kategori.value = artikelData.kategori;
    form.tanggal.value = artikelData.tanggal;
    form.konten.value = artikelData.konten;
    document.getElementById('namaFile').value = artikelData.gambar;
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
