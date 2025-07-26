async function fetchConfirmedCounselingData() {
  try {
    const token = sessionStorage.getItem("authToken");
    const counseling_id = localStorage.getItem("last_counseling_id");
    if (!counseling_id) throw new Error("Counseling ID tidak ditemukan");

    const response = await fetch(
      `https://mentalwell10-api-production.up.railway.app/counseling/${counseling_id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!response.ok) throw new Error("Gagal fetch counseling");
    const data = await response.json();
    return data.counseling;
  } catch (error) {
    console.error("Error fetching confirmed counseling data:", error);
    throw error;
  }
}

async function populateHTMLWithData() {
  try {
    const counseling = await fetchConfirmedCounselingData();
    const valueContainer = document.querySelector(".value");

    // Ambil data user dari localStorage (yang disimpan saat isi data)
    const userData = JSON.parse(localStorage.getItem("user_data") || "{}");

    // Debug: lihat data yang tersedia
    console.log("Counseling data:", counseling);
    console.log("UserData from localStorage:", userData);

    // Gunakan data dari counseling (backend) sebagai prioritas utama
    let patient_name = counseling.patient_name || userData.name || "-";
    let patient_nickname =
      counseling.patient_nickname || userData.nickname || userData.name || "-";
    let patient_phone =
      counseling.patient_phone_number ||
      counseling.patient_phone ||
      userData.phone_number ||
      userData.phone ||
      "-";

    // Debug: lihat hasil akhir
    console.log("Final data:", {
      patient_name,
      patient_nickname,
      patient_phone,
    });

    valueContainer.innerHTML = `
      <p><strong>${patient_name}</strong></p>
      <p><strong>${patient_nickname}</strong></p>
      <p><strong>${patient_phone}</strong></p>
      <p><strong>${convertDateFormat(counseling.schedule_date)}</strong></p>
      <p><strong>${convertTimeFormat(counseling.schedule_time)}</strong></p>
    `;
  } catch (error) {
    console.error("Error populating HTML:", error);

    // Fallback: gunakan data dari localStorage jika API gagal
    const userData = JSON.parse(localStorage.getItem("user_data") || "{}");
    const jadwal = JSON.parse(localStorage.getItem("jadwal") || "{}");

    console.log("Fallback - userData:", userData);
    console.log("Fallback - jadwal:", jadwal);

    const valueContainer = document.querySelector(".value");
    if (valueContainer) {
      valueContainer.innerHTML = `
        <p><strong>${userData.name || "-"}</strong></p>
        <p><strong>${userData.nickname || userData.name || "-"}</strong></p>
        <p><strong>${
          userData.phone_number || userData.phone || "-"
        }</strong></p>
        <p><strong>${convertDateFormat(jadwal.tanggal)}</strong></p>
        <p><strong>${convertTimeFormat(jadwal.waktu)}</strong></p>
      `;
    }
  }
}

function convertDateFormat(inputDate) {
  if (!inputDate) return "-";

  // Jika format YYYY-MM-DD (dari localStorage jadwal)
  if (typeof inputDate === "string" && inputDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
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
    const [tahun, bulanIdx, tanggal] = inputDate.split("-");
    const date = new Date(tahun, parseInt(bulanIdx) - 1, parseInt(tanggal));
    const dayNames = [
      "Minggu",
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
    ];
    const dayOfWeek = dayNames[date.getDay()];
    return `${dayOfWeek}, ${parseInt(tanggal)} ${
      bulan[parseInt(bulanIdx) - 1]
    } ${tahun}`;
  }

  // Jika format tanggal normal dari backend
  const parsedDate = new Date(inputDate);
  if (isNaN(parsedDate.getTime())) return "Invalid date";

  const dayNames = [
    "Minggu",
    "Senin",
    "Selasa",
    "Rabu",
    "Kamis",
    "Jumat",
    "Sabtu",
  ];
  const dayOfWeek = dayNames[parsedDate.getDay()];
  const dayOfMonth = parsedDate.getDate();
  const monthNames = [
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
  const month = monthNames[parsedDate.getMonth()];
  const year = parsedDate.getFullYear();
  return `${dayOfWeek}, ${dayOfMonth} ${month} ${year}`;
}

function convertTimeFormat(inputTime) {
  if (!inputTime) return "-";

  // Jika sudah ada "WIB" (dari localStorage jadwal)
  if (inputTime.includes("WIB")) {
    return inputTime;
  }

  // Jika format HH:MM-HH:MM (dari backend atau localStorage)
  const [startTime, endTime] = inputTime.split("-");
  if (startTime && endTime) {
    return `${startTime?.replace(":", ".")} - ${endTime?.replace(
      ":",
      "."
    )} WIB`;
  }

  // Fallback
  return inputTime + " WIB";
}

function redirectToIndex() {
  window.location.href = "/";
}

function redirectToRiwayat() {
  // Hanya clean up data sementara
  localStorage.removeItem("jadwal");
  localStorage.removeItem("counseling_problem");
  localStorage.removeItem("user_data");

  // Cek apakah ada conversation_id
  const conversation_id = localStorage.getItem("last_conversation_id");

  if (conversation_id && conversation_id !== "null") {
    // Jika ada conversation_id, langsung ke riwayat
    window.location.href = "/riwayat";
  } else {
    // Jika belum ada conversation_id, beri pesan
    Swal.fire({
      icon: "info",
      title: "Menunggu Persetujuan",
      text: "Sesi konseling Anda sedang menunggu persetujuan admin. Silakan cek riwayat konseling nanti.",
      confirmButtonText: "Lihat Riwayat",
    }).then(() => {
      window.location.href = "/riwayat";
    });
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get("mode");
  const btnKembali = document.querySelector(
    'button[onclick="redirectToIndex()"]'
  );

  if (btnKembali) {
    btnKembali.removeAttribute("onclick");
    if (mode === "realtime" || mode === "schedule") {
      btnKembali.textContent = "Mulai Konseling";
      btnKembali.onclick = redirectToRiwayat;
    } else {
      btnKembali.textContent = "Kembali ke Beranda";
      btnKembali.onclick = redirectToIndex;
    }
  }
});

// Load data saat halaman dimuat
populateHTMLWithData();
