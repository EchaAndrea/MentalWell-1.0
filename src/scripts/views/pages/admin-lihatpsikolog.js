document.addEventListener("DOMContentLoaded", async function () {
  // Tombol kembali
  document.getElementById("btnKembali").addEventListener("click", () => {
    window.history.back();
  });

  // Ambil ID dari query string
  const urlParams = new URLSearchParams(window.location.search);
  const psikologId = urlParams.get("id");
  if (!psikologId) {
    alert("ID psikolog tidak ditemukan.");
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
      `https://mentalwell10-api-production.up.railway.app/admin/psychologist/${psikologId}`,
      {
        headers: { Authorization: `Bearer ${TOKEN}` },
      }
    );
    if (res.status === 401) {
      alert("Sesi Anda sudah habis atau tidak valid. Silakan login ulang.");
      window.location.href = "https://mentalwell-10-frontend.vercel.app/";
      return;
    }
    const json = await res.json();
    if (json.status !== "success") throw new Error("Gagal mengambil data.");

    const data = json.data;
    // Isi form
    const form = document.getElementById("formArtikel");
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

    // Jadwal (tabel seperti di admin-psikolog)
    const jadwalContainer = document.getElementById("jadwalContainer");
    jadwalContainer.innerHTML = "";
    if (Array.isArray(data.schedules) && data.schedules.length > 0) {
      let table = `
        <div class="table-responsive">
          <table class="table table-bordered table-sm mb-0">
            <thead>
              <tr>
                <th>No</th>
                <th>Hari/Tanggal</th>
                <th>Jam Mulai</th>
                <th>Jam Selesai</th>
              </tr>
            </thead>
            <tbody>
      `;
      data.schedules.forEach((sch, idx) => {
        let hariTanggal = sch.day ? sch.day : sch.date;
        table += `
          <tr>
            <td>${idx + 1}</td>
            <td>${hariTanggal || "-"}</td>
            <td>${sch.start_time || "-"}</td>
            <td>${sch.end_time || "-"}</td>
          </tr>
        `;
      });
      table += `
            </tbody>
          </table>
        </div>
      `;
      jadwalContainer.innerHTML = table;
    } else {
      jadwalContainer.innerHTML =
        "<span class='text-muted'>Tidak ada jadwal</span>";
    }

    // Foto profil
    if (data.profile_image) {
      document.getElementById("namaFile").value = data.profile_image
        .split("/")
        .pop();
      let imgPreview = document.getElementById("imgPreview");
      if (!imgPreview) {
        imgPreview = document.createElement("img");
        imgPreview.id = "imgPreview";
        imgPreview.style.maxWidth = "120px";
        imgPreview.style.display = "block";
        imgPreview.style.marginTop = "10px";
        document.getElementById("namaFile").parentNode.appendChild(imgPreview);
      }
      imgPreview.src = data.profile_image;
    }

    // Disable semua input (readonly)
    Array.from(form.elements).forEach((el) => {
      el.disabled = true;
    });
    document.getElementById("btnKembali").disabled = false;
  } catch (e) {
    alert("Gagal memuat detail psikolog.");
  }
});
