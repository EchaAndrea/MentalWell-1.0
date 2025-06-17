document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("formArtikel");
  const btnKembali = document.getElementById("btnKembali");
  const namaFile = document.getElementById("namaFile");

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

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
});
