document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formArtikel');

  // Contoh data awal (data lama yang ingin diedit)
  const dataAwal = {
    nama: "Budi Santoso",
    email: "budi@example.com",
    nohp: "08123456789",
    tanggallahir: "1985-05-15",
    jeniskelamin: "Laki-laki",
    pengalaman: "2-4_tahun",
    keahlian: ["Adiksi", "Trauma"],
    jadwal: [
      { hari: "Senin", jamMulai: "09:00", jamSelesai: "12:00" },
      { hari: "Rabu", jamMulai: "14:00", jamSelesai: "16:00" }
    ],
    bio: "Psikolog berpengalaman dengan spesialisasi trauma.",
    namaFile: "profil-budi.jpg",
  };

  // Fungsi untuk isi form dengan dataAwal
  function prefillForm(data) {
    form.nama.value = data.nama;
    form.email.value = data.email;
    form.nohp.value = data.nohp;
    form.tanggallahir.value = data.tanggallahir;
    form.jeniskelamin.value = data.jeniskelamin;
    form.pengalaman.value = data.pengalaman;

    // Checkbox keahlian
    const checkboxes = form.querySelectorAll('input[name="keahlian"]');
    checkboxes.forEach(cb => {
      cb.checked = data.keahlian.includes(cb.value);
    });

    // Isi jadwal
    const jadwalContainer = document.getElementById('jadwalContainer');
    jadwalContainer.innerHTML = ''; // kosongkan dulu

    data.jadwal.forEach((jadwalItem, index) => {
      const jadwalRow = document.createElement('div');
      jadwalRow.className = 'row mb-2 align-items-center jadwal-row';

      jadwalRow.innerHTML = `
        <div class="col-md-4">
          <select name="hari[]" class="form-select" required>
            <option value="">Pilih Hari</option>
            <option value="Senin">Senin</option>
            <option value="Selasa">Selasa</option>
            <option value="Rabu">Rabu</option>
            <option value="Kamis">Kamis</option>
            <option value="Jumat">Jumat</option>
            <option value="Sabtu">Sabtu</option>
            <option value="Minggu">Minggu</option>
          </select>
        </div>
        <div class="col-md-6">
          <div class="d-flex">
            <input type="time" name="jamMulai[]" class="form-control me-2" required>
            <span class="mx-1 d-flex align-items-center">-</span>
            <input type="time" name="jamSelesai[]" class="form-control ms-2" required>
          </div>
        </div>
        <div class="col-md-2 d-flex justify-content-start gap-2">
          <button type="button" class="btn btn-tambah tambah-jadwal"><i class="fas fa-plus"></i></button>
          <button type="button" class="btn btn-danger hapus-jadwal"><i class="fas fa-trash-alt"></i></button>
        </div>
      `;

      // Set nilai select dan input waktu
      jadwalRow.querySelector('select[name="hari[]"]').value = jadwalItem.hari;
      jadwalRow.querySelector('input[name="jamMulai[]"]').value = jadwalItem.jamMulai;
      jadwalRow.querySelector('input[name="jamSelesai[]"]').value = jadwalItem.jamSelesai;

      jadwalContainer.appendChild(jadwalRow);
    });

    // Bio
    form.bio.value = data.bio;

    // Nama file (gambar)
    const namaFileInput = document.getElementById('namaFile');
    namaFileInput.value = data.namaFile || '';
  }

  // Panggil prefill saat load halaman
  prefillForm(dataAwal);

  // Fungsi tambah jadwal baru
  function tambahJadwalRow() {
    const jadwalContainer = document.getElementById('jadwalContainer');
    const jadwalRow = document.createElement('div');
    jadwalRow.className = 'row mb-2 align-items-center jadwal-row';

    jadwalRow.innerHTML = `
      <div class="col-md-4">
        <select name="hari[]" class="form-select" required>
          <option value="">Pilih Hari</option>
          <option value="Senin">Senin</option>
          <option value="Selasa">Selasa</option>
          <option value="Rabu">Rabu</option>
          <option value="Kamis">Kamis</option>
          <option value="Jumat">Jumat</option>
          <option value="Sabtu">Sabtu</option>
          <option value="Minggu">Minggu</option>
        </select>
      </div>
      <div class="col-md-6">
        <div class="d-flex">
          <input type="time" name="jamMulai[]" class="form-control me-2" required>
          <span class="mx-1 d-flex align-items-center">-</span>
          <input type="time" name="jamSelesai[]" class="form-control ms-2" required>
        </div>
      </div>
      <div class="col-md-2 d-flex justify-content-start gap-2">
        <button type="button" class="btn btn-tambah tambah-jadwal"><i class="fas fa-plus"></i></button>
        <button type="button" class="btn btn-danger hapus-jadwal"><i class="fas fa-trash-alt"></i></button>
      </div>
    `;

    jadwalContainer.appendChild(jadwalRow);
  }

  // Event delegation untuk tombol tambah dan hapus jadwal
  document.getElementById('jadwalContainer').addEventListener('click', (e) => {
    if (e.target.closest('.tambah-jadwal')) {
      tambahJadwalRow();
    } else if (e.target.closest('.hapus-jadwal')) {
      const row = e.target.closest('.jadwal-row');
      if (row) {
        row.remove();
      }
    }
  });

  // Event file input supaya nama file muncul di input text
  const inputGambar = document.getElementById('gambar');
  const namaFileInput = document.getElementById('namaFile');
  inputGambar.addEventListener('change', () => {
    const fileName = inputGambar.files.length > 0 ? inputGambar.files[0].name : '';
    namaFileInput.value = fileName;
  });

  // Handle submit form (simpan perubahan)
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Ambil data dari form
    const formData = new FormData(form);

    // Convert ke object yang lebih mudah dikelola
    const dataEdit = {
      nama: formData.get('nama'),
      email: formData.get('email'),
      nohp: formData.get('nohp'),
      tanggallahir: formData.get('tanggallahir'),
      jeniskelamin: formData.get('jeniskelamin'),
      pengalaman: formData.get('pengalaman'),
      keahlian: formData.getAll('keahlian'),
      jadwal: [],
      bio: formData.get('bio'),
      namaFile: namaFileInput.value,
    };

    // Ambil data jadwal
    const hariArr = formData.getAll('hari[]');
    const jamMulaiArr = formData.getAll('jamMulai[]');
    const jamSelesaiArr = formData.getAll('jamSelesai[]');

    for (let i = 0; i < hariArr.length; i++) {
      dataEdit.jadwal.push({
        hari: hariArr[i],
        jamMulai: jamMulaiArr[i],
        jamSelesai: jamSelesaiArr[i],
      });
    }

    // Simpan data (bisa disesuaikan: API call, localStorage, dsb)
    console.log("Data yang disimpan:", dataEdit);

    // Contoh simpan di localStorage (optional)
    localStorage.setItem('dataPsikologEdit', JSON.stringify(dataEdit));

    // Tampilkan notifikasi sukses pakai SweetAlert2
    Swal.fire({
      icon: 'success',
      title: 'Berhasil!',
      text: 'Data psikolog berhasil disimpan.',
      confirmButtonText: 'OK'
    }).then(() => {
      window.location.href = '/src/templates/admin-psikolog.html';
    });
  });

  // Tombol Kembali
  document.getElementById('btnKembali').addEventListener('click', () => {
    window.history.back();
  });
});
