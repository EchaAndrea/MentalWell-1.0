document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const psikologId = urlParams.get('id');
  const adminToken = localStorage.getItem("admin_token");
  const form = document.getElementById('formArtikel');
  const jadwalContainer = document.getElementById('jadwalContainer');
  const inputGambar = document.getElementById('gambar');
  const namaFileInput = document.getElementById('namaFile');

  // Prefill form dari backend
  if (psikologId) {
    try {
      const res = await fetch(`https://mentalwell10-api-production.up.railway.app/admin/psychologist/${psikologId}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const json = await res.json();
      if (json.status === "success") {
        const data = json.data;
        form.nama.value = data.name || "";
        form.email.value = data.email || "";
        form.password.value = "********";
        form.nohp.value = data.phone_number || "";
        form.tanggallahir.value = data.birthdate || "";
        form.jeniskelamin.value = data.gender || "";
        form.pengalaman.value = data.experience || "";
        form.bio.value = data.bio || "";
        namaFileInput.value = data.profile_image || "";
        // Topik keahlian
        const checkboxes = form.querySelectorAll('input[name="keahlian"]');
        const topicNames = (data.topics || []).map(t => t.name.toLowerCase());
        checkboxes.forEach(cb => {
          cb.checked = topicNames.includes(cb.value.toLowerCase());
        });
        // Jadwal
        jadwalContainer.innerHTML = '';
        (data.schedules || []).forEach(item => {
          addJadwalRow(item);
        });
      }
    } catch (e) {
      alert("Gagal memuat data psikolog");
    }
  }

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
  form.addEventListener('submit', async (e) => {
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

    // Kirim ke backend
    try {
      const res = await fetch(`https://mentalwell10-api-production.up.railway.app/admin/psychologist/${psikologId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${adminToken}` },
        body: formData
      });
      const json = await res.json();
      if (json.status === "success") {
        Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Data psikolog berhasil diubah.' })
          .then(() => window.location.href = '/src/templates/admin-psikolog.html');
      } else {
        throw new Error(json.message);
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Gagal!', text: err.message });
    }
  });

  // Tombol kembali
  document.getElementById('btnKembali').addEventListener('click', () => {
    window.history.back();
  });
});
