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

  // Validasi data jadwal
  const jadwal = JSON.parse(localStorage.getItem("jadwal") || "{}");
  if (!jadwal.psychologist_id) {
    Swal.fire({
      icon: "error",
      title: "Data tidak lengkap",
      text: "Silakan ulangi proses pemesanan dari awal.",
    }).then(() => {
      window.location.href = "/listpsikolog";
    });
  }
});

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
