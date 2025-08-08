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

async function fetchUserProfile() {
  const token = sessionStorage.getItem("authToken");
  if (!token) {
    throw new Error("Token tidak ditemukan");
  }

  try {
    const response = await fetch(
      "https://mentalwell10-api-production.up.railway.app/my-data",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.ok) {
      throw new Error("Gagal mengambil data user");
    }

    const data = await response.json();
    return data.result.users;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
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
    const token = sessionStorage.getItem("authToken");
    const psychRes = await fetch(
      `https://mentalwell10-api-production.up.railway.app/psychologists/${psikologId}`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );

    if (psychRes.ok) {
      const psychData = await psychRes.json();
      harga = parseInt(psychData.price || psychData.data?.price || 0);
    }
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

  // Setup jadwal untuk mode realtime/scheduele
  if (mode === "realtime" || mode === "schedule") {
    try {
      const jadwal = await setupRealtimeSchedule(psikologId);

      const selectedDateEl = document.getElementById("selectedDate");
      if (selectedDateEl) selectedDateEl.textContent = jadwal.tanggal;
      const selectedTimeEl = document.getElementById("selectedTime");
      if (selectedTimeEl) selectedTimeEl.textContent = jadwal.waktu;
    } catch (error) {
      console.error("Error setting up realtime schedule:", error);
    }
  }

  try {
    const userProfile = await fetchUserProfile();
    const jadwal = JSON.parse(localStorage.getItem("jadwal") || "{}");

    if (!jadwal.tanggal || !jadwal.waktu || !jadwal.psychologist_id) {
      Swal.fire({
        icon: "warning",
        title: "Data jadwal tidak ditemukan",
        text: "Silakan pilih jadwal terlebih dahulu",
      }).then(() => {
        if (mode === "realtime" || mode === "schedule") {
          window.location.href = `/profilpsikolog?id=${psikologId}`;
        } else {
          window.location.href = `/jadwalpsikolog?id=${psikologId}`;
        }
      });
      return;
    }

    // Simpan data user ke localStorage untuk digunakan di halaman selesai
    if (userProfile) {
      const userDataToSave = {
        name: userProfile.name,
        nickname: userProfile.nickname || userProfile.name,
        phone_number: userProfile.phone_number || userProfile.phone, 
        phone: userProfile.phone || userProfile.phone_number, 
        birth_date: userProfile.birth_date,
        gender: userProfile.gender,
      };

      console.log("Saving user data:", userDataToSave); 
      localStorage.setItem("user_data", JSON.stringify(userDataToSave));
    }

    // Fill data diri
    const inputs = document.querySelectorAll(".form-center input");
    if (userProfile && inputs.length >= 5) {
      inputs[0].value = userProfile.name || "";
      inputs[1].value = userProfile.nickname || userProfile.name || "";
      inputs[2].value = userProfile.birth_date || "";
      inputs[3].value = userProfile.gender || "";
      inputs[4].value = userProfile.phone || "";
    }

    // Fill jadwal data
    const selectedDateEl = document.getElementById("selectedDate");
    const selectedTimeEl = document.getElementById("selectedTime");

    if (selectedDateEl && jadwal.tanggal) {
      selectedDateEl.textContent = jadwal.tanggal;
    }
    if (selectedTimeEl && jadwal.waktu) {
      selectedTimeEl.textContent = jadwal.waktu;
    }
  } catch (error) {
    console.error("Error loading user data:", error);
    Swal.fire({
      icon: "error",
      title: "Gagal memuat data",
      text: "Silakan refresh halaman atau login ulang",
    });
  }
});

function redirectToCounseling2() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const mode = params.get("mode");

  const jadwal = JSON.parse(localStorage.getItem("jadwal") || "{}");
  if (!jadwal.psychologist_id) {
    Swal.fire({
      icon: "error",
      title: "Data tidak lengkap",
      text: "Silakan ulangi proses pemesanan dari awal.",
    });
    return;
  }

  window.location.href = `/jadwalkonseling-permasalahan?id=${id}${
    mode ? `&mode=${mode}` : ""
  }`;
}
