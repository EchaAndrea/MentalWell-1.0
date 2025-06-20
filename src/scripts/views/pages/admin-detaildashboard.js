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
  document.getElementById("btnRefund").onclick = () =>
    refundPayment(counselingId, TOKEN);

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
    const c = data.counseling;

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
    console.log("Harga Paket dari API:", c.price, typeof c.price);

    // Set harga aplikasi tetap 15000
    const appFee = 15000;
    document.getElementById("hargaPaket").textContent = c.price
      ? `Rp. ${c.price}`
      : "-";
    document.getElementById("hargaAplikasi").textContent = `Rp. ${appFee}`;

    // Hitung total harga
    const total = (c.price ? Number(c.price) : 0) + appFee;
    document.getElementById("totalHarga").textContent = total
      ? `Rp. ${total}`
      : "-";
    document.getElementById("imgBuktiBayar").src = c.payment_proof || "";

    // Disable tombol jika status pembayaran sudah final
    if (["approved", "rejected", "refunded"].includes(c.payment_status)) {
      document.getElementById("btnVerifikasi").disabled = true;
      document.getElementById("btnTolak").disabled = true;
      document.getElementById("btnRefund").disabled = true;
    }

    // Tambahan: Disable tombol Verifikasi jika status sesi gagal
    if (c.status === "failed") {
      document.getElementById("btnVerifikasi").disabled = true;
      // Optional: tampilkan pesan ke admin
      alert("Sesi gagal, hanya bisa Tolak atau Refund.");
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
      console.log("API response:", data);
      if (data.status === "success") {
        alert("Pembayaran ditolak!");
        location.reload();
      } else {
        alert("Gagal menolak pembayaran");
      }
    })
    .catch(() => alert("Gagal menolak pembayaran"));
}

async function refundPayment(id, TOKEN) {
  if (!confirm("Refund pembayaran ini?")) return;
  try {
    const res = await fetch(
      `https://mentalwell10-api-production.up.railway.app/admin/counseling/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${TOKEN}`,
        },
        body: JSON.stringify({ payment_status: "refunded" }),
      }
    );
    const data = await res.json();
    console.log("API response:", data);
    if (data.status === "success") {
      alert("Pembayaran berhasil direfund!");
      location.reload();
    } else {
      alert("Gagal refund pembayaran");
    }
  } catch (err) {
    alert("Gagal refund pembayaran");
  }
}

async function updateCounselingStatus(id, status, token) {
  try {
    const res = await fetch(
      `https://mentalwell10-api-production.up.railway.app/psychologist/counseling/${id}/status`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      }
    );
    const data = await res.json();
    console.log("API response:", data);
    if (data.status === "success") {
      alert("Status konseling berhasil diubah!");
      location.reload();
    } else {
      alert(data.message || "Gagal mengubah status konseling");
    }
  } catch (err) {
    alert("Gagal mengubah status konseling");
  }
}
