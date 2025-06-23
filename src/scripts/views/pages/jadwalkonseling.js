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

// Tahap 1: Isi Data (ambil data user, tampilkan di form, simpan ke storage)
async function fetchUserProfile() {
  const token = sessionStorage.getItem("authToken");
  try {
    const response = await fetch(
      "https://mentalwell10-api-production.up.railway.app/my-data",
      { headers: { Authorization: `Bearer ${token}` } }
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
      'input[placeholder="laki-Laki"],input[placeholder="Jenis Kelamin"]'
    );
    const phoneNumberInput = document.querySelector(
      'input[placeholder="08123456789"]'
    );

    const formattedBirthdate = user.birthdate
      ? new Date(user.birthdate).toISOString().split("T")[0]
      : "";

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

    if (fullNameInput) fullNameInput.value = user.name || "";
    if (nicknameInput) nicknameInput.value = user.nickname || "";
    if (birthdateInput) birthdateInput.value = formattedBirthdate || "";
    if (genderInput) genderInput.value = formattedGender || "";
    if (phoneNumberInput) phoneNumberInput.value = user.phone_number || "";

    // Simpan ke localStorage agar bisa diakses di halaman selesai
    localStorage.setItem("user_data", JSON.stringify(user));
  } catch (error) {
    console.error("Error populating form fields:", error);
  }
}

function redirectToCounseling2() {
  window.location.href =
    "/jadwalkonseling-permasalahan" + window.location.search;
}

// Tahap 2: Permasalahan (simpan ke localStorage)
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

// Tahap 3: Pembayaran (submit ke API, baik realtime maupun jadwalkan)
async function submitCounseling() {
  const token = sessionStorage.getItem("authToken");
  const jadwal = JSON.parse(localStorage.getItem("jadwal") || "{}");
  const psychologist_id = jadwal.psychologist_id;
  const mode = jadwal.metode; // "realtime" atau "scheduled"
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

  const formData = new FormData();
  formData.append(
    "occupation",
    mode === "scheduled" ? "Mahasiswa" : "mahasiswa"
  );
  formData.append("problem_description", problemData.problem);
  formData.append("hope_after", problemData.hope);

  if (mode === "scheduled") {
    formData.append("date", jadwal.tanggal || "");
    formData.append("time", jadwal.waktu || "");
    const buktiBayar = document.getElementById("buktiBayar")?.files[0];
    if (!buktiBayar) {
      Swal.fire("Upload bukti pembayaran terlebih dahulu.");
      return;
    }
    formData.append("payment_proof", buktiBayar);
  } else if (mode === "realtime") {
    const now = new Date();
    const pad = (n) => n.toString().padStart(2, "0");
    const tanggal = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
      now.getDate()
    )}`;
    const end = new Date(now.getTime() + 60 * 60 * 1000);
    const waktu = `${pad(now.getHours())}:${pad(now.getMinutes())}-${pad(
      end.getHours()
    )}:${pad(end.getMinutes())}`;
    formData.append("date", tanggal);
    formData.append("time", waktu);
  } else {
    // Untuk realtime, payment_proof kosong (Blob kosong)
    formData.append(
      "payment_proof",
      new Blob([], { type: "application/octet-stream" }),
      "empty.txt"
    );
  }

  const endpoint =
    mode === "scheduled"
      ? `https://mentalwell10-api-production.up.railway.app/counselings/${psychologist_id}`
      : `https://mentalwell10-api-production.up.railway.app/realtime/counseling/${psychologist_id}`;

  try {
    Swal.fire({
      title: "Memproses permintaan konseling...",
      text: "Mohon tunggu sebentar.",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await res.json();
    if (data.status === "success") {
      localStorage.setItem(
        "last_counseling_id",
        data.newCounseling.counseling_id || data.newCounseling.id
      );
      setTimeout(() => {
        Swal.close();
        window.location.href = `/jadwalkonseling-selesai?id=${psychologist_id}${
          mode ? `&mode=${mode}` : ""
        }`;
      }, 1000);
    } else {
      Swal.close();
      Swal.fire(data.message || "Gagal mengirim permintaan konseling");
    }
  } catch (e) {
    Swal.close();
    Swal.fire("Gagal mengirim permintaan konseling");
  }
}

// Routing dan pengisian data sesuai halaman
document.addEventListener("DOMContentLoaded", async () => {
  const path = window.location.pathname;
  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get("mode");
  const id = urlParams.get("id");

  // Tahap 1: Isi Data (jadwalkonseling-isidata)
  if (path.includes("jadwalkonseling-isidata")) {
    await populateFormFields();
    // Tampilkan jadwal jika ada
    const jadwalData = JSON.parse(localStorage.getItem("jadwal") || "{}");
    const selectedDateEl = document.getElementById("selectedDate");
    if (selectedDateEl && jadwalData.tanggal)
      selectedDateEl.textContent = formatTanggalIndo(jadwalData.tanggal);
    const selectedTimeEl = document.getElementById("selectedTime");
    if (selectedTimeEl && jadwalData.waktu)
      selectedTimeEl.textContent = jadwalData.waktu;
  }

  // Tahap 2: Permasalahan (jadwalkonseling-permasalahan)
  // (tidak perlu fetch apapun)

  // Tahap 3: Pembayaran (jadwalkonseling-pembayaran)
  if (path.includes("jadwalkonseling-pembayaran")) {
    const jadwal = JSON.parse(localStorage.getItem("jadwal") || "{}");
    if (!jadwal.psychologist_id) {
      Swal.fire({
        icon: "error",
        title: "Data tidak lengkap",
        text: "Silakan ulangi proses pemesanan dari awal.",
      }).then(() => {
        window.location.href = "/listpsikolog";
      });
      return;
    }

    // Update harga di halaman (pastikan urutan span sesuai HTML kamu)
    const harga = parseInt(jadwal.harga) || 0;
    const biayaAplikasi = 15000;
    const total = harga + biayaAplikasi;
    const spans = document.querySelectorAll("span");
    if (spans[1]) spans[1].textContent = `Rp. ${harga.toLocaleString("id-ID")}`;
    if (spans[3])
      spans[3].textContent = `Rp. ${biayaAplikasi.toLocaleString("id-ID")}`;
    if (spans[5]) spans[5].textContent = `Rp. ${total.toLocaleString("id-ID")}`;
    const h5s = document.querySelectorAll("h5.fw-bold");
    if (h5s[1]) h5s[1].textContent = `Rp. ${total.toLocaleString("id-ID")}`;
    if (h5s[0])
      h5s[0].textContent = jadwal.virtual_account || "123 456 789 1011";

    // Event tombol konfirmasi pembayaran
    const btn = document.getElementById("btnKonfirmasiPembayaran");
    if (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
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
            submitCounseling();
          }
        });
      });
    }
  }

  // Otomatis set jadwal realtime jika mode chat
  if (mode === "chat") {
    // Hanya set jika belum ada jadwal
    if (!localStorage.getItem("jadwal")) {
      // Fetch harga psikolog
      let harga = 0;
      try {
        const res = await fetch(
          `https://mentalwell10-api-production.up.railway.app/psychologists/${id}`
        );
        const data = await res.json();
        const psikolog = data.data || data;
        harga = psikolog.price || 0;
      } catch (e) {
        harga = 0;
      }
      // Set jadwal realtime
      const now = new Date();
      const pad = (n) => n.toString().padStart(2, "0");
      const tanggal = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
        now.getDate()
      )}`;
      const end = new Date(now.getTime() + 60 * 60 * 1000);
      const waktu = `${pad(now.getHours())}:${pad(now.getMinutes())}-${pad(
        end.getHours()
      )}:${pad(end.getMinutes())}`;
      const jadwal = {
        tanggal,
        waktu,
        metode: "realtime",
        psychologist_id: id,
        harga,
      };
      localStorage.setItem("jadwal", JSON.stringify(jadwal));
      console.log("Jadwal disimpan:", jadwal);
    }
  }
});
