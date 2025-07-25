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

document.addEventListener("DOMContentLoaded", async function () {
  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get("mode");
  const psikologId = urlParams.get("id");

  // Validasi data jadwal yang sudah ada
  const jadwal = JSON.parse(localStorage.getItem("jadwal") || "{}");

  // Jika tidak ada data jadwal sama sekali, redirect kembali
  if (!jadwal.psychologist_id || !jadwal.tanggal || !jadwal.waktu) {
    Swal.fire({
      icon: "error",
      title: "Data jadwal tidak ditemukan",
      text: "Silakan isi data diri terlebih dahulu.",
    }).then(() => {
      if (mode === "realtime" || mode === "schedule") {
        window.location.href = `/jadwalkonseling-isidata?id=${psikologId}&mode=${mode}`;
      } else {
        window.location.href = `/jadwalkonseling-isidata?id=${psikologId}`;
      }
    });
    return;
  }

  console.log("Data jadwal ditemukan:", jadwal); // Debug log
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
