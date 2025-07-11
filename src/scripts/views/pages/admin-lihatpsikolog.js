document.addEventListener("DOMContentLoaded", async function () {
  // Tombol kembali
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

  // Ambil token
  const TOKEN = sessionStorage.getItem("authToken");
  if (!TOKEN) {
    window.location.href = "https://mentalwell-10-frontend.vercel.app/";
    return;
  }

  try {
    const res = await fetch(
      `https://mentalwell10-api-production.up.railway.app/admin/psychologists/${psikologId}`,
      { headers: { Authorization: `Bearer ${TOKEN}` } }
    );
    const json = await res.json();

    if (!res.ok || json.status !== "success") {
      Swal.fire("Gagal!", json.message || "Gagal mengambil data.", "error");
      return;
    }

    const data = json.data;
    // Isi form
    const form = document.getElementById("formPsikolog");
    form.nama.value = data.name || "";
    form.nickname.value = data.nickname || "";
    form.email.value = data.email || "";
    form.password.value = "********";
    form.nowa.value = data.phone_number || "";
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

    // Jadwal (readonly, bentuk sama seperti tambah psikolog)
    const jadwalContainer = document.getElementById("jadwalContainer");
    jadwalContainer.innerHTML = "";
    if (Array.isArray(data.schedules) && data.schedules.length > 0) {
      data.schedules.forEach((sch) => {
        let hari = sch.day
          ? sch.day.charAt(0).toUpperCase() + sch.day.slice(1)
          : sch.date
          ? sch.date
          : "-";
        const row = document.createElement("div");
        row.className = "row mb-2 align-items-center jadwal-row";
        row.innerHTML = `
          <div class="col-md-4">
            <input type="text" class="form-control" value="${hari}" readonly>
          </div>
          <div class="col-md-6">
            <div class="d-flex">
              <input type="time" class="form-control me-2" value="${
                sch.start_time || ""
              }" readonly>
              <span class="mx-1 d-flex align-items-center">-</span>
              <input type="time" class="form-control ms-2" value="${
                sch.end_time || ""
              }" readonly>
            </div>
          </div>
        `;
        jadwalContainer.appendChild(row);
      });
    } else {
      jadwalContainer.innerHTML =
        "<span class='text-muted'>Tidak ada jadwal</span>";
    }

    // Foto profil
    if (data.profile_image) {
      const namaFileInput = document.getElementById("namaFile");
      if (namaFileInput)
        namaFileInput.value = data.profile_image.split("/").pop();
    }

    // Disable semua input (readonly)
    Array.from(form.elements).forEach((el) => {
      el.disabled = true;
    });
    document.getElementById("btnKembali").disabled = false;
  } catch (e) {
    Swal.fire("Gagal!", "Tidak dapat terhubung ke server.", "error");
  }
});
