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

// Helper: Format tanggal ke Indonesia
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

// Tahap 1: Isi Data
async function populateUserData() {
  const token = localStorage.getItem("token");
  if (!token) return;
  try {
    const res = await fetch(
      "https://mentalwell10-api-production.up.railway.app/my-data",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const data = await res.json();
    const user = data.result.users;
    const inputs = document.querySelectorAll(".form-center input");
    if (inputs.length >= 5) {
      inputs[0].value = user.name || "";
      inputs[1].value = user.nickname || "";
      inputs[2].value = user.birthdate || "";
      inputs[3].value = user.gender || "";
      inputs[4].value = user.phone_number || "";
    }
  } catch (e) {
    // Optional: tampilkan error
  }
  // Tampilkan jadwal dari localStorage
  const jadwal = JSON.parse(localStorage.getItem("jadwal") || "{}");
  const dateEl = document.getElementById("selectedDate");
  const timeEl = document.getElementById("selectedTime");
  if (dateEl) dateEl.textContent = formatTanggalIndo(jadwal.tanggal);
  if (timeEl) timeEl.textContent = jadwal.waktu || "-";
}

function redirectToCounseling2() {
  window.location.href = "jadwalkonseling-permasalahan.html";
}

// Tahap 2: Permasalahan
function sendCounselingData() {
  const problem = document.getElementById("descriptionTextarea")?.value || "";
  const hope = document.getElementById("hopeAfterTextarea")?.value || "";
  localStorage.setItem("counseling_problem", JSON.stringify({ problem, hope }));
  window.location.href = "jadwalkonseling-pembayaran.html";
}

// Tahap 3: Pembayaran
async function confirmPayment() {
  const token = localStorage.getItem("token");
  const jadwal = JSON.parse(localStorage.getItem("jadwal") || "{}");
  const problemData = JSON.parse(
    localStorage.getItem("counseling_problem") || "{}"
  );
  const buktiBayar = document.getElementById("buktiBayar")?.files[0];

  if (!buktiBayar) {
    Swal.fire("Upload bukti pembayaran terlebih dahulu.");
    return;
  }

  // psychologist_id dari jadwal
  const psychologist_id = jadwal.psikolog_id || "1";

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
      window.location.href = "jadwalkonseling-selesai.html";
    } else {
      Swal.fire(data.message || "Gagal mengirim pembayaran");
    }
  } catch (e) {
    Swal.fire("Gagal mengirim pembayaran");
  }
}

// Jalankan fungsi sesuai halaman
document.addEventListener("DOMContentLoaded", function () {
  const path = window.location.pathname;
  if (path.includes("jadwalkonseling-isidata")) {
    populateUserData();
  }
});
