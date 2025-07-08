async function fetchPsychologistPrice(psikologId) {
  const token = sessionStorage.getItem("authToken");

  try {
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

async function setupRealtimeSchedule(psikologId) {
  const now = new Date();
  const pad = (n) => n.toString().padStart(2, "0");
  const tanggal = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
    now.getDate()
  )}`;
  const waktu = `${pad(now.getHours())}:${pad(now.getMinutes())}-${pad(
    now.getHours() + 1
  )}:${pad(now.getMinutes())}`;

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
  return jadwal;
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
  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get("mode");
  const psikologId = urlParams.get("id");

  // Setup jadwal untuk mode realtime/chat jika belum ada
  if (mode === "chat" || mode === "realtime") {
    const jadwal = JSON.parse(localStorage.getItem("jadwal") || "{}");
    if (!jadwal.psychologist_id) {
      await setupRealtimeSchedule(psikologId);
    }
  }

  const jadwal = JSON.parse(localStorage.getItem("jadwal") || "{}");

  if (!jadwal.psychologist_id) {
    Swal.fire({
      icon: "error",
      title: "Data tidak lengkap",
      text: "Silakan ulangi proses pemesanan dari awal.",
    }).then(() => (window.location.href = "/listpsikolog"));
    return;
  }

  let harga = parseInt(jadwal.harga) || 0;
  if (harga === 0) {
    try {
      harga = await fetchPsychologistPrice(jadwal.psychologist_id);
      jadwal.harga = harga;
      localStorage.setItem("jadwal", JSON.stringify(jadwal));
    } catch (error) {
      console.error("Error fetching price:", error);
    }
  }

  const biayaAplikasi = 15000;
  const total = harga + biayaAplikasi;

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
