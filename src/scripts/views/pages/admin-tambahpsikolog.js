document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formPsikolog");
  const inputGambar = document.getElementById("gambar");
  const namaFileInput = document.getElementById("namaFile");
  const jadwalContainer = document.getElementById("jadwalContainer");
  const ENDPOINT = "https://mentalwell10-api-production.up.railway.app";
  const TOKEN = sessionStorage.getItem("authToken");

  // Kosongkan form saat load
  form.reset();
  namaFileInput.value = "";

  // Fungsi tambah jadwal (HANYA HARI)
  function addJadwalRow(item = {}) {
    const row = document.createElement("div");
    row.className = "row mb-2 align-items-center jadwal-row";

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
        <button type="button" class="btn btn-tambah tambah-jadwal" aria-label="Tambah jadwal" title="Tambah jadwal">
          <i class="fas fa-plus"></i>
        </button>
        <button type="button" class="btn btn-danger hapus-jadwal" aria-label="Hapus jadwal" title="Hapus jadwal">
          <i class="fas fa-trash-alt"></i>
        </button>
      </div>
    `;

    // Prefill jika ada
    row.querySelector('select[name="hari[]"]').value = item.hari || "";
    row.querySelector('input[name="jamMulai[]"]').value = item.jamMulai || "";
    row.querySelector('input[name="jamSelesai[]"]').value =
      item.jamSelesai || "";

    jadwalContainer.appendChild(row);
    updateHapusButton();
  }

  // Update tombol hapus: disable jika hanya 1 row
  function updateHapusButton() {
    const rows = jadwalContainer.querySelectorAll(".jadwal-row");
    rows.forEach((row) => {
      const hapusBtn = row.querySelector(".hapus-jadwal");
      hapusBtn.disabled = rows.length === 1;
    });
  }

  // Event delegasi untuk tambah/hapus jadwal
  jadwalContainer.addEventListener("click", (e) => {
    if (e.target.closest(".tambah-jadwal")) {
      addJadwalRow();
    }
    if (e.target.closest(".hapus-jadwal")) {
      const row = e.target.closest(".jadwal-row");
      if (jadwalContainer.children.length > 1) {
        row.remove();
        updateHapusButton();
      }
    }
  });

  // Tambah satu jadwal kosong saat load
  addJadwalRow();

  // Input gambar
  inputGambar.addEventListener("change", () => {
    const fileName =
      inputGambar.files.length > 0 ? inputGambar.files[0].name : "";
    namaFileInput.value = fileName;
  });

  // Submit form
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Ambil data jadwal (HANYA HARI)
    const hariArr = Array.from(
      form.querySelectorAll('select[name="hari[]"]')
    ).map((i) => i.value);
    const jamMulaiArr = Array.from(
      form.querySelectorAll('input[name="jamMulai[]"]')
    ).map((i) => i.value);
    const jamSelesaiArr = Array.from(
      form.querySelectorAll('input[name="jamSelesai[]"]')
    ).map((i) => i.value);

    // Format jadwal sesuai API
    const schedules = [];
    for (let i = 0; i < jamMulaiArr.length; i++) {
      if (hariArr[i]) {
        schedules.push({
          day: hariArr[i].toLowerCase(),
          start_time: jamMulaiArr[i],
          end_time: jamSelesaiArr[i],
        });
      }
    }

    // Ambil topik (ID) dari checkbox
    const topics = Array.from(
      form.querySelectorAll('input[name="keahlian"]:checked')
    ).map((cb) => Number(cb.value));

    // Siapkan FormData sesuai urutan field
    const formData = new FormData();
    formData.append("name", form.nama.value.trim());
    formData.append("nickname", form.nickname.value.trim());
    formData.append("email", form.email.value.trim());
    formData.append("phone_number", form.nowa.value.trim());
    formData.append("birthdate", form.tanggallahir.value.trim());
    formData.append("gender", form.jeniskelamin.value.trim());
    formData.append("bio", form.bio.value.trim());
    formData.append("experience", form.pengalaman.value.trim());
    formData.append("price", form.harga.value.trim());
    formData.append("topics", JSON.stringify(topics));
    formData.append("schedules", JSON.stringify(schedules));
    formData.append("password", form.password.value.trim());
    if (inputGambar.files[0])
      formData.append("profile_image", inputGambar.files[0]);

    try {
      const res = await fetch(`${ENDPOINT}/admin/psychologist`, {
        method: "POST",
        headers: { Authorization: `Bearer ${TOKEN}` },
        body: formData,
      });
      const json = await res.json();
      if (json.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Data psikolog berhasil ditambahkan.",
        }).then(
          () => (window.location.href = "/src/templates/admin-psikolog.html")
        );
        form.reset();
        namaFileInput.value = "";
      } else {
        Swal.fire({ icon: "error", title: "Gagal!", text: json.message });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Gagal!",
        text: "Tidak dapat terhubung ke server.",
      });
    }
  });

  // Tombol kembali
  document.getElementById("btnKembali").addEventListener("click", () => {
    window.history.back();
  });
});
