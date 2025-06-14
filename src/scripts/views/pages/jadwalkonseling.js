async function fetchCounselingData() {
  try {
    const articleId = new URLSearchParams(window.location.search).get("id");
    const token = sessionStorage.getItem("authToken");

    const response = await fetch(
      `https://mentalwell10-api-production.up.railway.app/counselings/patient`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Something's wrong");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching counseling data:", error);
    throw error;
  }
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
    if (!response.ok) throw new Error("Gagal mengambil data profil.");
    const data = await response.json();
    return data.result.users;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
}

async function populateFormFields() {
  try {
    showLoadingIndicator();

    const user = await fetchUserProfile();
    if (!user) throw new Error("User data not found");

    const fullNameInput = document.querySelector(
      'input[placeholder="Nama Lengkap"]'
    );
    const nicknameInput = document.querySelector(
      'input[placeholder="Nama Panggilan"]'
    );
    const birthdateInput = document.querySelector(
      'input[placeholder="01-02-2023"]'
    );
    const genderInput = document.querySelector(
      'input[placeholder="laki-Laki"]'
    );
    const phoneNumberInput = document.querySelector(
      'input[placeholder="08123456789"]'
    );

    // Format tanggal lahir ke yyyy-mm-dd (atau format lain sesuai kebutuhan)
    const formattedBirthdate = user.birthdate
      ? new Date(user.birthdate).toISOString().split("T")[0]
      : "";

    // Normalisasi gender
    let formattedGender = "";
    if (user.gender) {
      if (user.gender.toLowerCase().includes("laki")) {
        formattedGender = "Laki-laki";
      } else if (user.gender.toLowerCase().includes("perempuan")) {
        formattedGender = "Perempuan";
      } else {
        formattedGender = user.gender;
      }
    }

    // Isi form
    if (fullNameInput) fullNameInput.value = user.name || "";
    if (nicknameInput) nicknameInput.value = user.nickname || "";
    if (birthdateInput) birthdateInput.value = formattedBirthdate || "";
    if (genderInput) genderInput.value = formattedGender || "";
    if (phoneNumberInput) phoneNumberInput.value = user.phone_number || "";

    hideLoadingIndicator();
  } catch (error) {
    console.error("Error populating form fields:", error);
    hideLoadingIndicator();
  }
}

populateFormFields();

let counselingData = {};

function saveDataToSessionStorage() {
  // Retrieve existing data from sessionStorage
  const existingDataString = sessionStorage.getItem("counselingData");
  const existingData = existingDataString ? JSON.parse(existingDataString) : {};

  // Merge existing data with new data
  const newData = { ...existingData, ...counselingData };

  // Save the merged data back to sessionStorage
  sessionStorage.setItem("counselingData", JSON.stringify(newData));
}

function getPsychologistIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("id");
}

async function fetchPsychologistSchedule(psychologistId) {
  const url = `https://mentalwell10-api-production.up.railway.app/schedule/psychologist/${psychologistId}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    // Handle the error as needed
    return null;
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const jadwalData = JSON.parse(localStorage.getItem("jadwal"));
  if (!jadwalData) {
    alert("Data jadwal tidak ditemukan. Silakan pilih jadwal terlebih dahulu.");
    window.location.href = "jadwalpsikolog.html";
    return;
  }

  // Tampilkan jadwal
  document.getElementById("selectedDate").textContent = formatTanggalIndo(
    jadwalData.tanggal
  );
  document.getElementById("selectedTime").textContent = jadwalData.waktu;

  // Ambil data user
  const user = await fetchUserProfile();
  if (!user) {
    alert("Gagal mengambil data user, silakan login ulang.");
    window.location.href = "/src/templates/login.html";
    return;
  }

  // Simpan ke sessionStorage untuk tahap berikutnya
  const counselingData = {
    name: user.name,
    nickname: user.nickname,
    birthdate: user.birthdate,
    phone_number: user.phone_number,
    gender: user.gender,
    occupation: user.occupation,
    psikologId: jadwalData.psikologId, // pastikan field ini ada!
    schedule_date: jadwalData.tanggal,
    schedule_time: jadwalData.waktu,
    type: jadwalData.metode || "scheduled",
  };
  sessionStorage.setItem("counselingData", JSON.stringify(counselingData));
});

// Fungsi bantu: format tanggal dari yyyy-mm-dd ke format Indonesia (misal: 2 Juni 2025)
function formatTanggalIndo(tanggalStr) {
  const bulanIndo = [
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
  const [tahun, bulan, hari] = tanggalStr.split("-");
  return `${parseInt(hari)} ${bulanIndo[parseInt(bulan) - 1]} ${tahun}`;
}

// Tahap 1
async function redirectToCounseling2() {
  const currentId = new URLSearchParams(window.location.search).get("id");
  const selectedDate = counselingData.schedule_date;
  const selectedTime = counselingData.schedule_time;
  const selectedMethod = counselingData.type;

  if (!selectedDate || !selectedTime || !selectedMethod) {
    Swal.fire({
      icon: "warning",
      title: "Perhatian!",
      text: "Mohon atur jadwal dengan benar",
      confirmButtonText: "OK",
    });
    return;
  }

  saveDataToSessionStorage();

  const token = sessionStorage.getItem("authToken");
  const dataStorage = sessionStorage.getItem("counselingData");

  if (!token || !dataStorage) {
    console.error("Token or data storage is missing.");
    return;
  }

  // window.location.href = `http://localhost:5501/src/templates/jadwalkonseling-permasalahan.html?id=${currentId}`;
  window.location.href = `https://mentalwell-10-frontend.vercel.app/jadwalkonseling-permasalahan?id=${currentId}`;
}

//Tahap 2
async function sendCounselingData() {
  const description = document.getElementById("descriptionTextarea").value;
  const hopeAfter = document.getElementById("hopeAfterTextarea").value;
  const counselingData = JSON.parse(
    sessionStorage.getItem("counselingData") || "{}"
  );
  const token = sessionStorage.getItem("authToken");

  counselingData.problem_description = description;
  counselingData.hope_after = hopeAfter;

  // Kirim ke backend (tanpa payment proof)
  const formData = new FormData();
  formData.append("occupation", counselingData.occupation || "");
  formData.append("problem_description", description);
  formData.append("hope_after", hopeAfter);
  formData.append("date", counselingData.schedule_date);
  formData.append("time", counselingData.schedule_time);

  try {
    const res = await fetch(
      `https://mentalwell10-api-production.up.railway.app/counselings/${counselingData.psikologId}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      }
    );
    if (!res.ok) throw new Error("Gagal membuat counseling.");
    const result = await res.json();
    sessionStorage.setItem("counselingId", result.newCounseling.counseling_id);
    sessionStorage.setItem(
      "counselingData",
      JSON.stringify({
        ...counselingData,
        counseling_id: result.newCounseling.counseling_id,
      })
    );

    Swal.fire({
      icon: "success",
      title: "Berhasil!",
      text: "Counseling berhasil dibuat, lanjut ke pembayaran.",
      confirmButtonText: "Lanjut ke Pembayaran",
    }).then(() => {
      window.location.href = `https://mentalwell-10-frontend.vercel.app/jadwalkonseling-pembayaran?id=${result.newCounseling.counseling_id}`;
    });
  } catch (error) {
    Swal.fire("Gagal", "Tidak dapat membuat counseling. Coba lagi.", "error");
  }
}

//Tahap 3
async function confirmPayment() {
  const counselingId = sessionStorage.getItem("counselingId");
  const token = sessionStorage.getItem("authToken");
  const fileInput = document.getElementById("buktiBayar");
  const file = fileInput.files[0];

  if (!file) {
    Swal.fire("Perhatian!", "Silakan upload bukti pembayaran.", "warning");
    return;
  }

  const formData = new FormData();
  formData.append("payment_proof", file);

  try {
    const res = await fetch(
      `https://mentalwell10-api-production.up.railway.app/counselings/create/${counselingId}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      }
    );
    if (!res.ok) throw new Error("Gagal upload bukti pembayaran.");
    Swal.fire("Berhasil!", "Pembayaran berhasil dikonfirmasi.", "success").then(
      () => {
        window.location.href = `https://mentalwell-10-frontend.vercel.app/jadwalkonseling-selesai?id=${counselingId}`;
      }
    );
  } catch (error) {
    Swal.fire("Gagal", "Tidak dapat upload bukti pembayaran.", "error");
  }
}

async function createCounselingBySchedule() {
  const token = sessionStorage.getItem("authToken");
  const counselingDataStorage = JSON.parse(
    sessionStorage.getItem("counselingData") || "{}"
  );
  const psychologistId = counselingDataStorage.psikologId; // Pastikan sudah disimpan di sessionStorage

  // Data yang dikirim sesuai backend
  const payload = {
    name: counselingDataStorage.name,
    nickname: counselingDataStorage.nickname,
    birthdate: counselingDataStorage.birthdate,
    phone_number: counselingDataStorage.phone_number,
    gender: counselingDataStorage.gender,
    schedule_date: counselingDataStorage.schedule_date,
    schedule_time: counselingDataStorage.schedule_time,
    occupation: counselingDataStorage.occupation,
    problem_description: counselingDataStorage.problem_description,
    hope_after: counselingDataStorage.hope_after,
    type: "scheduled",
  };

  try {
    const response = await fetch(
      `https://mentalwell10-api-production.up.railway.app/counselings/${psychologistId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      throw new Error("Gagal membuat counseling.");
    }

    const result = await response.json();
    // Simpan counseling_id ke sessionStorage untuk proses pembayaran berikutnya
    sessionStorage.setItem("counselingId", result.newCounseling.counseling_id);

    Swal.fire({
      icon: "success",
      title: "Berhasil!",
      text: "Counseling berhasil dibuat, menunggu konfirmasi pembayaran.",
      confirmButtonText: "Lanjut ke Pembayaran",
    }).then(() => {
      window.location.href = `https://mentalwell-10-frontend.vercel.app/jadwalkonseling-pembayaran?id=${result.newCounseling.counseling_id}`;
    });
  } catch (error) {
    console.error("Error creating counseling:", error);
    Swal.fire({
      icon: "error",
      title: "Terjadi Kesalahan",
      text: "Tidak dapat membuat counseling. Coba lagi nanti.",
    });
  }
}

function normalizeTimeFormat(time) {
  return time.replace(/:/g, ".").replace("-", " - ");
}

function showLoadingIndicator() {
  const el = document.getElementById("loading-indicator");
  if (el) el.style.display = "block";
}
function hideLoadingIndicator() {
  const el = document.getElementById("loading-indicator");
  if (el) el.style.display = "none";
}

document.addEventListener("DOMContentLoaded", async () => {
  const jadwalData = JSON.parse(localStorage.getItem("jadwal"));
  if (!jadwalData) return;

  const dateEl = document.getElementById("selectedDate");
  const timeEl = document.getElementById("selectedTime");
  if (dateEl) dateEl.textContent = formatTanggalIndo(jadwalData.tanggal);
  if (timeEl) timeEl.textContent = jadwalData.waktu;
});

function confirmAndRedirect() {}

const token = sessionStorage.getItem("authToken");
if (!token) {
  window.location.href = "/src/templates/login.html";
}

document.addEventListener("DOMContentLoaded", async function () {
  const path = window.location.pathname;

  // --- ISI DATA ---
  if (path.includes("jadwalkonseling-isidata")) {
    const token = localStorage.getItem("token");
    const inputs = document.querySelectorAll(".form-center input");
    const selectedDate = document.getElementById("selectedDate");
    const selectedTime = document.getElementById("selectedTime");

    // Fetch user data
    try {
      const res = await fetch(
        "https://mentalwell10-api-production.up.railway.app/my-data",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      const user = data.result.users;
      if (inputs.length >= 5) {
        inputs[0].value = user.name || "";
        inputs[1].value = user.nickname || "";
        inputs[2].value = user.birthdate || "";
        inputs[3].value = user.gender || "";
        inputs[4].value = user.phone_number || "";
      }
    } catch (e) {
      alert("Gagal mengambil data user");
    }

    // Jadwal dari localStorage
    const jadwal = JSON.parse(localStorage.getItem("jadwal") || "{}");
    selectedDate.textContent = jadwal.tanggal || "-";
    selectedTime.textContent = jadwal.waktu || "-";
  }

  // --- PERMASALAHAN ---
  if (path.includes("jadwalkonseling-permasalahan")) {
    window.sendCounselingData = function () {
      const problem = document.getElementById("descriptionTextarea").value;
      const hope = document.getElementById("hopeAfterTextarea").value;
      localStorage.setItem(
        "counseling_problem",
        JSON.stringify({ problem, hope })
      );
      window.location.href = "jadwalkonseling-pembayaran.html";
    };
  }

  // --- PEMBAYARAN ---
  if (path.includes("jadwalkonseling-pembayaran")) {
    window.confirmPayment = async function () {
      const token = localStorage.getItem("token");
      const jadwal = JSON.parse(localStorage.getItem("jadwal") || "{}");
      const problemData = JSON.parse(
        localStorage.getItem("counseling_problem") || "{}"
      );
      const buktiBayar = document.getElementById("buktiBayar").files[0];

      if (!buktiBayar) {
        alert("Upload bukti pembayaran terlebih dahulu.");
        return;
      }

      // psychologist_id dari localStorage jadwal
      const params = new URLSearchParams(window.location.search);
      const psychologist_id = params.get("id") || jadwal.psikolog_id || "1";

      const formData = new FormData();
      formData.append("occupation", "Mahasiswa"); // Ganti jika ada input pekerjaan
      formData.append("problem_description", problemData.problem || "");
      formData.append("hope_after", problemData.hope || "");
      formData.append("date", jadwal.tanggal || "");
      formData.append("time", jadwal.waktu || "");
      formData.append("payment_proof", buktiBayar);

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
          localStorage.setItem(
            "last_counseling_id",
            data.newCounseling.counseling_id || data.newCounseling.id
          );
          window.location.href = "/jadwalkonseling-selesai";
        } else {
          alert(data.message || "Gagal mengirim pembayaran");
        }
      } catch (e) {
        alert("Gagal mengirim pembayaran");
      }
    };
  }
});

// Untuk tombol "Selanjutnya" di isi data
function redirectToCounseling2() {
  window.location.href = "/jadwalkonseling-permasalahan";
}
