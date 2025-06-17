document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("formArtikel");
  const btnKembali = document.getElementById("btnKembali");
  const namaFile = document.getElementById("namaFile");
  const gambarInput = document.getElementById("gambar");
  const jadwalContainer = document.getElementById("jadwalContainer");

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  // Generate field jadwal (seperti di tambah)
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
    row.querySelector('select[name="hari[]"]').value = item.hari || "";
    row.querySelector('input[name="jamMulai[]"]').value = item.jamMulai || "";
    row.querySelector('input[name="jamSelesai[]"]').value =
      item.jamSelesai || "";
    jadwalContainer.appendChild(row);
    updateHapusButton();
  }
  function updateHapusButton() {
    const rows = jadwalContainer.querySelectorAll(".jadwal-row");
    rows.forEach((row) => {
      const hapusBtn = row.querySelector(".hapus-jadwal");
      hapusBtn.disabled = rows.length === 1;
    });
  }
  jadwalContainer.addEventListener("click", (e) => {
    if (e.target.closest(".tambah-jadwal")) addJadwalRow();
    if (e.target.closest(".hapus-jadwal")) {
      const row = e.target.closest(".jadwal-row");
      if (jadwalContainer.children.length > 1) {
        row.remove();
        updateHapusButton();
      }
    }
  });

  // Fetch detail psikolog
  try {
    const TOKEN = sessionStorage.getItem("authToken");
    const res = await fetch(
      `https://mentalwell10-api-production.up.railway.app/admin/psychologists/${id}`,
      { headers: { Authorization: `Bearer ${TOKEN}` } }
    );
    const result = await res.json();
    if (res.ok && result.status === "success") {
      const data = result.data;
      form.nama.value = data.name || "";
      form.nickname.value = data.nickname || "";
      form.email.value = data.email || "";
      form.password.value = "********";
      form.nohp.value = data.phone_number || "";
      form.tanggallahir.value = data.birthdate
        ? data.birthdate.slice(0, 10)
        : "";
      form.jeniskelamin.value = data.gender || "";
      form.pengalaman.value = data.experience || "";
      form.bio.value = data.bio || "";
      form.harga.value = data.price || "";

      // Topik keahlian (checkbox)
      if (Array.isArray(data.topics)) {
        data.topics.forEach((t) => {
          const cb = form.querySelector(
            `input[type="checkbox"][value="${t.id}"]`
          );
          if (cb) cb.checked = true;
        });
      }

      // Jadwal (schedules)
      jadwalContainer.innerHTML = "";
      if (Array.isArray(data.schedules) && data.schedules.length > 0) {
        data.schedules.forEach((jadwal) => {
          addJadwalRow({
            hari: jadwal.day
              ? jadwal.day.charAt(0).toUpperCase() + jadwal.day.slice(1)
              : "",
            jamMulai: jadwal.start_time ? jadwal.start_time.slice(0, 5) : "",
            jamSelesai: jadwal.end_time ? jadwal.end_time.slice(0, 5) : "",
          });
        });
      } else {
        addJadwalRow();
      }

      // Tampilkan nama file gambar dan preview
      if (data.profile_image) {
        const urlParts = data.profile_image.split("/");
        namaFile.value = urlParts[urlParts.length - 1];
        let imgPreview = document.getElementById("imgPreview");
        if (!imgPreview) {
          imgPreview = document.createElement("img");
          imgPreview.id = "imgPreview";
          imgPreview.style.maxWidth = "200px";
          imgPreview.style.display = "block";
          imgPreview.style.marginBottom = "10px";
          namaFile.parentNode.insertBefore(imgPreview, namaFile);
        }
        imgPreview.src = data.profile_image;
        imgPreview.alt = "Foto Profil";
      }
    } else {
      Swal.fire({ icon: "error", title: "Gagal memuat detail psikolog" });
    }
  } catch (err) {
    Swal.fire({ icon: "error", title: "Gagal terhubung ke server" });
  }

  // Preview nama file saat pilih gambar baru
  gambarInput.addEventListener("change", function () {
    if (gambarInput.files && gambarInput.files[0]) {
      namaFile.value = gambarInput.files[0].name;
    }
  });

  // Submit form untuk edit psikolog (PUT)
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const TOKEN = sessionStorage.getItem("authToken");
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
    if (gambarInput.files[0])
      formData.append("profile_image", gambarInput.files[0]);
    // Topik keahlian
    const topics = Array.from(
      form.querySelectorAll('input[name="keahlian"]:checked')
    ).map((cb) => Number(cb.value));
    formData.append("topics", JSON.stringify(topics));
    // Jadwal
    const hariArr = Array.from(
      form.querySelectorAll('select[name="hari[]"]')
    ).map((i) => i.value);
    const jamMulaiArr = Array.from(
      form.querySelectorAll('input[name="jamMulai[]"]')
    ).map((i) => i.value);
    const jamSelesaiArr = Array.from(
      form.querySelectorAll('input[name="jamSelesai[]"]')
    ).map((i) => i.value);
    const schedules = [];
    for (let i = 0; i < hariArr.length; i++) {
      if (hariArr[i]) {
        const time = `${jamMulaiArr[i]} - ${jamSelesaiArr[i]}`;
        schedules.push({ day: hariArr[i].toLowerCase(), time });
      }
    }
    formData.append("schedules", JSON.stringify(schedules));
    try {
      const res = await fetch(
        `https://mentalwell10-api-production.up.railway.app/admin/psychologists/${id}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${TOKEN}` },
          body: formData,
        }
      );
      const result = await res.json();
      if (res.ok && result.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: "Profil psikolog berhasil diperbarui.",
        }).then(() => {
          window.location.href = "/src/templates/admin-psikolog.html";
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Gagal update",
          text: result.message || "Gagal memperbarui data.",
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Gagal terhubung ke server",
      });
    }
  });

  btnKembali.addEventListener("click", () => window.history.back());
});
