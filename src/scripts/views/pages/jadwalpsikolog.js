document.addEventListener("DOMContentLoaded", async function () {
  const token = sessionStorage.getItem("authToken");
  if (!token) {
    alert("Token tidak ditemukan. Silakan login terlebih dahulu.");
    console.log("Token: null");
    return;
  } else {
    console.log("Token:", token);
  }

  const tanggalContainer = document.getElementById("tanggal-container");
  const waktuContainer = document.getElementById("waktu-container");
  const waktuSection = document.getElementById("waktu-section");
  const tanggalPicker = document.getElementById("tanggal-picker");
  const jadwalkanContainer = document.getElementById("jadwalkan-container");
  const btnJadwalkan = document.getElementById("btn-jadwalkan");
  const btnCalendar = document.getElementById("btn-calendar");

  let selectedTanggal = null;
  let selectedWaktu = null;
  let waktuJadwal = {};
  let selectedPsikolog = {};

  // Ambil ID psikolog dari query string (?id=1) atau default 1
  function getPsikologId() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id") || "1";
  }

  // Fetch data psikolog
  async function fetchPsikolog(psikologId) {
    const token = sessionStorage.getItem("authToken");
    if (!token) {
      throw new Error("Anda belum login. Silakan login terlebih dahulu.");
    }
    const res = await fetch(
      `https://mentalwell10-api-production.up.railway.app/psychologists/${psikologId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!res.ok) throw new Error("Gagal fetch data psikolog");
    return await res.json();
  }

  // Fetch jadwal psikolog
  async function fetchJadwal(psikologId) {
    const token = sessionStorage.getItem("authToken");
    const res = await fetch(
      `https://mentalwell10-api-production.up.railway.app/psychologists/${psikologId}/schedules`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await res.json();
    console.log("Jadwal response:", data);
    if (res.status === 401) {
      alert("Sesi Anda telah habis. Silakan login ulang.");
      sessionStorage.removeItem("authToken");
      window.location.href = "/#/login";
      throw new Error("Unauthorized");
    }
    if (!res.ok) throw new Error(data.message || "Gagal fetch jadwal");
    return data.result;
  }

  try {
    const psikologId = getPsikologId();
    selectedPsikolog = await fetchPsikolog(psikologId);
    // Setelah fetchJadwal
    const jadwalData = await fetchJadwal(psikologId);
    // jadwalData = { name, price, schedules }

    selectedPsikolog = {
      ...selectedPsikolog, // dari fetchPsikolog
      price: jadwalData.price,
    };

    const jadwalArr = Array.isArray(jadwalData.schedules)
      ? jadwalData.schedules
      : [];

    console.log("selectedPsikolog:", selectedPsikolog);
    console.log("jadwalArr:", jadwalArr);
    if (!Array.isArray(jadwalArr)) {
      alert("Jadwal tidak tersedia atau Anda belum login.");
      return;
    }

    // Isi info psikolog ke halaman
    const namaEl = document.getElementById("nama");
    if (namaEl) namaEl.textContent = selectedPsikolog.name || "-";

    const hargaEl = document.getElementById("harga");
    if (hargaEl)
      hargaEl.textContent = selectedPsikolog.price
        ? `Rp. ${selectedPsikolog.price}`
        : "-";

    const fotoEl = document.getElementById("foto-psikolog");
    if (fotoEl)
      fotoEl.src =
        selectedPsikolog.profile_image || "/src/public/beranda/man.png";

    // Proses jadwal ke format { hari: [ {jam, booked}, ... ] }
    waktuJadwal = {};

    // Jadwal mingguan (dari admin)
    for (const item of jadwalArr) {
      if (item.day) {
        const jam = `${item.start_time?.slice(0, 5) || ""}-${
          item.end_time?.slice(0, 5) || ""
        }`;
        const hari = item.day.charAt(0).toUpperCase() + item.day.slice(1);
        if (!waktuJadwal[hari]) waktuJadwal[hari] = [];
        waktuJadwal[hari].push({ jam });
      }
    }

    // Generate tombol tanggal per minggu
    const hariList = [
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
      "Minggu",
    ];

    const today = new Date();
    const currentDay = today.getDay();
    const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1; 
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - daysFromMonday); 

    // Generate 7 hari
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const tglStr = date.toISOString().split("T")[0];
      const tglDisplay = date.getDate();
      const hariIni = hariList[i]; 

      const btn = document.createElement("button");
      btn.className = "btn btn-outline-secondary tanggal-item";
      btn.innerHTML = `${tglDisplay}<br><small>${hariIni}</small>`;
      btn.title = `${tglStr} (${hariIni})`;
      btn.addEventListener("click", () => selectTanggal(tglStr, btn));
      tanggalContainer.appendChild(btn);
    }

    // Kalender
    btnCalendar.addEventListener("click", () => {
      if (tanggalPicker.showPicker) {
        tanggalPicker.showPicker();
      } else {
        tanggalPicker.focus();
      }
    });

    // Ketika pilih tanggal lewat input date
    tanggalPicker.addEventListener("change", () => {
      if (tanggalPicker.value) {
        selectTanggal(tanggalPicker.value);
      }
    });

    function selectTanggal(tglStr, btnClicked) {
      selectedTanggal = tglStr;
      selectedWaktu = null;
      jadwalkanContainer.classList.remove("show", "d-none");
      waktuSection.classList.remove("d-none");

      // Reset active di semua tanggal
      document.querySelectorAll(".tanggal-item").forEach((btn) => {
        btn.classList.remove("active");
      });

      if (btnClicked) btnClicked.classList.add("active");

      if (tanggalPicker.value !== tglStr) {
        tanggalPicker.value = tglStr;
      }

      renderWaktu();
    }

    async function renderWaktu() {
      waktuContainer.innerHTML = "";

      // Konversi tanggal ke hari untuk cek jadwal mingguan
      const hariList = [
        "Minggu",
        "Senin",
        "Selasa",
        "Rabu",
        "Kamis",
        "Jumat",
        "Sabtu",
      ];
      const dateObj = new Date(selectedTanggal);
      const hari = hariList[dateObj.getDay()];
      const waktuList = waktuJadwal[hari] || [];

      if (waktuList.length === 0) {
        waktuContainer.innerHTML = `<p class="text-muted">Tidak ada jadwal tersedia</p>`;
        return;
      }

      // Cek ketersediaan setiap slot
      for (const { jam } of waktuList) {
        const btn = document.createElement("button");
        btn.className = "btn btn-outline-primary btn-slot me-2 mb-2";
        btn.textContent = jam;

        // Cek ketersediaan via API
        let booked = true;
        try {
          const availRes = await fetch(
            `https://mentalwell10-api-production.up.railway.app/psychologists/${getPsikologId()}/schedules/availability?date=${selectedTanggal}&time=${encodeURIComponent(
              jam
            )}`,
            {
              headers: {
                Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
              },
            }
          );
          const availData = await availRes.json();
          booked = !availData.result?.is_available;
        } catch (e) {
          booked = true; // anggap booked jika error
        }

        if (booked) {
          btn.disabled = true;
          btn.classList.add("btn-secondary");
          btn.title = "Sudah dibooking";
        } else {
          btn.addEventListener("click", () => {
            document
              .querySelectorAll(".btn-slot")
              .forEach((el) => el.classList.remove("active"));
            btn.classList.add("active");
            selectedWaktu = jam;

            jadwalkanContainer.classList.remove("d-none");
            requestAnimationFrame(() => {
              jadwalkanContainer.classList.add("show");
            });
          });
        }

        waktuContainer.appendChild(btn);
      }
    }

    btnJadwalkan.addEventListener("click", () => {
      if (!selectedTanggal || !selectedWaktu) {
        alert("Silakan pilih tanggal dan waktu terlebih dahulu.");
        return;
      }

      localStorage.setItem(
        "jadwal",
        JSON.stringify({
          nama: selectedPsikolog.name,
          spesialis: selectedPsikolog.specialist,
          harga: selectedPsikolog.price,
          tanggal: selectedTanggal,
          waktu: selectedWaktu,
          psychologist_id: selectedPsikolog.id, // <-- TAMBAHKAN INI!
        })
      );

      window.location.href = `/jadwalkonseling-isidata?id=${psikologId}`;
    });
  } catch (err) {
    alert("Gagal mengambil data psikolog atau jadwal: " + err.message);
  }
});
