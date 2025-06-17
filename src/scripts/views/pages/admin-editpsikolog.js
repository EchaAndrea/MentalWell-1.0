document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("formArtikel");
  const btnKembali = document.getElementById("btnKembali");
  const namaFile = document.getElementById("namaFile");
  const gambarInput = document.getElementById("gambar");

  // Ambil nama dari URL (atau ganti dengan id jika sudah pakai id)
  const params = new URLSearchParams(window.location.search);
  const nama = params.get("nama");

  // Disable semua input (readonly)
  Array.from(form.elements).forEach((el) => {
    el.readOnly = true;
    el.disabled = true;
  });

  // Sembunyikan input file gambar
  gambarInput.style.display = "none";

  // Fetch detail psikolog
  try {
    const TOKEN = sessionStorage.getItem("authToken");
    if (!TOKEN) {
      window.location.href = "https://mentalwell-10-frontend.vercel.app/";
      return;
    }

    // Pertama, fetch semua psikolog untuk dapatkan id dari nama
    const resList = await fetch(
      "https://mentalwell10-api-production.up.railway.app/admin/psychologists",
      { headers: { Authorization: `Bearer ${TOKEN}` } }
    );
    const listJson = await resList.json();
    if (!resList.ok || listJson.status !== "success") throw new Error();

    const psikolog = listJson.data.find((p) => p.name === nama);
    if (!psikolog) {
      Swal.fire({ icon: "error", title: "Psikolog tidak ditemukan" });
      return;
    }

    // Fetch detail psikolog by id
    const res = await fetch(
      `https://mentalwell10-api-production.up.railway.app/admin/psychologist/${psikolog.id}`,
      { headers: { Authorization: `Bearer ${TOKEN}` } }
    );
    const result = await res.json();
    if (res.ok && result.status === "success") {
      const data = result.data;
      form.nama.value = data.name || "";
      form.email.value = data.email || "";
      form.password.value = "********";
      form.nohp.value = data.phone_number || "";
      form.tanggallahir.value = data.birthdate
        ? data.birthdate.slice(0, 10)
        : "";
      form.jeniskelamin.value = data.gender || "";
      form.pengalaman.value = data.experience || "";
      form.bio.value = data.bio || "";

      // Topik keahlian (checkbox)
      if (Array.isArray(data.topics)) {
        data.topics.forEach((t) => {
          const cb = form.querySelector(
            `input[type="checkbox"][value="${t.name}"]`
          );
          if (cb) cb.checked = true;
        });
      }

      // Jadwal (schedules)
      if (Array.isArray(data.schedules)) {
        const jadwalRows = form.querySelectorAll(".jadwal-row");
        data.schedules.forEach((jadwal, idx) => {
          if (jadwalRows[idx]) {
            const hariSelect = jadwalRows[idx].querySelector(
              'select[name="hari[]"]'
            );
            const jamMulai = jadwalRows[idx].querySelector(
              'input[name="jamMulai[]"]'
            );
            const jamSelesai = jadwalRows[idx].querySelector(
              'input[name="jamSelesai[]"]'
            );
            if (hariSelect && jadwal.day) hariSelect.value = jadwal.day;
            if (jamMulai && jadwal.start_time)
              jamMulai.value = jadwal.start_time.slice(0, 5);
            if (jamSelesai && jadwal.end_time)
              jamSelesai.value = jadwal.end_time.slice(0, 5);
          }
        });
      }

      // Tampilkan nama file gambar dan preview
      if (data.profile_image) {
        const urlParts = data.profile_image.split("/");
        namaFile.value = urlParts[urlParts.length - 1];
        let imgPreview = document.createElement("img");
        imgPreview.src = data.profile_image;
        imgPreview.alt = "Foto Profil";
        imgPreview.style.maxWidth = "200px";
        imgPreview.style.display = "block";
        imgPreview.style.marginBottom = "10px";
        namaFile.parentNode.insertBefore(imgPreview, namaFile);
      } else {
        namaFile.value = "";
      }
    } else {
      Swal.fire({ icon: "error", title: "Gagal memuat detail psikolog" });
    }
  } catch (err) {
    Swal.fire({ icon: "error", title: "Gagal terhubung ke server" });
  }

  // Tombol kembali
  btnKembali.addEventListener("click", () => {
    window.history.back();
  });

  // Enable input untuk edit
  Array.from(form.elements).forEach((el) => {
    el.readOnly = false;
    el.disabled = false;
  });
  gambarInput.style.display = "block";

  // Preview nama file saat pilih gambar baru
  gambarInput.addEventListener("change", function () {
    if (gambarInput.files && gambarInput.files[0]) {
      namaFile.value = gambarInput.files[0].name;
    }
  });

  // Submit form untuk edit psikolog
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const TOKEN = sessionStorage.getItem("authToken");
    if (!TOKEN) {
      Swal.fire({ icon: "error", title: "Token tidak ditemukan" });
      return;
    }

    // Siapkan FormData hanya dengan field yang tidak kosong
    const formData = new FormData();
    if (form.nama.value.trim()) formData.append("name", form.nama.value.trim());
    if (form.nickname && form.nickname.value.trim())
      formData.append("nickname", form.nickname.value.trim());
    if (form.email.value.trim())
      formData.append("email", form.email.value.trim());
    if (form.nohp.value.trim())
      formData.append("phone_number", form.nohp.value.trim());
    if (form.tanggallahir.value.trim())
      formData.append("birthdate", form.tanggallahir.value.trim());
    if (form.jeniskelamin.value.trim())
      formData.append("gender", form.jeniskelamin.value.trim());
    if (form.bio.value.trim()) formData.append("bio", form.bio.value.trim());
    if (form.pengalaman.value.trim())
      formData.append("experience", form.pengalaman.value.trim());
    if (form.harga && form.harga.value.trim())
      formData.append("price", form.harga.value.trim());
    if (gambarInput.files && gambarInput.files[0])
      formData.append("profile_image", gambarInput.files[0]);
    // Optional: availability
    if (form.availability && form.availability.value.trim())
      formData.append("availability", form.availability.value.trim());

    // Topik keahlian (checkbox, value ID)
    const topics = Array.from(
      form.querySelectorAll('input[name="keahlian"]:checked')
    ).map((cb) => Number(cb.value));
    formData.append("topics", JSON.stringify(topics.length ? topics : []));

    // Jadwal (custom date)
    const tanggalArr = Array.from(
      form.querySelectorAll('input[name="tanggal[]"]')
    ).map((i) => i.value);
    const jamMulaiArr = Array.from(
      form.querySelectorAll('input[name="jamMulai[]"]')
    ).map((i) => i.value);
    const jamSelesaiArr = Array.from(
      form.querySelectorAll('input[name="jamSelesai[]"]')
    ).map((i) => i.value);
    const schedules = [];
    for (let i = 0; i < tanggalArr.length; i++) {
      if (tanggalArr[i]) {
        const time = `${jamMulaiArr[i]} - ${jamSelesaiArr[i]}`;
        schedules.push({ date: tanggalArr[i], time });
      }
    }
    formData.append(
      "schedules",
      JSON.stringify(schedules.length ? schedules : [])
    );

    try {
      const res = await fetch(
        `https://mentalwell10-api-production.up.railway.app/admin/psychologists/${psikolog.id}`,
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
});
