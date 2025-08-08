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

  localStorage.setItem(
    "counseling_problem",
    JSON.stringify({
      problem: description || "",
      hope: hope || "",
    })
  );

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const mode = params.get("mode");

  window.location.href = `/jadwalkonseling-pembayaran?id=${id}${
    mode ? `&mode=${mode}` : ""
  }`;
}
