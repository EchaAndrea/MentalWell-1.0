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

// Tampilkan data psikolog di atas detail pembayaran
async function tampilkanProfilPsikolog() {
  try {
    const psikologId = getPsikologId();
    const data = await fetchPsikolog(psikologId);
    const psikolog = data.data || {};

    document.getElementById("foto-psikolog").src = psikolog.profile_image || "";
    document.getElementById("nama").textContent = psikolog.name || "-";
    document.getElementById("harga").textContent = psikolog.price
      ? `Rp. ${parseInt(psikolog.price).toLocaleString("id-ID")}`
      : "";
  } catch (e) {
    document.getElementById("nama").textContent = "Gagal memuat data psikolog";
    document.getElementById("harga").textContent = "";
  }
}

// Tahap 3: Pembayaran
async function confirmPayment() {
  const token = sessionStorage.getItem("authToken");
  const jadwal = JSON.parse(localStorage.getItem("jadwal") || "{}");
  const problemData = JSON.parse(
    localStorage.getItem("counseling_problem") || "{}"
  );
  const buktiBayar = document.getElementById("buktiBayar")?.files[0];

  if (!buktiBayar) {
    Swal.fire("Upload bukti pembayaran terlebih dahulu.");
    return;
  }

  // psychologist_id dari jadwal
  const psychologist_id =
    jadwal.psikolog_id || jadwal.psychologist_id || getPsikologId();

  const formData = new FormData();
  formData.append("occupation", jadwal.pekerjaan || "Mahasiswa");
  formData.append("problem_description", problemData.problem || "");
  formData.append("hope_after", problemData.hope || "");
  formData.append("date", jadwal.tanggal || "");
  formData.append("time", jadwal.waktu || "");
  formData.append("payment_proof", buktiBayar);

  try {
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
      // Redirect ke halaman selesai dengan mode chat
      window.location.href = "/jadwalkonseling-selesai?mode=chat";
    } else {
      Swal.fire(data.message || "Gagal mengirim pembayaran");
    }
  } catch (e) {
    Swal.fire("Gagal mengirim pembayaran");
  }
}

// Jalankan fungsi sesuai halaman
document.addEventListener("DOMContentLoaded", async function () {
  // Tampilkan profil psikolog
  tampilkanProfilPsikolog();

  // Ambil data biaya dari localStorage (atau fetch dari API jika perlu)
  const jadwal = JSON.parse(localStorage.getItem("jadwal") || "{}");

  // Misal data dari backend:
  // jadwal.harga, jadwal.biaya_aplikasi, jadwal.total, jadwal.virtual_account

  const harga = parseInt(jadwal.harga) || 0;
  const biayaAplikasi = parseInt(jadwal.biaya_aplikasi) || 0;
  const total = parseInt(jadwal.total) || harga + biayaAplikasi;

  document.getElementById(
    "hargaKonseling"
  ).textContent = `Rp. ${harga.toLocaleString("id-ID")}`;
  document.getElementById(
    "biayaAplikasi"
  ).textContent = `Rp. ${biayaAplikasi.toLocaleString("id-ID")}`;
  document.getElementById(
    "totalPembayaran"
  ).textContent = `Rp. ${total.toLocaleString("id-ID")}`;
  document.getElementById(
    "totalPembayaran2"
  ).textContent = `Rp. ${total.toLocaleString("id-ID")}`;
  document.getElementById("virtualAccount").textContent =
    jadwal.virtual_account || "123 456 789 1011";
});

function showLoadingIndicator() {
  const el = document.getElementById("loading-indicator");
  if (el) el.style.display = "block";
}
function hideLoadingIndicator() {
  const el = document.getElementById("loading-indicator");
  if (el) el.style.display = "none";
}
