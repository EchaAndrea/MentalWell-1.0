// Ambil ID psikolog dari query string (?id=1) atau default 1
function getPsikologId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id") || "1";
}

// Ambil data psikolog dari sessionStorage, fallback ke API jika tidak ada
async function getPsikologData() {
  let psikolog = {};
  try {
    psikolog = JSON.parse(sessionStorage.getItem("selected_psikolog") || "{}");
    if (!psikolog || !psikolog.id) {
      // Fallback: fetch dari API
      const token = sessionStorage.getItem("authToken");
      const id = getPsikologId();
      const res = await fetch(
        `https://mentalwell10-api-production.up.railway.app/psychologists/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      console.log("API response:", data);
      psikolog = data.data || {};
    }
  } catch (e) {
    psikolog = {};
  }
  return psikolog;
}

// Tampilkan data psikolog di atas detail pembayaran
async function tampilkanProfilPsikolog() {
  const psikolog = await getPsikologData();
  if (psikolog && psikolog.id) {
    document.getElementById("foto-psikolog").src = psikolog.profile_image || "";
    document.getElementById("foto-psikolog").alt =
      psikolog.name || "Foto Psikolog";
    document.getElementById("nama").textContent = psikolog.name || "-";
    document.getElementById("harga").textContent = psikolog.price
      ? `Rp. ${parseInt(psikolog.price).toLocaleString("id-ID")}`
      : "";

    // Tampilkan harga di detail pembayaran
    document.getElementById("hargaKonseling").textContent = psikolog.price
      ? `Rp. ${parseInt(psikolog.price).toLocaleString("id-ID")}`
      : "Rp. 0";
    // Biaya aplikasi dan total
    const biayaAplikasi = 15000;
    const total = (parseInt(psikolog.price) || 0) + biayaAplikasi;
    document.getElementById(
      "biayaAplikasi"
    ).textContent = `Rp. ${biayaAplikasi.toLocaleString("id-ID")}`;
    document.getElementById(
      "totalPembayaran"
    ).textContent = `Rp. ${total.toLocaleString("id-ID")}`;
    document.getElementById(
      "totalPembayaran2"
    ).textContent = `Rp. ${total.toLocaleString("id-ID")}`;
  } else {
    document.getElementById("nama").textContent = "Gagal memuat data psikolog";
    document.getElementById("harga").textContent = "";
  }
}

// Tahap 3: Pembayaran
async function confirmPayment() {
  const token = sessionStorage.getItem("authToken");
  const jadwal = JSON.parse(sessionStorage.getItem("jadwal") || "{}");
  const problemData = JSON.parse(
    sessionStorage.getItem("counseling_problem") || "{}"
  );
  const buktiBayar = document.getElementById("buktiBayar")?.files[0];

  if (!buktiBayar) {
    Swal.fire("Upload bukti pembayaran terlebih dahulu.");
    return;
  }

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
    // 1. POST counseling (upload bukti pembayaran)
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
      const counselingId =
        data.newCounseling.counseling_id || data.newCounseling.id;
      sessionStorage.setItem("last_counseling_id", counselingId);

      // 2. PUT update payment status
      const putRes = await fetch(
        `https://mentalwell10-api-production.up.railway.app/admin/counseling/${counselingId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ payment_status: "approved" }),
        }
      );
      const putData = await putRes.json();

      if (putData.status === "success") {
        window.location.href = "/jadwalkonseling-selesai?mode=chat";
      } else {
        Swal.fire(
          putData.message || "Pembayaran berhasil, tapi gagal update status."
        );
      }
    } else {
      Swal.fire(data.message || "Gagal mengirim pembayaran");
    }
  } catch (e) {
    Swal.fire("Gagal mengirim pembayaran");
  }
}

// Jalankan fungsi saat halaman siap
document.addEventListener("DOMContentLoaded", tampilkanProfilPsikolog);

function showLoadingIndicator() {
  const el = document.getElementById("loading-indicator");
  if (el) el.style.display = "block";
}
function hideLoadingIndicator() {
  const el = document.getElementById("loading-indicator");
  if (el) el.style.display = "none";
}

console.log("selected_psikolog:", sessionStorage.getItem("selected_psikolog"));
console.log("authToken:", sessionStorage.getItem("authToken"));
console.log("id:", getPsikologId());
