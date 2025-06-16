function formatRupiah(angka) {
  return "Rp. " + angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function getCounselingIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

function formatDate(dateStr) {
  if (!dateStr) return "-";
  const [y, m, d] = dateStr.split("-");
  return `${d}-${m}-${y}`;
}

function mapPaymentStatus(status) {
  switch (status) {
    case "approved":
      return "Lunas";
    case "waiting":
      return "Belum Lunas";
    case "failed":
      return "Gagal";
    case "refunded":
      return "Refund";
    case "rejected":
      return "Ditolak";
    default:
      return status;
  }
}

async function fetchCounselingDetail(id) {
  const token = localStorage.getItem("admin_token");
  try {
    const res = await fetch(
      `https://mentalwell10-api-production.up.railway.app/admin/counseling/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const json = await res.json();
    if (json.status === "success") {
      return json.counseling;
    } else {
      alert("Gagal memuat detail konseling.");
      return null;
    }
  } catch (e) {
    alert("Terjadi kesalahan koneksi.");
    return null;
  }
}

function renderDataKonseling(data) {
  document.getElementById("namaPengguna").textContent = data.patient_name;
  document.getElementById("emailPengguna").textContent = "-";
  document.getElementById("tanggalKonseling").textContent = formatDate(
    data.schedule_date
  );
  document.getElementById("waktuKonseling").textContent = data.schedule_time;

  document.getElementById("metodePembayaran").textContent = "-";
  document.getElementById("tanggalPembayaran").textContent = formatDate(
    data.created_at.split("T")[0]
  );

  const statusEl = document.getElementById("statusPembayaran");
  statusEl.textContent = mapPaymentStatus(data.payment_status);
  statusEl.classList.remove("text-success", "text-danger");
  if (data.payment_status === "approved")
    statusEl.classList.add("text-success");
  else statusEl.classList.add("text-danger");

  document.getElementById("hargaPaket").textContent = "-";
  document.getElementById("hargaAplikasi").textContent = "-";
  document.getElementById("totalHarga").textContent = "-";

  // Bukti pembayaran
  if (data.payment_proof) {
    let img = document.getElementById("imgBuktiBayar");
    if (img) img.src = data.payment_proof;
  }
}

async function updatePaymentStatus(id, status, note = "") {
  const token = localStorage.getItem("admin_token");
  const body = { payment_status: status };
  if (status === "rejected") body.note = note;

  try {
    const res = await fetch(
      `https://mentalwell10-api-production.up.railway.app/admin/counseling/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      }
    );
    const json = await res.json();
    if (json.status === "success") {
      alert("Status pembayaran berhasil diupdate!");
      location.reload();
    } else {
      alert("Gagal update status: " + (json.message || "Unknown error"));
    }
  } catch (e) {
    alert("Terjadi kesalahan koneksi.");
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const id = getCounselingIdFromUrl();
  if (!id) {
    alert("ID konseling tidak ditemukan di URL.");
    return;
  }
  const data = await fetchCounselingDetail(id);
  if (data) renderDataKonseling(data);

  document.getElementById("btnVerifikasi").addEventListener("click", () => {
    updatePaymentStatus(id, "approved");
  });

  document.getElementById("btnTolak").addEventListener("click", () => {
    const note = prompt("Masukkan alasan penolakan pembayaran:");
    if (note) updatePaymentStatus(id, "rejected", note);
  });

  document.getElementById("btnKembali").addEventListener("click", () => {
    window.location.href = "/src/templates/admin-dashboard.html";
  });
});
