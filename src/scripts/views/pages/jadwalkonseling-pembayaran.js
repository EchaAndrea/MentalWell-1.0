async function fetchPsychologistPrice(psikologId) {
  const token = sessionStorage.getItem("authToken");

  try {
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

// Helper functions untuk menghindari duplikasi
function getPaymentData() {
  const token = sessionStorage.getItem("authToken");
  const jadwal = JSON.parse(localStorage.getItem("jadwal") || "{}");
  const psychologist_id = jadwal.psychologist_id;
  const problemData = JSON.parse(
    localStorage.getItem("counseling_problem") || "{}"
  );
  const buktiBayar = document.getElementById("buktiBayar")?.files[0];

  return { token, jadwal, psychologist_id, problemData, buktiBayar };
}

function validatePaymentInput(psychologist_id, buktiBayar) {
  if (!psychologist_id || !buktiBayar) {
    Swal.fire({
      icon: "warning",
      title: "Data Tidak Lengkap",
      text: "Silakan upload bukti pembayaran terlebih dahulu.",
    });
    return false;
  }
  return true;
}

function createFormData(
  problemData,
  buktiBayar,
  includeDateTime = false,
  jadwal = null
) {
  const formData = new FormData();
  formData.append("occupation", "Mahasiswa");
  formData.append("problem_description", problemData.problem || "");
  formData.append("hope_after", problemData.hope || "");

  if (includeDateTime && jadwal) {
    formData.append("date", jadwal.tanggal || "");
    formData.append("time", jadwal.waktu || "");
  }

  formData.append("payment_proof", buktiBayar);
  return formData;
}

function showLoadingDialog() {
  Swal.fire({
    title: "Memproses pembayaran...",
    didOpen: () => Swal.showLoading(),
    allowOutsideClick: false,
  });
}

function showErrorDialog(message) {
  Swal.close();
  Swal.fire({
    icon: "error",
    title: "Pembayaran Gagal",
    text: message,
  });
}

async function handleCounselingResponse(data, token, isRealtime = false) {
  console.log(
    `${isRealtime ? "Realtime" : "Regular"} counseling response:`,
    data
  );

  if (data.status !== "success") {
    throw new Error(
      data.message ||
        `Gagal mengirim ${isRealtime ? "counseling realtime" : "pembayaran"}`
    );
  }

  const counseling_id = data.newCounseling?.counseling_id;
  if (!counseling_id) {
    throw new Error("Counseling ID tidak ditemukan dalam response");
  }

  localStorage.setItem("last_counseling_id", counseling_id);

  // Handle conversation_id
  let conversation_id =
    data.newCounseling?.conversation_id || data.conversation_id;

  if (!conversation_id) {
    try {
      console.log("Fetching counseling detail for ID:", counseling_id);
      const detail = await fetch(
        `https://mentalwell10-api-production.up.railway.app/counseling/${counseling_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      ).then((res) => res.json());

      console.log("Counseling detail response:", detail);
      conversation_id = detail.counseling?.conversation_id;
    } catch (error) {
      console.error("Error fetching counseling detail:", error);
    }
  }

  if (conversation_id) {
    localStorage.setItem("active_conversation_id", conversation_id);
    console.log(
      `Saved conversation_id for ${
        isRealtime ? "realtime" : "regular"
      } counseling:`,
      conversation_id
    );
  } else if (isRealtime) {
    console.warn("No conversation_id found for realtime counseling");
  }

  Swal.close();

  const mode = new URLSearchParams(window.location.search).get("mode");
  const psikologId = new URLSearchParams(window.location.search).get("id");

  if (isRealtime) {
    window.location.href = `/jadwalkonseling-selesai?id=${psikologId}&mode=${
      mode || "chat"
    }`;
  } else {
    window.location.href = `/jadwalkonseling-selesai?id=${psikologId}${
      mode ? `&mode=${mode}` : ""
    }`;
  }
}

async function confirmPayment() {
  const { token, jadwal, psychologist_id, problemData, buktiBayar } =
    getPaymentData();

  if (!validatePaymentInput(psychologist_id, buktiBayar)) {
    return;
  }

  const formData = createFormData(problemData, buktiBayar, true, jadwal);
  showLoadingDialog();

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
    await handleCounselingResponse(data, token, false);
  } catch (error) {
    console.error("Payment error:", error);
    showErrorDialog("Gagal memproses pembayaran. Silakan coba lagi.");
  }
}

async function createRealtimeCounseling() {
  const { token, jadwal, psychologist_id, problemData, buktiBayar } =
    getPaymentData();

  if (!validatePaymentInput(psychologist_id, buktiBayar)) {
    return;
  }

  const formData = createFormData(problemData, buktiBayar, false);
  showLoadingDialog();

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
    await handleCounselingResponse(data, token, true);
  } catch (error) {
    console.error("Realtime counseling error:", error);
    showErrorDialog("Gagal memproses counseling realtime. Silakan coba lagi.");
  }
}

document.addEventListener("DOMContentLoaded", async function () {
  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get("mode");
  const psikologId = urlParams.get("id");

  // Validasi data jadwal yang sudah ada
  const jadwal = JSON.parse(localStorage.getItem("jadwal") || "{}");

  if (!jadwal.psychologist_id || !jadwal.tanggal || !jadwal.waktu) {
    Swal.fire({
      icon: "error",
      title: "Data tidak lengkap",
      text: "Silakan ulangi proses pemesanan dari awal.",
    }).then(() => {
      if (mode === "chat" || mode === "realtime") {
        window.location.href = `/jadwalkonseling-isidata?id=${psikologId}&mode=${mode}`;
      } else {
        window.location.href = `/jadwalkonseling-isidata?id=${psikologId}`;
      }
    });
    return;
  }

  console.log("Data jadwal di pembayaran:", jadwal); // Debug log

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
