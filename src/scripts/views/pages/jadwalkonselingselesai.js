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

    // Gunakan data dari counseling jika ada, fallback ke localStorage
    let patient_name = counseling.patient_name || userData.name || "-";
    let patient_nickname =
      counseling.patient_nickname || userData.nickname || userData.name || "-";

    // Coba berbagai field name yang mungkin untuk phone
    let patient_phone =
      counseling.patient_phone_number ||
      counseling.patient_phone ||
      counseling.phone_number ||
      counseling.phone ||
      userData.phone_number ||
      userData.phone ||
      "-";

    // Jika masih kosong, coba ambil dari jadwal localStorage
    if (
      patient_name === "-" ||
      patient_nickname === "-" ||
      patient_phone === "-"
    ) {
      const jadwal = JSON.parse(localStorage.getItem("jadwal") || "{}");
      if (jadwal.user_data) {
        patient_name =
          patient_name === "-" ? jadwal.user_data.name || "-" : patient_name;
        patient_nickname =
          patient_nickname === "-"
            ? jadwal.user_data.nickname || "-"
            : patient_nickname;
        patient_phone =
          patient_phone === "-"
            ? jadwal.user_data.phone || jadwal.user_data.phone_number || "-"
            : patient_phone;
      }
    }

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
        <p><strong>${formatTanggalIndo(jadwal.tanggal) || "-"}</strong></p>
        <p><strong>${jadwal.waktu ? jadwal.waktu + " WIB" : "-"}</strong></p>
      `;
    }
  }
}

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

function redirectToIndex() {
  // Clean up localStorage
  localStorage.removeItem("jadwal");
  localStorage.removeItem("counseling_problem");
  localStorage.removeItem("user_data");

  window.location.href = "/";
}

function convertDateFormat(inputDate) {
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
  const [startTime, endTime] = inputTime.split("-");
  return `${startTime?.replace(":", ".")} - ${endTime?.replace(":", ".")} WIB`;
}

document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get("mode");
  const btnKembali = document.querySelector(
    'button[onclick="redirectToIndex()"]'
  );

  if (btnKembali) {
    btnKembali.removeAttribute("onclick");
    if (mode === "chat" || mode === "realtime") {
      btnKembali.textContent = "Lihat Riwayat Konseling";
      btnKembali.onclick = function () {
        // Clean up localStorage
        localStorage.removeItem("jadwal");
        localStorage.removeItem("counseling_problem");
        localStorage.removeItem("user_data");

        window.location.href = "/riwayatkonseling";
      };
    } else {
      btnKembali.textContent = "Kembali ke Beranda";
      btnKembali.onclick = redirectToIndex;
    }
  }
});

// Load data saat halaman dimuat
populateHTMLWithData();
