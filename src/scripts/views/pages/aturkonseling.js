const urlParams = new URLSearchParams(window.location.search);
const counselingId = urlParams.get('id');
const loadingIndicator = document.getElementById('loading-indicator');

const patientProfile = document.getElementById('patientProfile');
const biodataPasien = document.querySelector('.biodata-pasien');
const tanggalKonseling = document.querySelector('.tanggal-konseling');
const deskripsiKonseling = document.querySelector('.deskripsi-konseling');
const harapanPasien = document.querySelector('.harapan-pasien');
const statusDropdown = document.getElementById('statusDropdown');
const btnSimpan = document.getElementById('btnSimpan');

loadingIndicator.style.display = 'block';

if (btnSimpan) {
  btnSimpan.addEventListener('click', () => {
    window.location.href = 'https://mentalwell-10-frontend.vercel.app/dashboardpsikolog';
  });
}

const authToken = sessionStorage.getItem('authToken');

// GET counseling details
fetch(`https://mentalwell10-api-production.up.railway.app/psychologist/counseling/${counselingId}`, {
  headers: {
    'Authorization': `Bearer ${authToken}`,
  },
})
  .then(response => {
    if (response.ok) {
      return response.json();
    } else {
      throw new Error('Failed to fetch counseling details');
    }
  })
  .then(result => {
    loadingIndicator.style.display = 'none';
    if (result.status !== "success") throw new Error(result.message);

    const counseling = result.counseling;
    // Set foto default jika tidak ada
    patientProfile.src = counseling.profile_image || "/src/public/beranda/man.png";
    // Format tanggal lahir
    const birthdate = new Date(counseling.birthdate);
    const formattedBirthdate = birthdate.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
    // Format tanggal konseling
    const scheduleDate = new Date(counseling.schedule_date);
    const formattedScheduleDate = scheduleDate.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    biodataPasien.innerHTML = `
      <h2>${counseling.name}</h2>
      <p>Nama Panggilan: ${counseling.nickname || '-'}</p>
      <p>Tanggal Lahir: ${formattedBirthdate}</p>
      <p>Jenis Kelamin: ${counseling.gender || '-'}</p>
      <p>Pekerjaan: ${counseling.occupation || '-'}</p>
    `;
    tanggalKonseling.innerHTML = `
      <p>${formattedScheduleDate}</p>
      <p>${counseling.schedule_time || '-'}</p>
      <p>Chat</p>
    `;
    deskripsiKonseling.innerHTML = `
      <h3>Deskripsi Masalah</h3>
      <p>${counseling.problem_description || '-'}</p>
    `;
    harapanPasien.innerHTML = `
      <h3>Harapan Setelah Konseling</h3>
      <p>${counseling.hope_after || '-'}</p>
    `;

    // Set status dropdown
    if (counseling.status === "finished") {
      statusDropdown.value = "selesai";
      statusDropdown.disabled = true;
    } else {
      statusDropdown.value = "belum_selesai";
      statusDropdown.disabled = false;
    }
  })
  .catch(error => {
    loadingIndicator.style.display = 'none';
    Swal.fire({
      title: "Gagal Memuat Data",
      text: error.message || "Terjadi kesalahan koneksi.",
      icon: "error",
    });
  });

// Update status konseling
statusDropdown.addEventListener('change', () => {
  const newStatus = statusDropdown.value;

  Swal.fire({
    title: 'Memuat...',
    text: 'Harap tunggu sejenak. Status konseling akan segera berubah ',
    allowOutsideClick: false,
    showCancelButton: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });

  fetch(`https://mentalwell10-api-production.up.railway.app/psychologist/counseling/${counselingId}/status`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      status: newStatus === "selesai" ? "finished" : "pending",
    }),
  })
    .then(response => response.json())
    .then(result => {
      Swal.close();
      if (result.status === "success") {
        Swal.fire({
          title: 'Status Konseling Berhasil Diubah!',
          icon: 'success',
          showConfirmButton: false,
          timer: 2000,
        });
        if (newStatus === "selesai") statusDropdown.disabled = true;
      } else {
        Swal.fire({
          title: "Gagal!",
          text: result.message || "Gagal mengubah status.",
          icon: "error",
        });
      }
    })
    .catch(error => {
      Swal.close();
      Swal.fire({
        title: "Error",
        text: error.message || "Terjadi kesalahan koneksi.",
        icon: "error",
      });
    });
});

// Popup chat (tidak diubah)
document.addEventListener("DOMContentLoaded", () => {
  const btnKonseling = document.getElementById("btnKonseling");
  const popupContainer = document.getElementById("popup-container");
  const chatUrl = "/src/templates/popupchat.html"; // URL file chat popup

  btnKonseling.addEventListener("click", () => {
    fetch(chatUrl)
      .then((res) => {
        if (!res.ok) throw new Error("Gagal memuat halaman popup chat");
        return res.text();
      })
      .then((html) => {
        popupContainer.innerHTML = html;
        popupContainer.style.display = "flex"; // pastikan tampil

        // Inisialisasi tombol tutup dan input chat
        initPopup();
      })
      .catch((err) => alert(err.message));
  });

  function initPopup() {
    const closeBtn = popupContainer.querySelector("button[onclick='toggleChat()']");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        popupContainer.style.display = "none";
        popupContainer.innerHTML = "";
      });
    }

    const input = popupContainer.querySelector("#chatInput");
    if (input) {
      input.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
          sendMessage();
        }
      });
    }
  }
});
