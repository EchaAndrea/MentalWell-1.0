document.addEventListener("DOMContentLoaded", async function () {
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
    const token = localStorage.getItem("token");
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
    const token = localStorage.getItem("token");
    const res = await fetch(
      `https://mentalwell10-api-production.up.railway.app/psychologists/${psikologId}/schedules`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await res.json();
    console.log("Jadwal response:", data);
    if (!res.ok) throw new Error(data.message || "Gagal fetch jadwal");
    // Ambil array schedules dari data.result
    return Array.isArray(data.result?.schedules) ? data.result.schedules : [];
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

    const topicEl = document.getElementById("topiclist");
    if (topicEl)
      topicEl.textContent = selectedPsikolog.topics
        ? Array.isArray(selectedPsikolog.topics)
          ? selectedPsikolog.topics.join(", ")
          : selectedPsikolog.topics
        : "-";

    const hargaEl = document.getElementById("harga");
    if (hargaEl)
      hargaEl.textContent = selectedPsikolog.price
        ? `Rp${selectedPsikolog.price}`
        : "-";

    const fotoEl = document.getElementById("foto-psikolog");
    if (fotoEl)
      fotoEl.src = selectedPsikolog.photo || "/src/public/beranda/man.png";

    // Proses jadwal ke format { tanggal: [ {jam, booked}, ... ] }
    waktuJadwal = {};
    jadwalArr.forEach((item) => {
      // Asumsi item: { date: "2025-06-02", time: "08:00-09:00", booked: false }
      if (!waktuJadwal[item.date]) waktuJadwal[item.date] = [];
      waktuJadwal[item.date].push({ jam: item.time, booked: item.booked });
    });

    // Generate tombol tanggal 5 hari ke depan
    for (let i = 0; i < 5; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const tglStr = date.toISOString().split("T")[0]; // yyyy-mm-dd
      const tglDisplay = date.getDate();

      const btn = document.createElement("button");
      btn.className = "btn btn-outline-secondary tanggal-item";
      btn.textContent = tglDisplay;
      btn.title = tglStr;
      btn.addEventListener("click", () => selectTanggal(tglStr, btn));
      tanggalContainer.appendChild(btn);
    }

    // Klik icon kalender untuk buka date picker
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

    function renderWaktu() {
      waktuContainer.innerHTML = "";

      const waktuList = waktuJadwal[selectedTanggal] || [];

      if (waktuList.length === 0) {
        waktuContainer.innerHTML = `<p class="text-muted">Tidak ada jadwal tersedia</p>`;
        return;
      }

      waktuList.forEach(({ jam, booked }) => {
        const btn = document.createElement("button");
        btn.className = "btn btn-outline-primary btn-slot me-2 mb-2";
        btn.textContent = jam;

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
      });
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
        })
      );

      window.location.href = `jadwalkonseling-isidata?id=${psikologId}`;
    });
  } catch (err) {
    alert("Gagal mengambil data psikolog atau jadwal: " + err.message);
  }
  const token = localStorage.getItem("token");
  console.log("Token:", token);
});
