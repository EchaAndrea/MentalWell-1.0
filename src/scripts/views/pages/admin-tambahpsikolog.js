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

    // Validasi nomor telepon
    let phoneNumber = form.nowa.value.trim();

    // Konversi nomor telepon ke format yang benar
    if (phoneNumber.startsWith("08")) {
      phoneNumber = "628" + phoneNumber.substring(2);
    } else if (phoneNumber.startsWith("+628")) {
      phoneNumber = phoneNumber.substring(1);
    } else if (phoneNumber.startsWith("8")) {
      phoneNumber = "62" + phoneNumber;
    } else if (!phoneNumber.startsWith("628")) {
      Swal.fire({
        icon: "error",
        title: "Format Nomor Telepon Salah!",
        text: "Nomor telepon harus dimulai dengan 08, 8, +628, atau 628. Contoh: 08111111111",
      });
      return;
    }

    // Validasi panjang nomor telepon (10-15 karakter)
    if (phoneNumber.length < 10 || phoneNumber.length > 15) {
      Swal.fire({
        icon: "error",
        title: "Panjang Nomor Telepon Salah!",
        text: "Nomor telepon harus antara 10-15 karakter setelah diformat ke 628...",
      });
      return;
    }

    // Update form value dengan format yang benar
    form.nowa.value = phoneNumber;

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

    // Validasi minimal satu topik dipilih
    if (topics.length === 0) {
      Swal.fire({
        icon: "error",
        title: "Topik Keahlian Belum Dipilih!",
        text: "Pilih minimal satu topik keahlian untuk psikolog.",
      });
      return;
    }

    // Validasi minimal satu jadwal
    if (schedules.length === 0) {
      Swal.fire({
        icon: "error",
        title: "Jadwal Belum Diisi!",
        text: "Isi minimal satu jadwal praktek untuk psikolog.",
      });
      return;
    }

    // Siapkan data untuk dikirim
    const requestData = {
      name: form.nama.value.trim(),
      nickname: form.nickname.value.trim(),
      email: form.email.value.trim(),
      phone_number: phoneNumber,
      birthdate: form.tanggallahir.value.trim(),
      gender: form.jeniskelamin.value.trim(),
      bio: form.bio.value.trim(),
      experience: form.pengalaman.value.trim(),
      price: parseInt(form.harga.value.trim()),
      topics: topics,
      schedules: schedules,
      password: form.password.value.trim(),
    };

    // Debug logging
    console.log("Data yang akan dikirim (JSON):");
    console.log(JSON.stringify(requestData, null, 2));

    // Siapkan FormData untuk file upload
    const formData = new FormData();

    // Tambahkan semua field sebagai JSON string untuk konsistensi
    Object.keys(requestData).forEach((key) => {
      if (typeof requestData[key] === "object") {
        formData.append(key, JSON.stringify(requestData[key]));
      } else {
        formData.append(key, requestData[key].toString());
      }
    });

    // Tambahkan file jika ada
    if (inputGambar.files[0]) {
      formData.append("profile_image", inputGambar.files[0]);
    }

    try {
      const res = await fetch(`${ENDPOINT}/admin/psychologist`, {
        method: "POST",
        headers: { Authorization: `Bearer ${TOKEN}` },
        body: formData,
      });

      let json;
      try {
        json = await res.json();
      } catch (parseError) {
        console.error("Error parsing JSON response:", parseError);
        Swal.fire({
          icon: "error",
          title: "Gagal!",
          text: "Format response server tidak valid.",
        });
        return;
      }

      console.log("Response status:", res.status);
      console.log("Response data:", json);

      if (res.ok && json.status === "success") {
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
        console.error("Server error:", json);
        const errorMessage =
          json.message || json.error || "Gagal menambahkan data psikolog";
        Swal.fire({
          icon: "error",
          title: "Gagal!",
          text: errorMessage,
          footer: json.details ? `Detail: ${JSON.stringify(json.details)}` : "",
        });
      }
    } catch (err) {
      console.error("Network error:", err);
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
