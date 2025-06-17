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
      window.location.href = "/";
      return;
    }

    // Fetch semua psikolog untuk dapatkan id dari nama
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
      form.nickname.value = data.nickname || "";
      form.email.value = data.email || "";
      form.password.value = "";
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
            if (hariSelect && jadwal.day)
              hariSelect.value =
                jadwal.day.charAt(0).toUpperCase() + jadwal.day.slice(1);
            if (jamMulai && jadwal.start_time)
              jamMulai.value = jadwal.start_time.slice(0, 5);
            if (jamSelesai && jadwal.end_time)
              jamSelesai.value = jadwal.end_time.slice(0, 5);
          }
        });
      }

      // Preview nama file gambar dan gambar profil
      if (data.profile_image) {
        const urlParts = data.profile_image.split("/");
        namaFile.value = urlParts[urlParts.length - 1];

        // Cek apakah sudah ada imgPreview, jika belum buat dan letakkan sebelum namaFile
        let imgPreview = document.getElementById("imgPreview");
        if (!imgPreview) {
          imgPreview = document.createElement("img");
          imgPreview.id = "imgPreview";
          imgPreview.style.maxWidth = "200px";
          imgPreview.style.display = "block";
          imgPreview.style.marginBottom = "10px";
          // Sisipkan sebelum namaFile agar urutan: gambar, lalu nama file
          namaFile.parentNode.insertBefore(imgPreview, namaFile);
        }
        imgPreview.src = data.profile_image;
        imgPreview.alt = "Foto Profil";
      } else {
        namaFile.value = "";
        const imgPreview = document.getElementById("imgPreview");
        if (imgPreview) imgPreview.remove();
      }
    } else {
      Swal.fire({ icon: "error", title: "Gagal memuat detail psikolog" });
    }
  } catch (err) {
    Swal.fire({ icon: "error", title: "Gagal terhubung ke server" });
  }

  // Enable input untuk edit
  Array.from(form.elements).forEach((el) => {
    el.readOnly = false;
    el.disabled = false;
  });
  gambarInput.style.display = "none"; // tetap hidden, hanya pakai tombol custom

  // Input gambar: update nama file dan preview saat pilih file baru
  gambarInput.addEventListener("change", () => {
    const fileName =
      gambarInput.files.length > 0 ? gambarInput.files[0].name : "";
    namaFile.value = fileName;

    let imgPreview = document.getElementById("imgPreview");
    if (!imgPreview) {
      imgPreview = document.createElement("img");
      imgPreview.id = "imgPreview";
      imgPreview.style.maxWidth = "200px";
      imgPreview.style.display = "block";
      imgPreview.style.marginBottom = "10px";
      namaFile.parentNode.insertBefore(imgPreview, namaFile);
    }
    const file = gambarInput.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        imgPreview.src = e.target.result;
        imgPreview.alt = "Foto Profil";
      };
      reader.readAsDataURL(file);
    } else {
      imgPreview.src = "";
      imgPreview.alt = "";
    }
  });

  // Submit form untuk edit psikolog
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData();

    // Hanya kirim field yang diisi
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
    if (form.password && form.password.value.trim())
      formData.append("password", form.password.value.trim());
    if (gambarInput.files && gambarInput.files[0])
      formData.append("profile_image", gambarInput.files[0]);

    // Topik keahlian (checkbox, value ID)
    const topics = Array.from(
      form.querySelectorAll('input[name="keahlian"]:checked')
    ).map((cb) => Number(cb.value));
    if (topics.length > 0) formData.append("topics", JSON.stringify(topics));

    // Jadwal (schedules)
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
        const time = `${jamMulaiArr[i]} - ${jamSelesaiArr[i]}`;
        schedules.push({ day: hariArr[i].toLowerCase(), time });
      }
    }
    if (schedules.length > 0)
      formData.append("schedules", JSON.stringify(schedules));

    try {
      const TOKEN = sessionStorage.getItem("authToken");
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
        }).then(
          () => (window.location.href = "/src/templates/admin-psikolog.html")
        );
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

  // Tombol kembali
  btnKembali.addEventListener("click", () => {
    window.history.back();
  });
});
