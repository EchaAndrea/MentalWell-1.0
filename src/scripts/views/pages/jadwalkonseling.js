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

function showLoadingIndicator() {
  const el = document.getElementById("loading-indicator");
  if (el) el.style.display = "block";
}
function hideLoadingIndicator() {
  const el = document.getElementById("loading-indicator");
  if (el) el.style.display = "none";
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
  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get("mode");

  if (mode === "chat") {
    const psikologId = urlParams.get("id");
    // Fetch harga psikolog
    let harga = 0;
    try {
      const res = await fetch(
        `https://mentalwell10-api-production.up.railway.app/psychologists/${psikologId}`
      );
      const data = await res.json();
      const psikolog = data.data || data;
      harga = psikolog.price || 0;
    } catch (e) {
      harga = 0;
    }

    // Otomatis set jadwal realtime + harga
    const now = new Date();
    const pad = (n) => n.toString().padStart(2, "0");
    const tanggal = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
      now.getDate()
    )}`;
    const waktu = `${pad(now.getHours())}:${pad(now.getMinutes())}-${pad(
      now.getHours() + 1
    )}:${pad(now.getMinutes())}`;
    const jadwal = {
      tanggal,
      waktu,
      metode: "realtime",
      psychologist_id: psikologId,
      harga,
    };
    localStorage.setItem("jadwal", JSON.stringify(jadwal));
    console.log("Jadwal disimpan:", jadwal);
  }

  // Tampilkan jadwal
  const jadwalData = JSON.parse(localStorage.getItem("jadwal"));

  const selectedDateEl = document.getElementById("selectedDate");
  if (selectedDateEl) {
    selectedDateEl.textContent = formatTanggalIndo(jadwalData.tanggal);
  }
  const selectedTimeEl = document.getElementById("selectedTime");
  if (selectedTimeEl) {
    selectedTimeEl.textContent = jadwalData.waktu;
  }

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
    psychologist_id: jadwalData.psychologist_id, // Ganti dari psikologId
    schedule_date: jadwalData.tanggal,
    schedule_time: jadwalData.waktu,
    type: jadwalData.metode || "scheduled",
  };
  sessionStorage.setItem("counselingData", JSON.stringify(counselingData));

  // Setelah fetch user dari /my-data
  localStorage.setItem("user_data", JSON.stringify(user));
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
  const token = sessionStorage.getItem("authToken"); // Ubah ke sessionStorage
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
    // Simpan ke localStorage agar bisa diakses di halaman selesai
    localStorage.setItem("user_data", JSON.stringify(user));
    const inputs = document.querySelectorAll(".form-center input");
    if (inputs.length >= 5) {
      inputs[0].value = user.name || "";
      inputs[1].value = user.nickname || "";
      inputs[2].value = user.birthdate || "";
      inputs[3].value = user.gender || "";
      inputs[4].value = user.phone_number || "";
    }
  } catch (e) {
    // error handling
  }
}

function redirectToCounseling2() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");
  const mode = urlParams.get("mode");
  window.location.href = `/jadwalkonseling-permasalahan?id=${id}${
    mode ? `&mode=${mode}` : ""
  }`;
}

function sendCounselingData() {
  const problem = document.getElementById("descriptionTextarea")?.value.trim();
  const hope = document.getElementById("hopeAfterTextarea")?.value.trim();

  if (!problem || !hope) {
    Swal.fire({
      icon: "warning",
      title: "Form belum lengkap",
      text: "Deskripsi masalah dan harapan harus diisi!",
    });
    return;
  }

  localStorage.setItem("counseling_problem", JSON.stringify({ problem, hope }));

  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");
  const mode = urlParams.get("mode");
  window.location.href = `/jadwalkonseling-pembayaran?id=${id}${
    mode ? `&mode=${mode}` : ""
  }`;
}

// Tahap 3: Pembayaran
async function confirmPayment() {
  const token = sessionStorage.getItem("authToken");
  const jadwal = JSON.parse(localStorage.getItem("jadwal") || "{}");
  const psychologist_id = jadwal.psychologist_id;

  const problemData = JSON.parse(
    localStorage.getItem("counseling_problem") || "{}"
  );
  console.log("problemData di pembayaran:", problemData); // Tambahkan ini

  if (!psychologist_id) {
    Swal.fire("Psikolog tidak ditemukan. Silakan ulangi proses pemesanan.");
    return;
  }

  const buktiBayar = document.getElementById("buktiBayar")?.files[0];

  if (!buktiBayar) {
    Swal.fire("Upload bukti pembayaran terlebih dahulu.");
    return;
  }

  const formData = new FormData();
  formData.append("occupation", "Mahasiswa");
  formData.append("problem_description", problemData.problem || "");
  formData.append("hope_after", problemData.hope || "");
  formData.append("date", jadwal.tanggal || "");
  formData.append("time", jadwal.waktu || "");
  formData.append("payment_proof", buktiBayar);

  console.log("FormData:", [...formData.entries()]);

  try {
    // Tampilkan loading SweetAlert
    Swal.fire({
      title: "Memproses pembayaran...",
      text: "Mohon tunggu sebentar.",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

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
      // Ambil counseling detail untuk dapat conversation_id
      fetch(
        `https://mentalwell10-api-production.up.railway.app/counseling/${
          data.newCounseling.counseling_id || data.newCounseling.id
        }`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
        .then((res) => res.json())
        .then((detail) => {
          const conversation_id = detail.counseling.conversation_id;
          if (conversation_id) {
            localStorage.setItem("active_conversation_id", conversation_id);
          }
          // Redirect ke halaman selesai
          const urlParams = new URLSearchParams(window.location.search);
          const mode = urlParams.get("mode");
          setTimeout(() => {
            Swal.close();
            window.location.href = `/jadwalkonseling-selesai?id=${psychologist_id}${
              mode ? `&mode=${mode}` : ""
            }`;
          }, 1000);
        });
    } else {
      Swal.close();
      Swal.fire(data.message || "Gagal mengirim pembayaran");
    }
  } catch (e) {
    Swal.close();
    Swal.fire("Gagal mengirim pembayaran");
  }
}

// Jalankan fungsi sesuai halaman
document.addEventListener("DOMContentLoaded", function () {
  const path = window.location.pathname;

  if (path.includes("jadwalkonseling-pembayaran")) {
    const jadwal = JSON.parse(localStorage.getItem("jadwal") || "{}");
    if (!jadwal.psychologist_id) {
      Swal.fire({
        icon: "error",
        title: "Data tidak lengkap",
        text: "Silakan ulangi proses pemesanan dari awal.",
      }).then(() => {
        window.location.href = "/listpsikolog"; // Atau halaman awal pemesanan
      });
      return;
    }

    const harga = parseInt(jadwal.harga) || 0;
    const biayaAplikasi = 15000;
    const total = harga + biayaAplikasi;

    // Update harga di halaman (pastikan urutan span sesuai HTML kamu)
    const spans = document.querySelectorAll("span");
    if (spans[1]) spans[1].textContent = `Rp. ${harga.toLocaleString("id-ID")}`;
    if (spans[3])
      spans[3].textContent = `Rp. ${biayaAplikasi.toLocaleString("id-ID")}`;
    if (spans[5]) spans[5].textContent = `Rp. ${total.toLocaleString("id-ID")}`;

    // Update total di bawah (virtual account)
    const h5s = document.querySelectorAll("h5.fw-bold");
    if (h5s[1]) h5s[1].textContent = `Rp. ${total.toLocaleString("id-ID")}`;
    if (h5s[0])
      h5s[0].textContent = jadwal.virtual_account || "123 456 789 1011";
  }

  const btn = document.getElementById("btnKonfirmasiPembayaran");
  if (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      const urlParams = new URLSearchParams(window.location.search);
      const mode = urlParams.get("mode");
      Swal.fire({
        title: "Konfirmasi",
        text: "Apakah Anda yakin sudah melakukan pembayaran?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#044b77",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sudah Bayar",
      }).then((result) => {
        if (result.isConfirmed) {
          if (mode === "chat" || mode === "realtime") {
            confirmRealtimeCounseling();
          } else {
            confirmPayment();
          }
        }
      });
    });
  }

  async function showPsychologistProfile() {
    const urlParams = new URLSearchParams(window.location.search);
    const psikologId = urlParams.get("id");
    if (!psikologId) return;

    try {
      const res = await fetch(
        `https://mentalwell10-api-production.up.railway.app/psychologists/${psikologId}`
      );
      const data = await res.json();
      const psikolog = data.data;
      const fotoEl = document.getElementById("psychologProfile");
      if (fotoEl && psikolog.profile_image) {
        fotoEl.src = psikolog.profile_image;
        fotoEl.alt = psikolog.name || "Foto Psikolog";
      }
    } catch (e) {
      // Optional: tampilkan foto default jika error
      const fotoEl = document.getElementById("psychologProfile");
      if (fotoEl) fotoEl.src = "/src/public/beranda/man.png";
    }
  }

  document.addEventListener("DOMContentLoaded", showPsychologistProfile);

  async function confirmRealtimeCounseling() {
    const token = sessionStorage.getItem("authToken");
    const jadwal = JSON.parse(localStorage.getItem("jadwal") || "{}");
    const psychologist_id = jadwal.psychologist_id;

    const problemData = JSON.parse(
      localStorage.getItem("counseling_problem") || "{}"
    );

    if (!psychologist_id) {
      Swal.fire("Psikolog tidak ditemukan. Silakan ulangi proses pemesanan.");
      return;
    }
    if (!problemData.problem || !problemData.hope) {
      Swal.fire("Deskripsi masalah dan harapan harus diisi!");
      return;
    }

    // FormData untuk realtime (tanpa bukti bayar)
    const formData = new FormData();
    formData.append("occupation", "mahasiswa");
    formData.append("problem_description", problemData.problem);
    formData.append("hope_after", problemData.hope);

    try {
      Swal.fire({
        title: "Memproses permintaan konseling...",
        text: "Mohon tunggu sebentar.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const res = await fetch(
        `https://mentalwell10-api-production.up.railway.app/realtime/counseling/${psychologist_id}`,
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
        // Ambil counseling detail untuk dapat conversation_id
        fetch(
          `https://mentalwell10-api-production.up.railway.app/counseling/${
            data.newCounseling.counseling_id || data.newCounseling.id
          }`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
          .then((res) => res.json())
          .then((detail) => {
            const conversation_id = detail.counseling.conversation_id;
            if (conversation_id) {
              localStorage.setItem("active_conversation_id", conversation_id);
            }
            // Redirect ke halaman selesai
            const urlParams = new URLSearchParams(window.location.search);
            const mode = urlParams.get("mode");
            setTimeout(() => {
              Swal.close();
              window.location.href = `/jadwalkonseling-selesai?id=${psychologist_id}${
                mode ? `&mode=${mode}` : ""
              }`;
            }, 1000);
          });
      } else {
        Swal.close();
        Swal.fire(data.message || "Gagal mengirim permintaan konseling");
      }
    } catch (e) {
      Swal.close();
      Swal.fire("Gagal mengirim permintaan konseling");
    }
  }
});
