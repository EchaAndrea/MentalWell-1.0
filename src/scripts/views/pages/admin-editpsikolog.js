document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formArtikel');
  const jadwalContainer = document.getElementById('jadwalContainer');
  const inputGambar = document.getElementById('gambar');
  const namaFileInput = document.getElementById('namaFile');

  // Data awal (contoh)
  const dataAwal = {
    nama: "Budi Santoso",
    email: "budi@example.com",
    password: "budi123",
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

  // Tambah 1 baris jadwal
  function addJadwalRow(item = {}) {
    const row = document.createElement('div');
    row.className = 'row mb-2 align-items-center jadwal-row';

    row.innerHTML = `
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

    row.querySelector('select[name="hari[]"]').value = item.hari || '';
    row.querySelector('input[name="jamMulai[]"]').value = item.jamMulai || '';
    row.querySelector('input[name="jamSelesai[]"]').value = item.jamSelesai || '';

    jadwalContainer.appendChild(row);
  }

  // Prefill form dengan data awal
  function prefillForm(data) {
    form.nama.value = data.nama;
    form.email.value = data.email;
    form.password.value = data.password;
    form.nohp.value = data.nohp;
    form.tanggallahir.value = data.tanggallahir;
    form.jeniskelamin.value = data.jeniskelamin;
    form.pengalaman.value = data.pengalaman;
    form.bio.value = data.bio;
    namaFileInput.value = data.namaFile || '';

    // Keahlian
    const checkboxes = form.querySelectorAll('input[name="keahlian"]');
    checkboxes.forEach(cb => {
      cb.checked = data.keahlian.includes(cb.value);
    });

    // Jadwal
    jadwalContainer.innerHTML = ''; // Bersihkan jadwal lama
    data.jadwal.forEach(item => addJadwalRow(item));
  }

  // Delegasi tombol tambah/hapus jadwal
  jadwalContainer.addEventListener('click', (e) => {
    if (e.target.closest('.tambah-jadwal')) {
      addJadwalRow();
    } else if (e.target.closest('.hapus-jadwal')) {
      const row = e.target.closest('.jadwal-row');
      row.remove();
    }
  });

  // Input file: tampilkan nama file
  inputGambar.addEventListener('change', () => {
    const fileName = inputGambar.files.length > 0 ? inputGambar.files[0].name : '';
    namaFileInput.value = fileName;
  });

  // Submit form
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(form);

    // Ambil semua jadwal dari DOM
    const jadwalRows = document.querySelectorAll('.jadwal-row');
    const jadwal = [];
    jadwalRows.forEach(row => {
      const hari = row.querySelector('select[name="hari[]"]').value;
      const jamMulai = row.querySelector('input[name="jamMulai[]"]').value;
      const jamSelesai = row.querySelector('input[name="jamSelesai[]"]').value;
      if (hari && jamMulai && jamSelesai) {
        jadwal.push({ hari, jamMulai, jamSelesai });
      }
    });

    const dataEdit = {
      nama: formData.get('nama'),
      email: formData.get('email'),
      password: formData.get('password'),
      nohp: formData.get('nohp'),
      tanggallahir: formData.get('tanggallahir'),
      jeniskelamin: formData.get('jeniskelamin'),
      pengalaman: formData.get('pengalaman'),
      keahlian: formData.getAll('keahlian'),
      jadwal,
      bio: formData.get('bio'),
      namaFile: namaFileInput.value,
    };

    console.log("Data dikirim:", dataEdit);

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

  // Tombol kembali
  document.getElementById('btnKembali').addEventListener('click', () => {
    window.history.back();
  });
});
