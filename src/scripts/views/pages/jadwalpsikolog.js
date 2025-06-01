document.addEventListener('DOMContentLoaded', function () {
  const selectedPsikolog = {
    id: 1,
    nama: "Dr. Mervin Tri Hadianto MSi.Med, Sp.A",
    spesialis: "Sp. Anak",
    harga: "Rp75.000",
    foto: "/src/public/beranda/man.png"
  };

  const waktuDummy = {
    "2025-05-29": [
      { jam: "08:00-09:00", booked: false },
      { jam: "10:00-11:00", booked: true }, // Sudah dibooking
      { jam: "13:00-14:00", booked: false }
    ],
    "2025-05-30": [
      { jam: "09:00-10:00", booked: false },
      { jam: "15:00-16:00", booked: false }
    ],
    "2025-05-31": [],
    "2025-06-01": [
      { jam: "08:00-09:00", booked: true } // Sudah dibooking
    ],
    "2025-06-02": [
      { jam: "10:00-11:00", booked: false },
      { jam: "13:00-14:00", booked: false }
    ]
  };

  const tanggalContainer = document.getElementById("tanggal-container");
  const waktuContainer = document.getElementById("waktu-container");
  const waktuSection = document.getElementById("waktu-section");
  const tanggalPicker = document.getElementById("tanggal-picker");
  const jadwalkanContainer = document.getElementById("jadwalkan-container");
  const btnJadwalkan = document.getElementById("btn-jadwalkan");
  const btnCalendar = document.getElementById("btn-calendar");

  let selectedTanggal = null;
  let selectedWaktu = null;

  // Isi info psikolog
  document.getElementById("nama").textContent = selectedPsikolog.nama;
  document.getElementById("spesialis").textContent = selectedPsikolog.spesialis;
  document.getElementById("harga").textContent = selectedPsikolog.harga;
  document.querySelector("#psychologist-info img").src = selectedPsikolog.foto;

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
    jadwalkanContainer.classList.remove("show");
    jadwalkanContainer.classList.add("d-none");
    waktuSection.classList.remove("d-none");

    // Reset active di semua tanggal
    document.querySelectorAll(".tanggal-item").forEach(btn => {
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

    const waktuList = waktuDummy[selectedTanggal] || [];

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
          document.querySelectorAll(".btn-slot").forEach(el => el.classList.remove("active"));
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

    localStorage.setItem("jadwal", JSON.stringify({
      nama: selectedPsikolog.nama,
      spesialis: selectedPsikolog.spesialis,
      harga: selectedPsikolog.harga,
      tanggal: selectedTanggal,
      waktu: selectedWaktu
    }));

    window.location.href = "jadwalkonseling-isidata.html";
  });
});
