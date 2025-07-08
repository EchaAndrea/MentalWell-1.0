function formatTanggalIndo(tanggalStr) {
  if (!tanggalStr) return "-";
  const bulan = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  const [tahun, bulanIdx, tanggal] = tanggalStr.split("-");
  return `${parseInt(tanggal)} ${bulan[parseInt(bulanIdx) - 1]} ${tahun}`;
}

async function fetchUserProfile() {
  const token = sessionStorage.getItem("authToken");
  if (!token) {
    throw new Error("Token tidak ditemukan");
  }

  try {
    const response = await fetch(
      "https://mentalwell10-api-production.up.railway.app/my-data",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.ok) {
      throw new Error("Gagal mengambil data user");
    }

    const data = await response.json();
    return data.result.users;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
}

async function fetchPsychologistPrice(psikologId) {
  const token = sessionStorage.getItem("authToken");

  try {
    // Coba ambil dari API schedules dulu
    const scheduleRes = await fetch(
      `https://mentalwell10-api-production.up.railway.app/psychologists/${psikologId}/schedules`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (scheduleRes.ok) {
      const scheduleData = await scheduleRes.json();
      if (scheduleData.price) {
        return parseInt(scheduleData.price);
      }
    }

    // Fallback ke API psikolog individual
    const psychRes = await fetch(
      `https://mentalwell10-api-production.up.railway.app/psychologists/${psikologId}`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );

    if (psychRes.ok) {
      const psychData = await psychRes.json();
      return parseInt(psychData.price || psychData.data?.price || 0);
    }

    return 0;
  } catch (error) {
    console.error("Error fetching psychologist price:", error);
    return 0;
  }
}

async function confirmPayment() {
  const token = sessionStorage.getItem("authToken");
  const jadwal = JSON.parse(localStorage.getItem("jadwal") || "{}");
  const psychologist_id = jadwal.psychologist_id;
  const problemData = JSON.parse(
    localStorage.getItem("counseling_problem") || "{}"
  );
  const buktiBayar = document.getElementById("buktiBayar")?.files[0];

  if (!psychologist_id || !buktiBayar) {
    Swal.fire({
      icon: "warning",
      title: "Data Tidak Lengkap",
      text: "Silakan upload bukti pembayaran terlebih dahulu.",
    });
    return;
  }

  const formData = new FormData();
  formData.append("occupation", "Mahasiswa");
  formData.append("problem_description", problemData.problem || "");
  formData.append("hope_after", problemData.hope || "");
  formData.append("date", jadwal.tanggal || "");
  formData.append("time", jadwal.waktu || "");
  formData.append("payment_proof", buktiBayar);

  Swal.fire({
    title: "Memproses pembayaran...",
    didOpen: () => Swal.showLoading(),
    allowOutsideClick: false,
  });

  try {
    const res = await fetch(
      `https://mentalwell10-api-production.up.railway.app/counselings/${psychologist_id}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      }
    );

    const data = await res.json();
    if (data.status === "success") {
      const counseling_id = data.newCounseling?.counseling_id;
      if (!counseling_id) {
        throw new Error("Counseling ID tidak ditemukan dalam response");
      }

      localStorage.setItem("last_counseling_id", counseling_id);

      // Ambil detail counseling untuk mendapatkan conversation_id
      const detail = await fetch(
        `https://mentalwell10-api-production.up.railway.app/counseling/${counseling_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      ).then((res) => res.json());

      const conversation_id = detail.counseling?.conversation_id;
      if (conversation_id) {
        localStorage.setItem("last_conversation_id", conversation_id);
      }

      Swal.close();

      // Redirect ke halaman selesai dulu
      const mode = new URLSearchParams(window.location.search).get("mode");
      const psikologId = new URLSearchParams(window.location.search).get("id");
      window.location.href = `/jadwalkonseling-selesai?id=${psikologId}${
        mode ? `&mode=${mode}` : ""
      }`;
    } else {
      Swal.close();
      Swal.fire({
        icon: "error",
        title: "Pembayaran Gagal",
        text: data.message || "Gagal mengirim pembayaran",
      });
    }
  } catch (error) {
    console.error("Payment error:", error);
    Swal.close();
    Swal.fire({
      icon: "error",
      title: "Pembayaran Gagal",
      text: "Gagal memproses pembayaran. Silakan coba lagi.",
    });
  }
}

async function createRealtimeCounseling() {
  const token = sessionStorage.getItem("authToken");
  const jadwal = JSON.parse(localStorage.getItem("jadwal") || "{}");
  const psychologist_id = jadwal.psychologist_id;
  const problemData = JSON.parse(
    localStorage.getItem("counseling_problem") || "{}"
  );
  const buktiBayar = document.getElementById("buktiBayar")?.files[0];

  if (!psychologist_id || !buktiBayar) {
    Swal.fire({
      icon: "warning",
      title: "Data Tidak Lengkap",
      text: "Silakan upload bukti pembayaran terlebih dahulu.",
    });
    return;
  }

  const formData = new FormData();
  formData.append("occupation", "Mahasiswa");
  formData.append("problem_description", problemData.problem || "");
  formData.append("hope_after", problemData.hope || "");
  formData.append("payment_proof", buktiBayar);

  Swal.fire({
    title: "Memproses pembayaran...",
    didOpen: () => Swal.showLoading(),
    allowOutsideClick: false,
  });

  try {
    const res = await fetch(
      `https://mentalwell10-api-production.up.railway.app/realtime/counseling/${psychologist_id}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      }
    );

    const data = await res.json();
    if (data.status === "success") {
      const counseling_id = data.newCounseling?.counseling_id;
      if (!counseling_id) {
        throw new Error("Counseling ID tidak ditemukan dalam response");
      }

      localStorage.setItem("last_counseling_id", counseling_id);

      Swal.close();

      // Redirect ke halaman selesai dulu
      const mode = new URLSearchParams(window.location.search).get("mode");
      const psikologId = new URLSearchParams(window.location.search).get("id");
      window.location.href = `/jadwalkonseling-selesai?id=${psikologId}&mode=${
        mode || "chat"
      }`;
    } else {
      Swal.close();
      Swal.fire({
        icon: "error",
        title: "Pembayaran Gagal",
        text: data.message || "Gagal mengirim counseling realtime",
      });
    }
  } catch (error) {
    console.error("Realtime counseling error:", error);
    Swal.close();
    Swal.fire({
      icon: "error",
      title: "Pembayaran Gagal",
      text: "Gagal memproses counseling realtime. Silakan coba lagi.",
    });
  }
}

document.addEventListener("DOMContentLoaded", async function () {
  const path = window.location.pathname;
  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get("mode");
  const psikologId = urlParams.get("id");

  // Handle halaman isi data
  if (path.includes("jadwalkonseling-isidata")) {
    try {
      // Fetch user profile untuk mengisi data diri
      const userProfile = await fetchUserProfile();
      const jadwal = JSON.parse(localStorage.getItem("jadwal") || "{}");

      // Validasi data jadwal
      if (!jadwal.tanggal || !jadwal.waktu || !jadwal.psychologist_id) {
        Swal.fire({
          icon: "warning",
          title: "Data jadwal tidak ditemukan",
          text: "Silakan pilih jadwal terlebih dahulu",
        }).then(() => {
          if (mode === "chat" || mode === "realtime") {
            window.location.href = `/profilpsikolog?id=${psikologId}`;
          } else {
            window.location.href = `/jadwalpsikolog?id=${psikologId}`;
          }
        });
        return;
      }

      // Fill data diri
      const inputs = document.querySelectorAll(".form-center input");
      if (userProfile && inputs.length >= 5) {
        inputs[0].value = userProfile.name || ""; // Nama Lengkap
        inputs[1].value = userProfile.nickname || userProfile.name || ""; // Nama Panggilan
        inputs[2].value = userProfile.birth_date || ""; // Tanggal lahir
        inputs[3].value = userProfile.gender || ""; // Gender
        inputs[4].value = userProfile.phone || ""; // Nomor HP
      }

      // Fill jadwal data
      const selectedDateEl = document.getElementById("selectedDate");
      const selectedTimeEl = document.getElementById("selectedTime");

      if (selectedDateEl && jadwal.tanggal) {
        selectedDateEl.textContent = formatTanggalIndo(jadwal.tanggal);
      }
      if (selectedTimeEl && jadwal.waktu) {
        selectedTimeEl.textContent = jadwal.waktu + " WIB";
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal memuat data",
        text: "Silakan refresh halaman atau login ulang",
      });
    }
  }

  // Handle mode chat/realtime untuk mengisi data otomatis
  if (mode === "chat" || mode === "realtime") {
    const now = new Date();
    const pad = (n) => n.toString().padStart(2, "0");
    const tanggal = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
      now.getDate()
    )}`;
    const waktu = `${pad(now.getHours())}:${pad(now.getMinutes())}-${pad(
      now.getHours() + 1
    )}:${pad(now.getMinutes())}`;

    // Fetch harga psikolog
    let harga = 0;
    try {
      harga = await fetchPsychologistPrice(psikologId);
    } catch (error) {
      console.error("Error fetching price:", error);
    }

    const jadwal = {
      tanggal,
      waktu,
      metode: "realtime",
      psychologist_id: psikologId,
      harga,
      virtual_account: "123 456 789 1011",
    };
    localStorage.setItem("jadwal", JSON.stringify(jadwal));

    // Update tampilan jika ada element
    const selectedDateEl = document.getElementById("selectedDate");
    if (selectedDateEl) selectedDateEl.textContent = formatTanggalIndo(tanggal);
    const selectedTimeEl = document.getElementById("selectedTime");
    if (selectedTimeEl) selectedTimeEl.textContent = waktu + " WIB";
  }

  // Handle halaman pembayaran
  if (path.includes("jadwalkonseling-pembayaran")) {
    const jadwal = JSON.parse(localStorage.getItem("jadwal") || "{}");

    if (!jadwal.psychologist_id) {
      Swal.fire({
        icon: "error",
        title: "Data tidak lengkap",
        text: "Silakan ulangi proses pemesanan dari awal.",
      }).then(() => (window.location.href = "/listpsikolog"));
      return;
    }

    // Pastikan harga ada, jika tidak fetch ulang
    let harga = parseInt(jadwal.harga) || 0;
    if (harga === 0) {
      try {
        harga = await fetchPsychologistPrice(jadwal.psychologist_id);

        // Update localStorage dengan harga yang benar
        jadwal.harga = harga;
        localStorage.setItem("jadwal", JSON.stringify(jadwal));
      } catch (error) {
        console.error("Error fetching price:", error);
      }
    }

    const biayaAplikasi = 15000;
    const total = harga + biayaAplikasi;

    // Update tampilan harga dengan selector yang lebih spesifik
    const hargaKonselingEl = document.getElementById("harga-konseling");
    const biayaAplikasiEl = document.getElementById("biaya-aplikasi");
    const totalPembayaranEl = document.getElementById("total-pembayaran");
    const virtualAccountEl = document.getElementById("virtual-account");
    const totalPembayaranVaEl = document.getElementById("total-pembayaran-va");

    // Jika tidak ada ID spesifik, gunakan selector fallback
    if (!hargaKonselingEl) {
      const spans = document.querySelectorAll(".card .d-flex span");
      if (spans.length >= 6) {
        spans[1].textContent = `Rp. ${harga.toLocaleString("id-ID")}`;
        spans[3].textContent = `Rp. ${biayaAplikasi.toLocaleString("id-ID")}`;
        spans[5].textContent = `Rp. ${total.toLocaleString("id-ID")}`;
      }

      const h5s = document.querySelectorAll("h5.fw-bold");
      if (h5s.length >= 2) {
        h5s[1].textContent = `Rp. ${total.toLocaleString("id-ID")}`;
      }
      if (h5s.length >= 1) {
        h5s[0].textContent = jadwal.virtual_account || "123 456 789 1011";
      }
    } else {
      // Gunakan ID spesifik jika ada
      if (hargaKonselingEl)
        hargaKonselingEl.textContent = `Rp. ${harga.toLocaleString("id-ID")}`;
      if (biayaAplikasiEl)
        biayaAplikasiEl.textContent = `Rp. ${biayaAplikasi.toLocaleString(
          "id-ID"
        )}`;
      if (totalPembayaranEl)
        totalPembayaranEl.textContent = `Rp. ${total.toLocaleString("id-ID")}`;
      if (virtualAccountEl)
        virtualAccountEl.textContent =
          jadwal.virtual_account || "123 456 789 1011";
      if (totalPembayaranVaEl)
        totalPembayaranVaEl.textContent = `Rp. ${total.toLocaleString(
          "id-ID"
        )}`;
    }
  }

  // Event listener untuk tombol konfirmasi pembayaran
  const btn = document.getElementById("btnKonfirmasiPembayaran");
  if (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();

      const mode = new URLSearchParams(window.location.search).get("mode");
      if (mode === "chat" || mode === "realtime") {
        createRealtimeCounseling();
      } else {
        confirmPayment();
      }
    });
  }
});

function redirectToCounseling2() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const mode = params.get("mode");

  // Validasi data sebelum redirect
  const jadwal = JSON.parse(localStorage.getItem("jadwal") || "{}");
  if (!jadwal.psychologist_id) {
    Swal.fire({
      icon: "error",
      title: "Data tidak lengkap",
      text: "Silakan ulangi proses pemesanan dari awal.",
    });
    return;
  }

  window.location.href = `/jadwalkonseling-permasalahan?id=${id}${
    mode ? `&mode=${mode}` : ""
  }`;
}

function sendCounselingData() {
  const description = document
    .getElementById("descriptionTextarea")
    ?.value.trim();
  const hope = document.getElementById("hopeAfterTextarea")?.value.trim();

  if (!description || !hope) {
    Swal.fire({
      icon: "warning",
      title: "Data Tidak Lengkap",
      text: "Mohon isi deskripsi masalah dan harapan Anda.",
    });
    return;
  }

  localStorage.setItem(
    "counseling_problem",
    JSON.stringify({
      problem: description,
      hope: hope,
    })
  );

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const mode = params.get("mode");

  window.location.href = `/jadwalkonseling-pembayaran?id=${id}${
    mode ? `&mode=${mode}` : ""
  }`;
}
