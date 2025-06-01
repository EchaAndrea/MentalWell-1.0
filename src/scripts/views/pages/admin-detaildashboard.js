const dataPembayaran = {
  pengguna: {
    nama: "Echa Andrea Gustiar",
    email: "echa.andrea@example.com",
    tanggalKonseling: "24 Mei 2025",
    waktuKonseling: "08.00 - 09.00 WIB",
  },
  pembayaran: {
    metode: "Transfer Bank BRI",
    tanggal: "11 Mei 2025",
    status: "Terbayar",
    buktiBayarUrl: "/src/public/bukti-pembayaran.png",
  },
  rincian: {
    paket: 245000,
    aplikasi: 15000,
  },
};

function formatRupiah(angka) {
  return (
    "Rp. " +
    angka
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  );
}

function renderData() {
  document.getElementById("namaPengguna").textContent = dataPembayaran.pengguna.nama;
  document.getElementById("emailPengguna").textContent = dataPembayaran.pengguna.email;
  document.getElementById("tanggalKonseling").textContent = dataPembayaran.pengguna.tanggalKonseling;
  document.getElementById("waktuKonseling").textContent = dataPembayaran.pengguna.waktuKonseling;

  document.getElementById("metodePembayaran").textContent = dataPembayaran.pembayaran.metode;
  document.getElementById("tanggalPembayaran").textContent = dataPembayaran.pembayaran.tanggal;

  const statusEl = document.getElementById("statusPembayaran");
  statusEl.textContent = dataPembayaran.pembayaran.status;
  statusEl.classList.remove("text-success", "text-danger");
  if (dataPembayaran.pembayaran.status.toLowerCase() === "terbayar") {
    statusEl.classList.add("text-success");
  } else {
    statusEl.classList.add("text-danger");
  }

  document.getElementById("hargaPaket").textContent = formatRupiah(dataPembayaran.rincian.paket);
  document.getElementById("hargaAplikasi").textContent = formatRupiah(dataPembayaran.rincian.aplikasi);
  document.getElementById("totalHarga").textContent = formatRupiah(dataPembayaran.rincian.paket + dataPembayaran.rincian.aplikasi);

  document.getElementById("imgBuktiBayar").src = dataPembayaran.pembayaran.buktiBayarUrl;
}

document.addEventListener("DOMContentLoaded", () => {
  renderData();

  document.getElementById("btnVerifikasi").addEventListener("click", () => {
    alert("Pembayaran berhasil diverifikasi!");
  });

  document.getElementById("btnTolak").addEventListener("click", () => {
    if (confirm("Apakah Anda yakin ingin menolak pembayaran ini?")) {
      alert("Pembayaran ditolak.");
    }
  });

  document.getElementById("btnKembali").addEventListener("click", () => {
    // Ganti URL ini sesuai tujuan redirect
    window.location.href = "/src/templates/admin-dashboard.html";
  });
});
