document.addEventListener("DOMContentLoaded", async function () {
  const form = document.getElementById("formArtikel");
  const inputGambar = document.getElementById("gambar");
  const namaFileInput = document.getElementById("namaFile");
  const jadwalContainer = document.getElementById("jadwalContainer");
  const ENDPOINT = "https://mentalwell10-api-production.up.railway.app";
  const TOKEN = sessionStorage.getItem("authToken");

  document.getElementById("btnKembali").addEventListener("click", () => {
    window.history.back();
  });

  // Ambil ID dari query string
  const urlParams = new URLSearchParams(window.location.search);
  const psikologId = urlParams.get("id");
  if (!psikologId) {
    Swal.fire("ID psikolog tidak ditemukan.");
    return;
  }

  // Fungsi tambah jadwal (editable)
  function addJadwalRow(item = {}) {
    const row = document.createElement("div");
    row.className = "row mb-2 align-items-center jadwal-row";
    row.innerHTML = `
      <div class="col-md-4">
        <select name="hari[]" class="form-select">
          <option value="">Pilih Hari</option>
          <option value="Senin">Senin</option>
          <option value="Selasa">Selasa</option>
          <option value="Rabu">Rabu</option>
          <option value="Kamis">Kamis</option>
          <option value="Jumat">Jumat</option>
          <option value="Sabtu">Sabtu</option>
          <option value="Minggu">Minggu</option>
        </select>
        <input type="date" name="tanggal[]" class="form-control mt-2" style="display:none;">
      </div>
      <div class="col-md-6">
        <div class="d-flex">
          <input type="time" name="jamMulai[]" class="form-control me-2">
          <span class="mx-1 d-flex align-items-center">-</span>
          <input type="time" name="jamSelesai[]" class="form-control ms-2">
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
    if (item.day) {
      row.querySelector('select[name="hari[]"]').value =
        item.day.charAt(0).toUpperCase() + item.day.slice(1);
    }
    if (item.date) {
      row.querySelector('input[name="tanggal[]"]').style.display = "";
      row.querySelector('input[name="tanggal[]"]').value = item.date;
      row.querySelector('select[name="hari[]"]').style.display = "none";
    }
    row.querySelector('input[name="jamMulai[]"]').value = item.start_time || "";
    row.querySelector('input[name="jamSelesai[]"]').value = item.end_time || "";

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

  // Input gambar
  inputGambar.addEventListener("change", () => {
    const fileName =
      inputGambar.files.length > 0 ? inputGambar.files[0].name : "";
    namaFileInput.value = fileName;
  });

  // Fetch detail psikolog untuk prefill
  try {
    const res = await fetch(`${ENDPOINT}/admin/psychologist/${psikologId}`, {
      headers: { Authorization: `Bearer ${TOKEN}` },
    });
    const json = await res.json();

    if (!res.ok || json.status !== "success") {
      Swal.fire("Gagal!", json.message || "Gagal mengambil data.", "error");
      return;
    }

    const data = json.data;
    form.nama.value = data.name || "";
    form.nickname.value = data.nickname || "";
    form.email.value = data.email || "";
    form.password.value = "********";
    form.nohp.value = data.phone_number || "";
    form.tanggallahir.value = data.birthdate || "";
    form.jeniskelamin.value = data.gender || "";
    form.pengalaman.value = data.experience || "";
    form.harga.value = data.price || "";
    form.bio.value = data.bio || "";

    // Topik keahlian (checkbox)
    if (Array.isArray(data.topics)) {
      data.topics.forEach((topic) => {
        const checkbox = form.querySelector(
          `input[name="keahlian"][value="${topic.id}"]`
        );
        if (checkbox) checkbox.checked = true;
      });
    }

    // Jadwal (weekly & custom)
    jadwalContainer.innerHTML = "";
    let jadwalList = [];
    if (data.schedules && (data.schedules.weekly || data.schedules.custom)) {
      if (Array.isArray(data.schedules.weekly)) {
        jadwalList = jadwalList.concat(
          data.schedules.weekly.map((sch) => ({
            day: sch.day,
            start_time: sch.start_time,
            end_time: sch.end_time,
          }))
        );
      }
      if (Array.isArray(data.schedules.custom)) {
        jadwalList = jadwalList.concat(
          data.schedules.custom.map((sch) => ({
            date: sch.date,
            start_time: sch.start_time,
            end_time: sch.end_time,
          }))
        );
      }
    } else if (Array.isArray(data.schedules)) {
      jadwalList = data.schedules;
    }
    if (jadwalList.length > 0) {
      jadwalList.forEach((sch) => addJadwalRow(sch));
    } else {
      addJadwalRow();
    }

    // Foto profil (nama file saja)
    if (data.profile_image) {
      namaFileInput.value = data.profile_image.split("/").pop();
    }

    // Enable semua input agar bisa diedit
    Array.from(form.elements).forEach((el) => {
      el.disabled = false;
    });
    document.getElementById("btnKembali").disabled = false;
  } catch (e) {
    Swal.fire("Gagal!", "Tidak dapat terhubung ke server.", "error");
  }

  // Submit form (PUT)
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Ambil data jadwal
    const hariArr = Array.from(
      form.querySelectorAll('select[name="hari[]"]')
    ).map((i) => i.value);
    const tanggalArr = Array.from(
      form.querySelectorAll('input[name="tanggal[]"]')
    ).map((i) => i.value);
    const jamMulaiArr = Array.from(
      form.querySelectorAll('input[name="jamMulai[]"]')
    ).map((i) => i.value);
    const jamSelesaiArr = Array.from(
      form.querySelectorAll('input[name="jamSelesai[]"]')
    ).map((i) => i.value);

    // Format jadwal sesuai API
    const weekly = [];
    const custom = [];
    for (let i = 0; i < jamMulaiArr.length; i++) {
      if (hariArr[i]) {
        weekly.push({
          day: hariArr[i].toLowerCase(),
          start_time: jamMulaiArr[i],
          end_time: jamSelesaiArr[i],
        });
      } else if (tanggalArr[i]) {
        custom.push({
          date: tanggalArr[i],
          start_time: jamMulaiArr[i],
          end_time: jamSelesaiArr[i],
        });
      }
    }
    const schedules = { weekly, custom };

    // Ambil topik (ID) dari checkbox
    const topics = Array.from(
      form.querySelectorAll('input[name="keahlian"]:checked')
    ).map((cb) => Number(cb.value));

    // Siapkan FormData
    const formData = new FormData();
    formData.append("name", form.nama.value.trim());
    formData.append("nickname", form.nickname.value.trim());
    formData.append("email", form.email.value.trim());
    formData.append("phone_number", form.nohp.value.trim());
    formData.append("birthdate", form.tanggallahir.value.trim());
    formData.append("gender", form.jeniskelamin.value.trim());
    formData.append("bio", form.bio.value.trim());
    formData.append("experience", form.pengalaman.value.trim());
    formData.append("price", form.harga.value.trim());
    formData.append("topics", JSON.stringify(topics));
    formData.append("schedules", JSON.stringify(schedules));
    if (form.password.value && form.password.value !== "********") {
      formData.append("password", form.password.value.trim());
    }
    if (inputGambar.files[0])
      formData.append("profile_image", inputGambar.files[0]);

    try {
      const res = await fetch(`${ENDPOINT}/admin/psychologists/${psikologId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${TOKEN}` },
        body: formData,
      });
      const json = await res.json();
      if (json.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Data psikolog berhasil diperbarui.",
        }).then(
          () => (window.location.href = "/src/templates/admin-psikolog.html")
        );
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
});
