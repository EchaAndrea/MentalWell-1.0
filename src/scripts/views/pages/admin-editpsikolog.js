document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("formPsikolog");
  const inputGambar = document.getElementById("gambar");
  const namaFileInput = document.getElementById("namaFile");
  const jadwalContainer = document.getElementById("jadwalContainer");
  const params = new URLSearchParams(window.location.search);
  const psikologId = params.get("id");

  document
    .getElementById("btnKembali")
    .addEventListener("click", () => window.history.back());

  // Prefill data psikolog
  try {
    const TOKEN = sessionStorage.getItem("authToken");
    if (!TOKEN) {
      window.location.href = "https://mentalwell-10-frontend.vercel.app/";
      return;
    }
    const res = await fetch(
      `https://mentalwell10-api-production.up.railway.app/admin/psychologist/${psikologId}`,
      {
        headers: { Authorization: `Bearer ${TOKEN}` },
      }
    );
    const json = await res.json();
    if (!res.ok || json.status !== "success") {
      Swal.fire({
        icon: "error",
        title: "Gagal!",
        text: json.message || "Gagal mengambil data.",
      });
      return;
    }
    const data = json.data;
    form.nama.value = data.name || "";
    form.nickname.value = data.nickname || "";
    form.email.value = data.email || "";
    form.nohp.value = data.phone_number || "";
    form.tanggallahir.value = data.birthdate || "";
    form.jeniskelamin.value = data.gender || "";
    form.pengalaman.value = data.experience || "";
    form.harga.value = data.price || "";
    form.bio.value = data.bio || "";
    // Topik keahlian
    if (Array.isArray(data.topics)) {
      data.topics.forEach((topic) => {
        const checkbox = form.querySelector(
          `input[name="keahlian"][value="${topic.id}"]`
        );
        if (checkbox) checkbox.checked = true;
      });
    }
    // Jadwal
    jadwalContainer.innerHTML = "";
    if (Array.isArray(data.schedules)) {
      data.schedules.forEach((sch) => {
        addJadwalRow({
          day: sch.day,
          start_time: sch.start_time,
          end_time: sch.end_time,
        });
      });
    } else {
      addJadwalRow();
    }
    if (data.profile_image) {
      namaFileInput.value = data.profile_image.split("/").pop();
    }
  } catch (e) {
    Swal.fire({
      icon: "error",
      title: "Gagal!",
      text: "Tidak dapat terhubung ke server.",
    });
  }

  // Submit form (PUT)
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
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
    for (let i = 0; i < jamMulaiArr.length; i++) {
      if (hariArr[i]) {
        schedules.push({
          day: hariArr[i].toLowerCase(),
          start_time: jamMulaiArr[i],
          end_time: jamSelesaiArr[i],
        });
      }
    }
    const topics = Array.from(
      form.querySelectorAll('input[name="keahlian"]:checked')
    ).map((cb) => Number(cb.value));
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
    if (inputGambar.files[0])
      formData.append("profile_image", inputGambar.files[0]);
    try {
      const res = await fetch(
        `https://mentalwell10-api-production.up.railway.app/admin/psychologist/${psikologId}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${TOKEN}` },
          body: formData,
        }
      );
      const json = await res.json();
      if (res.ok && json.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Data psikolog berhasil diperbarui.",
        }).then(
          () => (window.location.href = "/src/templates/admin-psikolog.html")
        );
      } else {
        Swal.fire({
          icon: "error",
          title: "Gagal!",
          text: json.message || "Gagal memperbarui data.",
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Gagal!",
        text: "Tidak dapat terhubung ke server.",
      });
    }
  });

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
      </div>
      <div class="col-md-6">
        <div class="d-flex">
          <input type="time" name="jamMulai[]" class="form-control me-2" value="${
            item.start_time || ""
          }">
          <span class="mx-1 d-flex align-items-center">-</span>
          <input type="time" name="jamSelesai[]" class="form-control ms-2" value="${
            item.end_time || ""
          }">
        </div>
      </div>
    `;
    if (item.day)
      row.querySelector('select[name="hari[]"]').value =
        item.day.charAt(0).toUpperCase() + item.day.slice(1);
    jadwalContainer.appendChild(row);
  }
});
