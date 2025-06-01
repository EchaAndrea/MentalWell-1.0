document.addEventListener('DOMContentLoaded', () => {
  const psikologData = {
    nama: "Dr. Budi Santoso",
    email: "budi.santoso@email.com",
    nohp: "081234567890",
    tanggallahir: "1978-03-15",
    jeniskelamin: "Laki-laki",
    pengalaman: "2-4_tahun",
    keahlian: ["Adiksi", "Trauma"],
    jadwal: [
      { hari: "Senin", jamMulai: "09:00", jamSelesai: "11:00" },
      { hari: "Rabu", jamMulai: "14:00", jamSelesai: "16:00" },
    ],
    bio: "Psikolog klinis dengan pengalaman lebih dari 10 tahun di bidang trauma dan adiksi.",
    namaFile: "budi-profile.jpg",
  };

  const form = document.getElementById('formArtikel');
  if (!form) return;

    // Tombol Kembali tetap aktif dan diarahkan ke halaman admin psikolog
  const btnKembali = document.getElementById('btnKembali');
  if (btnKembali) {
    btnKembali.disabled = false;
    btnKembali.style.color = '';
    btnKembali.style.cursor = 'pointer';
    btnKembali.style.pointerEvents = '';
    btnKembali.addEventListener('click', () => {
      window.location.href = '/src/templates/admin-psikolog.html';
    });
  }
  
  // Isi form dengan data
  form.nama.value = psikologData.nama;
  form.email.value = psikologData.email;
  form.nohp.value = psikologData.nohp;
  form.tanggallahir.value = psikologData.tanggallahir;
  form.jeniskelamin.value = psikologData.jeniskelamin;
  form.pengalaman.value = psikologData.pengalaman;
  form.bio.value = psikologData.bio;
  document.getElementById('namaFile').value = psikologData.namaFile;

  // Checkbox keahlian
  const semuaCheckbox = form.querySelectorAll('input[type="checkbox"][name="keahlian"]');
  semuaCheckbox.forEach(cb => {
    cb.checked = psikologData.keahlian.includes(cb.value);
  });

  // Jadwal
  const jadwalContainer = document.getElementById('jadwalContainer');
  jadwalContainer.innerHTML = '';

  psikologData.jadwal.forEach(jadwalItem => {
    const row = document.createElement('div');
    row.classList.add('row', 'mb-2', 'align-items-center', 'jadwal-row');

    // Hari select
    const colHari = document.createElement('div');
    colHari.classList.add('col-md-4');
    const selectHari = document.createElement('select');
    selectHari.name = "hari[]";
    selectHari.classList.add('form-select');
    selectHari.required = true;

    ["", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"].forEach(h => {
      const opt = document.createElement('option');
      opt.value = h;
      opt.textContent = h === "" ? "Pilih Hari" : h;
      if (h === jadwalItem.hari) opt.selected = true;
      selectHari.appendChild(opt);
    });
    colHari.appendChild(selectHari);

    // Jam mulai dan selesai
    const colJam = document.createElement('div');
    colJam.classList.add('col-md-6');
    const jamDiv = document.createElement('div');
    jamDiv.classList.add('d-flex');

    const inputJamMulai = document.createElement('input');
    inputJamMulai.type = "time";
    inputJamMulai.name = "jamMulai[]";
    inputJamMulai.classList.add('form-control', 'me-2');
    inputJamMulai.value = jadwalItem.jamMulai;
    inputJamMulai.required = true;

    const spanPisah = document.createElement('span');
    spanPisah.classList.add('mx-1', 'd-flex', 'align-items-center');
    spanPisah.textContent = "-";

    const inputJamSelesai = document.createElement('input');
    inputJamSelesai.type = "time";
    inputJamSelesai.name = "jamSelesai[]";
    inputJamSelesai.classList.add('form-control', 'ms-2');
    inputJamSelesai.value = jadwalItem.jamSelesai;
    inputJamSelesai.required = true;

    jamDiv.appendChild(inputJamMulai);
    jamDiv.appendChild(spanPisah);
    jamDiv.appendChild(inputJamSelesai);
    colJam.appendChild(jamDiv);

    // Tombol tambah dan hapus (biasa saja)
    const colTombol = document.createElement('div');
    colTombol.classList.add('col-md-2', 'd-flex', 'justify-content-start', 'gap-2');

    const btnTambah = document.createElement('button');
    btnTambah.type = 'button';
    btnTambah.classList.add('btn', 'btn-tambah', 'tambah-jadwal');
    btnTambah.setAttribute('aria-label', 'Tambah jadwal');
    btnTambah.title = 'Tambah jadwal';
    btnTambah.innerHTML = '<i class="fas fa-plus" aria-hidden="true"></i>';

    const btnHapus = document.createElement('button');
    btnHapus.type = 'button';
    btnHapus.classList.add('btn', 'btn-danger', 'hapus-jadwal');
    btnHapus.setAttribute('aria-label', 'Hapus jadwal');
    btnHapus.title = 'Hapus jadwal';
    btnHapus.innerHTML = '<i class="fas fa-trash-alt" aria-hidden="true"></i>';

    colTombol.appendChild(btnTambah);
    colTombol.appendChild(btnHapus);

    row.appendChild(colHari);
    row.appendChild(colJam);
    row.appendChild(colTombol);

    jadwalContainer.appendChild(row);
  });

  // Disable semua input, select, textarea
  const semuaElemenForm = form.querySelectorAll('input, select, textarea');
  semuaElemenForm.forEach(el => {
    el.disabled = true;
  });

  // Disable input file dan label gambar
  const labelFile = form.querySelector('label[for="gambar"]');
  if (labelFile) {
    labelFile.style.pointerEvents = 'none';
    labelFile.setAttribute('aria-disabled', 'true');
    labelFile.style.opacity = 0.6;
  }
  const inputFile = form.querySelector('input[type="file"]');
  if (inputFile) {
    inputFile.disabled = true;
  }
});
