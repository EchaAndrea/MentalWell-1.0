const resetPasswordForm = document.getElementById('reset-password-form');

resetPasswordForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const token = document.getElementById('token').value; // Ambil token dari input
  const newPassword = document.getElementById('new_password').value;
  const confirmPassword = document.getElementById('confirm_password').value;

  try {
    const response = await fetch(`https://mentalwell10-api-production.up.railway.app/reset-password?token=${token}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        new_password: newPassword,
        confirm_password: confirmPassword,
      }),
    });

    const responseData = await response.json();

    if (response.ok) {
      Swal.fire({
        title: 'Berhasil Reset Password!',
        text: responseData.message,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      });
    } else {
      Swal.fire({
        title: 'Gagal Reset Password!',
        text: responseData.message || 'Silahkan Coba Lagi',
        icon: 'error',
        showConfirmButton: true,
      });
    }
  } catch (error) {
    console.error('Error during reset password:', error);
    await Swal.fire({
      title: 'Gagal Reset Password!',
      text: 'Silahkan Coba Lagi',
      icon: 'error',
      showConfirmButton: true,
    });
  }
});