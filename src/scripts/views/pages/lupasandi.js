const lupasandiForm = document.getElementById('lupasandi-form');

lupasandiForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const email = document.getElementById('email').value;

  try {
    const response = await fetch('https://mentalwell10-api-production.up.railway.app/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ${token}',
      },
      body: JSON.stringify({ email }),
    });

    const responseData = await response.json();

    if (response.ok) {
      Swal.fire({
        title: 'Berhasil Mengirim Email!',
        text: responseData.message,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      });
    } else {
      Swal.fire({
        title: 'Gagal Mengirim Email!',
        text: responseData.message || 'Silahkan Coba Lagi',
        icon: 'error',
        showConfirmButton: true,
      });
    }
  } catch (error) {
    console.error('Error during reset password:', error);
    await Swal.fire({
      title: 'Gagal Mengirim Email!',
      text: 'Silahkan Coba Lagi',
      icon: 'error',
      showConfirmButton: true,
    });
  }
});