function formatTanggalIndo(tanggalStr) {
  if (!tanggalStr) return "-";
  const bulan = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];
  const [tahun, bulanIdx, tanggal] = tanggalStr.split("-");
  return `${parseInt(tanggal)} ${bulan[parseInt(bulanIdx) - 1]} ${tahun}`;
}

async function fetchUserProfile() {
  const token = sessionStorage.getItem("authToken");
  try {
    const response = await fetch(
      "https://mentalwell10-api-production.up.railway.app/my-data",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const data = await response.json();
    return data.result.users;
  } catch (e) {
    return null;
  }
}

async function confirmPayment() {
  const token = sessionStorage.getItem("authToken");
  const jadwal = JSON.parse(localStorage.getItem("jadwal") || "{}");
  const psychologist_id = jadwal.psychologist_id;
  const problemData = JSON.parse(localStorage.getItem("counseling_problem") || "{}");
  const buktiBayar = document.getElementById("buktiBayar")?.files[0];

  if (!psychologist_id || !buktiBayar) {
    Swal.fire("Data tidak lengkap. Silakan upload bukti pembayaran.");
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
      const counseling_id = data.newCounseling?.counseling_id; // FIXED HERE
      if (!counseling_id) {
        Swal.close();
        Swal.fire("Gagal mendapatkan ID konseling.");
        return;
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
        localStorage.setItem("active_conversation_id", conversation_id);
      }

      const mode = new URLSearchParams(window.location.search).get("mode");
      setTimeout(() => {
        Swal.close();
        window.location.href = `/jadwalkonseling-selesai?id=${psychologist_id}${mode ? `&mode=${mode}` : ""}`;
      }, 1000);
    } else {
      Swal.close();
      Swal.fire(data.message || "Gagal mengirim pembayaran");
    }
  } catch (e) {
    Swal.close();
    Swal.fire("Gagal mengirim pembayaran");
  }
}

async function createRealtimeCounseling() {
  const token = sessionStorage.getItem("authToken");
  const jadwal = JSON.parse(localStorage.getItem("jadwal") || "{}");
  const psychologist_id = jadwal.psychologist_id;
  const problemData = JSON.parse(localStorage.getItem("counseling_problem") || "{}");
  const buktiBayar = document.getElementById("buktiBayar")?.files[0];

  if (!psychologist_id || !buktiBayar) {
    Swal.fire("Data tidak lengkap. Silakan upload bukti pembayaran.");
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
        Swal.close();
        Swal.fire("Gagal mendapatkan ID konseling.");
        return;
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
        localStorage.setItem("active_conversation_id", conversation_id);
      }

      const mode = new URLSearchParams(window.location.search).get("mode");
      setTimeout(() => {
        Swal.close();
        window.location.href = `/jadwalkonseling-selesai?id=${psychologist_id}${mode ? `&mode=${mode}` : ""}`;
      }, 1000);
    } else {
      Swal.close();
      Swal.fire(data.message || "Gagal mengirim counseling realtime");
    }
  } catch (e) {
    Swal.close();
    Swal.fire("Gagal mengirim counseling realtime");
  }
}

document.addEventListener("DOMContentLoaded", async function () {
  const path = window.location.pathname;
  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get("mode");
  const psikologId = urlParams.get("id");

  if (mode === "chat" || mode === "realtime") {
    const now = new Date();
    const pad = (n) => n.toString().padStart(2, "0");
    const tanggal = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const waktu = `${pad(now.getHours())}:${pad(now.getMinutes())}-${pad(now.getHours() + 1)}:${pad(now.getMinutes())}`;
    let harga = 0;

    try {
      const res = await fetch(
        `https://mentalwell10-api-production.up.railway.app/psychologists/${psikologId}`
      );
      const data = await res.json();
      harga = data.data?.price || 0;
    } catch {}

    const jadwal = {
      tanggal,
      waktu,
      metode: "realtime",
      psychologist_id: psikologId,
      harga,
      virtual_account: "123 456 789 1011",
    };
    localStorage.setItem("jadwal", JSON.stringify(jadwal));

    const selectedDateEl = document.getElementById("selectedDate");
    if (selectedDateEl) selectedDateEl.textContent = formatTanggalIndo(tanggal);
    const selectedTimeEl = document.getElementById("selectedTime");
    if (selectedTimeEl) selectedTimeEl.textContent = waktu;
  }

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

    const harga = parseInt(jadwal.harga) || 0;
    const biayaAplikasi = 15000;
    const total = harga + biayaAplikasi;

    const spans = document.querySelectorAll("span");
    if (spans[1]) spans[1].textContent = `Rp. ${harga.toLocaleString("id-ID")}`;
    if (spans[3]) spans[3].textContent = `Rp. ${biayaAplikasi.toLocaleString("id-ID")}`;
    if (spans[5]) spans[5].textContent = `Rp. ${total.toLocaleString("id-ID")}`;

    const h5s = document.querySelectorAll("h5.fw-bold");
    if (h5s[1]) h5s[1].textContent = `Rp. ${total.toLocaleString("id-ID")}`;
    if (h5s[0]) h5s[0].textContent = jadwal.virtual_account || "123 456 789 1011";
  }

  const btn = document.getElementById("btnKonfirmasiPembayaran");
  if (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      Swal.fire({
        title: "Konfirmasi",
        text: "Apakah Anda yakin sudah melakukan pembayaran?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#044b77",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sudah Bayar",
      }).then((result) => {
        if (result.isConfirmed) {
          if (mode === "realtime") {
            createRealtimeCounseling();
          } else {
            confirmPayment();
          }
        }
      });
    });
  }
});

function redirectToCounseling2() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const mode = params.get("mode");

  window.location.href = `/jadwalkonseling-permasalahan?id=${id}${mode ? `&mode=${mode}` : ""}`;
}

function sendCounselingData() {
  const description = document.getElementById("descriptionTextarea")?.value.trim();
  const hope = document.getElementById("hopeAfterTextarea")?.value.trim();

  if (!description || !hope) {
    Swal.fire("Mohon isi deskripsi masalah dan harapan Anda.");
    return;
  }

  localStorage.setItem("counseling_problem", JSON.stringify({ problem: description, hope: hope }));

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const mode = params.get("mode");

  window.location.href = `/jadwalkonseling-pembayaran?id=${id}${mode ? `&mode=${mode}` : ""}`;
}
