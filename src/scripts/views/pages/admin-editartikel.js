document.getElementById('formArtikel').addEventListener('submit', function(e) {
    e.preventDefault();
  
    const judul = this.judul.value;
    const kategori = this.kategori.value;
    const tanggal = this.tanggal.value;
    const konten = this.konten.value;
    const gambar = this.gambar.files[0];
  
    console.log("Data Artikel:");
    console.log({ judul, kategori, tanggal, konten, gambar });
  
    alert("Artikel berhasil disimpan (simulasi)");
  });
  
  document.getElementById('gambar').addEventListener('change', function () {
    const fileName = this.files[0]?.name || '';
    document.getElementById('namaFile').value = fileName;
  });

    document.getElementById('namaFile').addEventListener('click', function () {
    document.getElementById('gambar').click();
  });
