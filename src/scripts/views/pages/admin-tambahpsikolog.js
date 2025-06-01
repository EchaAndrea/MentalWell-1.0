document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("formArtikel");
  const btnKembali = document.getElementById("btnKembali");
  const gambarInput = document.getElementById("gambar");
  const namaFile = document.getElementById("namaFile");
  const jadwalContainer = document.getElementById("jadwalContainer");

  btnKembali.addEventListener("click", () => {
    window.history.back();
  });

  gambarInput.addEventListener("change", () => {
    namaFile.value = gambarInput.files[0]?.name || "";
  });

  jadwalContainer.addEventListener("click", (e) => {
    const row = e.target.closest(".jadwal-row");

    if (e.target.closest(".tambah-jadwal")) {
      const clone = row.cloneNode(true);
      clone.querySelectorAll("input").forEach((input) => (input.value = ""));
      clone.querySelector("select").selectedIndex = 0;
      jadwalContainer.appendChild(clone);
    }

    if (e.target.closest(".hapus-jadwal")) {
      if (jadwalContainer.querySelectorAll(".jadwal-row").length > 1) {
        row.remove();
      } else {
        Swal.fire({
          icon: "warning",
          title: "Minimal 1 Jadwal",
          text: "Setidaknya satu jadwal harus tersedia.",
        });
      }
    }
  });

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = new FormData(form);
    const keahlianList = Array.from(document.querySelectorAll('input[name="keahlian"]:checked')).map(cb => cb.value);
    formData.set("keahlian", JSON.stringify(keahlianList));

    const hariList = document.querySelectorAll('select[name="hari[]"]');
    const jamMulaiList = document.querySelectorAll('input[name="jamMulai[]"]');
    const jamSelesaiList = document.querySelectorAll('input[name="jamSelesai[]"]');

    const jadwal = [];
    for (let i = 0; i < hariList.length; i++) {
      const hari = hariList[i].value;
      const jamMulai = jamMulaiList[i].value;
      const jamSelesai = jamSelesaiList[i].value;
      if (hari && jamMulai && jamSelesai) {
        jadwal.push({ hari, jamMulai, jamSelesai });
      }
    }

    formData.set("jadwal", JSON.stringify(jadwal));

    try {
      // Kirim data ke backend jika ada endpoint
      // const response = await fetch('/api/psikolog', { method: 'POST', body: formData });

      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'Data psikolog berhasil ditambahkan!',
      });

      form.reset();
      namaFile.value = "";
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: 'Terjadi kesalahan saat menyimpan data.',
      });
    }
  });
});
