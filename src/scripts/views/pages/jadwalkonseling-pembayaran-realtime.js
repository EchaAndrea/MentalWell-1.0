document.addEventListener("DOMContentLoaded", function () {
  const jadwal = JSON.parse(localStorage.getItem("jadwal") || "{}");
  const psikologId = new URLSearchParams(window.location.search).get("id");

  // Tampilkan harga, VA, dll sesuai kebutuhan
  // ...

  document.getElementById("btnKonfirmasiPembayaran").onclick =
    async function () {
      const token = sessionStorage.getItem("authToken");
      const problemData = JSON.parse(
        localStorage.getItem("counseling_problem") || "{}"
      );
      const buktiBayar = document.getElementById("buktiBayar")?.files[0];

      if (!psikologId || !buktiBayar) {
        Swal.fire({
          icon: "warning",
          title: "Data Tidak Lengkap",
          text: "Silakan upload bukti pembayaran terlebih dahulu.",
        });
        return;
      }

      const formData = new FormData();
      formData.append("occupation", "Mahasiswa");
      formData.append("problem_description", problemData.problem || "");
      formData.append("hope_after", problemData.hope || "");
      formData.append("payment_proof", buktiBayar);

      Swal.fire({
        title: "Memproses pembayaran...",
        didOpen: () => Swal.showLoading(),
        allowOutsideClick: false,
      });

      try {
        const res = await fetch(
          `https://mentalwell10-api-production.up.railway.app/realtime/counseling/${psikologId}`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          }
        );
        const data = await res.json();
        if (data.status === "success") {
          const counseling_id = data.newCounseling?.counseling_id;
          if (!counseling_id)
            throw new Error("Counseling ID tidak ditemukan dalam response");
          localStorage.setItem("last_counseling_id", counseling_id);

          // Ambil conversation_id jika perlu
          const detail = await fetch(
            `https://mentalwell10-api-production.up.railway.app/counseling/${counseling_id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          ).then((res) => res.json());
          const conversation_id = detail.counseling?.conversation_id;
          if (conversation_id && conversation_id !== "null") {
            localStorage.setItem("last_conversation_id", conversation_id);
          } else {
            localStorage.removeItem("last_conversation_id");
          }

          Swal.close();
          window.location.href = `/jadwalkonseling-selesai.html?id=${psikologId}&mode=realtime`;
        } else {
          Swal.close();
          Swal.fire({
            icon: "error",
            title: "Pembayaran Gagal",
            text: data.message || "Gagal mengirim counseling realtime",
          });
        }
      } catch (error) {
        console.error("Realtime counseling error:", error);
        Swal.close();
        Swal.fire({
          icon: "error",
          title: "Pembayaran Gagal",
          text: "Gagal memproses counseling realtime. Silakan coba lagi.",
        });
      }
    };
});
