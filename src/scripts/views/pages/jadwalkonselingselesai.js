async function fetchConfirmedCounselingData() {
  try {
    const token = localStorage.getItem("token");
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

    // Fallback jika data pasien tidak ada di counseling
    let patient_name = counseling.patient_name;
    let patient_nickname = counseling.patient_nickname;
    let patient_phone = counseling.patient_phone_number;

    if (!patient_name || !patient_nickname || !patient_phone) {
      // Ambil dari localStorage jika tidak ada di counseling
      const userData = JSON.parse(localStorage.getItem("user_data") || "{}");
      patient_name = patient_name || userData.name || "-";
      patient_nickname = patient_nickname || userData.nickname || "-";
      patient_phone = patient_phone || userData.phone_number || "-";
    }

    valueContainer.innerHTML = `
      <p>${patient_name}</p>
      <p>${patient_nickname}</p>
      <p>${patient_phone}</p>
      <p>${convertDateFormat(counseling.schedule_date)}</p>
      <p>${convertTimeFormat(counseling.schedule_time)}</p>
      <p>${counseling.type === "scheduled" ? "Terjadwal" : counseling.type}</p>
    `;
  } catch (error) {
    // Tampilkan error ke user jika perlu
  }
}

function redirectToIndex() {
  window.location.href = `https://mentalwell-10-frontend.vercel.app/`;
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
  return `${startTime?.replace(":", ".")} - ${endTime?.replace(":", ".")}`;
}

populateHTMLWithData();
