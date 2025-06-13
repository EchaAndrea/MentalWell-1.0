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
    return Array.isArray(data.result) ? data.result : [];
  }

  try {
    const psikologId = getPsikologId();
    selectedPsikolog = await fetchPsikolog(psikologId);
    const jadwalArr = await fetchJadwal(psikologId);

    console.log("selectedPsikolog:", selectedPsikolog);
    console.log("jadwalArr:", jadwalArr);
    if (!Array.isArray(jadwalArr)) {
      alert("Jadwal tidak tersedia atau Anda belum login.");
      return;
    }

    // Isi info psikolog ke halaman
    document.getElementById("nama").textContent = selectedPsikolog.name || "-";
    document.getElementById("spesialis").textContent =
      selectedPsikolog.specialist || "-";
    document.getElementById("harga").textContent = selectedPsikolog.price
      ? `Rp${selectedPsikolog.price}`
      : "-";

    // Ganti src foto sesuai id baru
    const fotoEl = document.getElementById("foto-psikolog");
    if (fotoEl) {
      fotoEl.src = selectedPsikolog.photo || "/src/public/beranda/man.png";
    }

    // Topik keahlian
    const topicList = document.getElementById("topiclist");
    if (topicList) {
      topicList.innerHTML = "";
      if (
        Array.isArray(selectedPsikolog.topics) &&
        selectedPsikolog.topics.length > 0
      ) {
        selectedPsikolog.topics.forEach((topic) => {
          const li = document.createElement("li");
          li.textContent = topic;
          topicList.appendChild(li);
        });
      } else {
        const li = document.createElement("li");
        li.textContent = "-";
        topicList.appendChild(li);
      }
    }

    // Proses jadwal ke format { tanggal: [ {jam, booked}, ... ] }
    waktuJadwal = {};
    jadwalArr.forEach((item) => {
      let tanggal = item.date;
      // Jika tidak ada tanggal, coba mapping dari day ke tanggal terdekat
      if (!tanggal && item.day) {
        const hariKeIndex = {
          Minggu: 0,
          Senin: 1,
          Selasa: 2,
          Rabu: 3,
          Kamis: 4,
          Jumat: 5,
          Sabtu: 6,
        };
        const today = new Date();
        const todayIdx = today.getDay();
        const targetIdx = hariKeIndex[item.day];
        let diff = targetIdx - todayIdx;
        if (diff < 0) diff += 7; // cari hari berikutnya
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + diff);
        tanggal = targetDate.toISOString().split("T")[0];
      }
      const jam = `${item.start_time?.slice(0, 5)}-${item.end_time?.slice(
        0,
        5
      )}`;
      if (!waktuJadwal[tanggal]) waktuJadwal[tanggal] = [];
      waktuJadwal[tanggal].push({ jam, booked: false });
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
