document.addEventListener("DOMContentLoaded", () => {
  const TOKEN = sessionStorage.getItem("authToken");
  if (!TOKEN) {
    window.location.href = "https://mentalwell-10-frontend.vercel.app/";
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const counselingId = urlParams.get("id");
  if (counselingId) {
    fetchCounselingDetail(counselingId, TOKEN);
  }

  document.getElementById("btnKembali").onclick = () => window.history.back();
  document.getElementById("btnVerifikasi").onclick = () =>
    updatePaymentStatus(counselingId, "approved", TOKEN);
  document.getElementById("btnTolak").onclick = () =>
    rejectPayment(counselingId, TOKEN);

  // Modal bukti bayar
  document.getElementById("statusPembayaran").onclick = (e) => {
    e.preventDefault();
    const img = document.getElementById("imgBuktiBayar");
    if (img.src) {
      new bootstrap.Modal(document.getElementById("buktiBayarModal")).show();
    }
  };
});

async function fetchCounselingDetail(id, TOKEN) {
  try {
    const res = await fetch(
      `https://mentalwell10-api-production.up.railway.app/admin/counseling/${id}`,
      {
        headers: { Authorization: `Bearer ${TOKEN}` },
      }
    );
    const data = await res.json();
    console.log("API response:", data);
    const c = data.counseling;
    console.log("Counseling object:", c);

    document.getElementById("namaPengguna").textContent = c.patient_name;
    document.getElementById("emailPengguna").textContent =
      c.patient_email || "-";
    document.getElementById("tanggalKonseling").textContent = c.schedule_date;
    document.getElementById("waktuKonseling").textContent = c.schedule_time;
    document.getElementById("metodePembayaran").textContent =
      c.payment_method || "-";
    document.getElementById("tanggalPembayaran").textContent = c.created_at
      ? c.created_at.split("T")[0]
      : "-";
    document.getElementById("statusPembayaran").textContent = statusText(
      c.payment_status
    );
    document.getElementById("hargaPaket").textContent = c.package_price
      ? `Rp${c.package_price}`
      : "-";
    document.getElementById("hargaAplikasi").textContent = c.app_fee
      ? `Rp${c.app_fee}`
      : "-";
    document.getElementById("totalHarga").textContent = c.total_price
      ? `Rp${c.total_price}`
      : "-";
    document.getElementById("imgBuktiBayar").src = c.payment_proof || "";

    // Disable tombol jika sudah diverifikasi/ditolak
    if (["approved", "rejected", "refunded"].includes(c.payment_status)) {
      document.getElementById("btnVerifikasi").disabled = true;
      document.getElementById("btnTolak").disabled = true;
    }
  } catch (err) {
    alert("Gagal memuat detail konseling");
  }
}

function statusText(status) {
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

async function updatePaymentStatus(id, status, TOKEN) {
  if (!confirm("Verifikasi pembayaran ini?")) return;
  try {
    const res = await fetch(
      `https://mentalwell10-api-production.up.railway.app/admin/counseling/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${TOKEN}`,
        },
        body: JSON.stringify({ payment_status: status }),
      }
    );
    const data = await res.json();
    console.log("API response:", data); 
    if (data.status === "success") {
      alert("Pembayaran diverifikasi!");
      location.reload();
    } else {
      alert("Gagal verifikasi pembayaran");
    }
  } catch (err) {
    alert("Gagal verifikasi pembayaran");
  }
}

function rejectPayment(id, TOKEN) {
  const note = prompt("Masukkan alasan penolakan pembayaran:");
  if (!note) return;
  fetch(
    `https://mentalwell10-api-production.up.railway.app/admin/counseling/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({ payment_status: "rejected", note }),
    }
  )
    .then((res) => res.json())
    .then((data) => {
      if (data.status === "success") {
        alert("Pembayaran ditolak!");
        location.reload();
      } else {
        alert("Gagal menolak pembayaran");
      }
    })
    .catch(() => alert("Gagal menolak pembayaran"));
}
