async function fetchCounselingData() {
  try {
    const articleId = new URLSearchParams(window.location.search).get("id");
    const token = sessionStorage.getItem("authToken");

    const response = await fetch(
      `https://mentalwell-backend.vercel.app/counselings/patient`,
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

async function populateFormFields() {
  try {
    showLoadingIndicator();

    const counselingData = await fetchCounselingData();

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

    const options = { year: "numeric", month: "long", day: "numeric" };

    const formattedBirthdate = new Date(
      counselingData.users.birthdate
    ).toLocaleDateString("id-ID", options);

    let formattedGender;
    if (counselingData.users.gender == "laki_laki") {
      formattedGender = "Laki-laki";
    } else {
      formattedGender = "Perempuan";
    }

    // Populate form fields with counseling data
    fullNameInput.value = counselingData.users.name || "";
    nicknameInput.value = counselingData.users.nickname || "";
    birthdateInput.value = formattedBirthdate || "";
    genderInput.value = formattedGender || "";
    phoneNumberInput.value = counselingData.users.phone_number || "";

    hideLoadingIndicator();
  } catch (error) {
    console.error("Error populating form fields:", error);
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
  const url = `https://mentalwell-backend.vercel.app/schedule/psychologist/${psychologistId}`;

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

document.addEventListener("DOMContentLoaded", () => {
  // Ambil data dari localStorage
  const jadwalData = JSON.parse(localStorage.getItem("jadwal"));

  if (jadwalData) {
    // Tampilkan tanggal dan waktu yang dipilih
    document.getElementById("selectedDate").textContent = formatTanggalIndo(jadwalData.tanggal);
    document.getElementById("selectedTime").textContent = jadwalData.waktu;
  } else {
    // Jika tidak ada data, redirect atau beri peringatan
    alert("Data jadwal tidak ditemukan. Silakan pilih jadwal terlebih dahulu.");
    window.location.href = "jadwalpsikolog.html";
  }
});

// Fungsi bantu: format tanggal dari yyyy-mm-dd ke format Indonesia (misal: 2 Juni 2025)
function formatTanggalIndo(tanggalStr) {
  const bulanIndo = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
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
  window.location.href = `https://mentalwell.vercel.app/jadwalkonseling-permasalahan?id=${currentId}`;
}

//Tahap 2
async function sendCounselingData() {
  const description = document.getElementById("descriptionTextarea").value;
  const hopeAfter = document.getElementById("hopeAfterTextarea").value;

  counselingData.problem_description = description;
  counselingData.hope_after = hopeAfter;

  saveDataToSessionStorage();

  try {
    const currentId = new URLSearchParams(window.location.search).get("id");
    const result = await Swal.fire({
      title: "Konfirmasi",
      text: "Apakah Anda yakin ingin melanjutkan ke pembayaran?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya",
      cancelButtonText: "Tidak",
    });

    if (result.isConfirmed) {
      window.location.href = `http://mentalwell.vercel.app/jadwalkonseling-pembayaran?id=${currentId}`;
    } else {
      console.log("User canceled.");
    }
  } catch (error) {
    console.error("Error sending counseling data:", error);
  }
}

//Tahap 3
async function confirmPayment() {
  const currentId = new URLSearchParams(window.location.search).get("id");
  const token = sessionStorage.getItem("authToken");
  const fileInput = document.getElementById("buktiBayar");
  const file = fileInput.files[0];

  if (!file) {
    Swal.fire({
      icon: "warning",
      title: "Perhatian!",
      text: "Silakan upload bukti pembayaran terlebih dahulu.",
      confirmButtonText: "OK",
    });
    return;
  }

  const counselingDataStorage = JSON.parse(
    sessionStorage.getItem("counselingData")
  );

  const formData = new FormData();
  formData.append("proof_of_payment", file);
  formData.append("schedule_date", counselingDataStorage.schedule_date);
  formData.append("schedule_time", counselingDataStorage.schedule_time);
  formData.append("type", counselingDataStorage.type);
  formData.append(
    "problem_description",
    counselingDataStorage.problem_description
  );
  formData.append("hope_after", counselingDataStorage.hope_after);

  try {
    const response = await fetch(
      `https://mentalwell-backend.vercel.app/counselings/create/${currentId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Gagal mengirim data pembayaran.");
    }

    const result = await response.json();

    Swal.fire({
      icon: "success",
      title: "Pembayaran Terkonfirmasi",
      text: "Data telah berhasil dikirim.",
      confirmButtonText: "Lanjut",
    }).then(() => {
      window.location.href = `https://mentalwell.vercel.app/jadwalkonseling-selesai?id=${currentId}`;
    });
  } catch (error) {
    console.error("Error during payment confirmation:", error);
    Swal.fire({
      icon: "error",
      title: "Terjadi Kesalahan",
      text: "Tidak dapat mengirim data. Coba lagi nanti.",
    });
  }
}

function normalizeTimeFormat(time) {
  return time.replace(/:/g, ".").replace("-", " - ");
}

function showLoadingIndicator() {
  // Get loading indicator element and show it
  const loadingIndicator = document.getElementById("loading-indicator");
  loadingIndicator.style.display = "block";
}

function hideLoadingIndicator() {
  // Hide loading indicator
  const loadingIndicator = document.getElementById("loading-indicator");
  loadingIndicator.style.display = "none";
}

function confirmAndRedirect() {}
