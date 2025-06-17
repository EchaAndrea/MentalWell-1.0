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
    form.jeniskelamin.value = data.gender || ""; // Jika ada field gender
    form.pengalaman.value = data.experience || "";
    form.harga.value = data.price || "";
    form.bio.value = data.bio || "";

    // Topik keahlian (checkbox)
    if (Array.isArray(data.topics)) {
      data.topics.forEach((topic) => {
        // Cekbox value bisa disesuaikan dengan id atau name
        const checkbox = form.querySelector(
          `input[name="keahlian"][value="${topic.id}"]`
        );
        if (checkbox) checkbox.checked = true;
      });
    }

    // Jadwal
    const jadwalContainer = document.getElementById("jadwalContainer");
    jadwalContainer.innerHTML = "";
    if (Array.isArray(data.schedules) && data.schedules.length > 0) {
      data.schedules.forEach((sch) => {
        let jadwalText = "";
        if (sch.day) {
          jadwalText = `${sch.day}, ${sch.start_time} - ${sch.end_time}`;
        } else if (sch.date) {
          jadwalText = `${sch.date}, ${sch.start_time} - ${sch.end_time}`;
        }
        jadwalContainer.innerHTML += `<div class="badge bg-primary me-2 mb-2">${jadwalText}</div>`;
      });
    } else {
      jadwalContainer.innerHTML =
        "<span class='text-muted'>Tidak ada jadwal</span>";
    }

    // Foto profil
    if (data.profile_image) {
      // Tampilkan nama file atau preview gambar
      document.getElementById("namaFile").value = data.profile_image
        .split("/")
        .pop();
      // Optional: tampilkan preview gambar
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
    // Kecuali tombol kembali
    document.getElementById("btnKembali").disabled = false;
  } catch (e) {
    alert("Gagal memuat detail psikolog. Silakan coba lagi nanti.");
    console.error(e);
  }
});
