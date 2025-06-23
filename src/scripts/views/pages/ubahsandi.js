const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get("token");

if (!token) {
  Swal.fire({
    title: "Gagal!",
    text: "Tautan Ubah Kata Sandi Tidak Valid",
    icon: "error",
    showConfirmButton: true,
  });
}

const ubahsandiForm = document.getElementById("ubahsandi-form");

ubahsandiForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const newPassword = document.getElementById("sandibaru").value;
  const confirmPassword = document.getElementById("konfirmasi").value;

  try {
    const response = await fetch(
      `https://mentalwell10-api-production.up.railway.app/reset-password?token=${token}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          new_password: newPassword,
          confirm_password: confirmPassword,
        }),
      }
    );

    const responseData = await response.json();

    if (response.ok) {
      Swal.fire({
        title: "Ubah Sandi Berhasil!",
        text: responseData.message,
        icon: "success",
        showConfirmButton: true,
      });
      window.location.href = "https://mentalwell-10-frontend.vercel.app/";
    } else {
      Swal.fire({
        title: "Gagal!",
        text: responseData.message || "Ubah Sandi Gagal!",
        icon: "error",
        showConfirmButton: true,
      });
    }
  } catch (error) {
    console.error("Password reset error:", error);
    Swal.fire({
      title: "Gagal!",
      text: "Terjadi kesalahan. Silahkan coba lagi.",
      icon: "error",
      showConfirmButton: true,
    });
  }
});