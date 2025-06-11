function openDaftarPopup() {
  document.getElementById("daftar-container").style.display = "flex";
  document.getElementById("login-container").style.display = "none";
  document.getElementById("overly").style.display = "block";
  document.getElementById("overlay").style.display = "none";
  var navbarLinks = document.getElementById("masuk");
  navbarLinks.style.pointerEvents = "none";
}

function closeDaftarPopup() {
  document.getElementById("daftar-container").style.display = "none";
  document.getElementById("overly").style.display = "none";
  var navbarLinks = document.getElementById("masuk");
  navbarLinks.style.pointerEvents = "auto";
}

document
  .getElementById("popupDaftar")
  .addEventListener("click", function (event) {
    event.preventDefault(); // Mencegah tautan mengarahkan ke URL yang sebenarnya
    showPopup();
  });

function togglePasswordVisibility() {
  const passwordInput = document.getElementById("passworddaftar");
  const toggleIcon = document.querySelector(".daftar-form .form-control i");

  // Mengubah tipe input dan ikon berdasarkan status input
  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    toggleIcon.classList.remove("far", "fa-eye-slash");
    toggleIcon.classList.add("far", "fa-eye");
  } else {
    passwordInput.type = "password";
    toggleIcon.classList.remove("far", "fa-eye");
    toggleIcon.classList.add("far", "fa-eye-slash");
  }
}

function toggleConfirmasiPasswordVisibility() {
  const passwordInput = document.getElementById("confpassword");
  const toggleIcon = document.querySelector(
    ".daftar-form .form-control .confpassword"
  );

  // Mengubah tipe input dan ikon berdasarkan status input
  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    toggleIcon.classList.remove("far", "fa-eye-slash");
    toggleIcon.classList.add("far", "fa-eye");
  } else {
    passwordInput.type = "password";
    toggleIcon.classList.remove("far", "fa-eye");
    toggleIcon.classList.add("far", "fa-eye-slash");
  }
}

const daftarForm = document.getElementById("daftar-form");

daftarForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  // Panggil validasi sebelum submit
  if (!validateForm()) {
    return;
  }

  const email = document.getElementById("email").value;
  const notelp = document.getElementById("notelp").value;
  const password = document.getElementById("passworddaftar").value;
  const confirmPassword = document.getElementById("confpassword").value;

  const formData = {
    email,
    password,
    confirm_password: confirmPassword,
    phone_number: notelp,
  };

  Swal.fire({
    title: "Memuat...",
    allowOutsideClick: false,
    showCancelButton: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });

  try {
    const response = await fetch(
      "https://mentalwell10-api-production.up.railway.app/register",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      Swal.fire({
        title: "Gagal!",
        // Tampilkan seluruh isi result agar tahu error detail dari backend
        text: result.message || JSON.stringify(result) || "Terjadi kesalahan.",
        icon: "error",
        showConfirmButton: true,
      });
      return;
    }

    Swal.fire({
      title: "Berhasil!",
      text: result.message || "Registrasi sukses.",
      icon: "success",
      showConfirmButton: true,
    }).then(() => {
      window.location.href = "https://mentalwell-10-frontend.vercel.app/";
    });
  } catch (error) {
    // Catch error jaringan / JSON parse
    Swal.fire({
      title: "Gagal!",
      text: error.message || "Tidak dapat menghubungi server.",
      icon: "error",
      showConfirmButton: true,
    });
  }
});

function validateForm() {
  var notelp = document.getElementById("notelp").value;
  var password = document.getElementById("passworddaftar").value;
  var confirmPassword = document.getElementById("confpassword").value;

  // Validasi nomor telepon sesuai backend
  if (!/^628[0-9]{8,12}$/.test(notelp)) {
    Swal.fire({
      title: "Gagal Daftar!",
      text: "Nomor Whatsapp harus dimulai dengan 628 dan panjang 11-15 digit, contoh: 6281234567890",
      icon: "error",
      showConfirmButton: true,
    });
    return false;
  }

  if (!isValidPassword(password)) {
    Swal.fire({
      title: "Gagal Daftar!",
      text: "Kata Sandi harus paling sedikit 8 karakter dengan setidaknya 1 angka!",
      icon: "error",
      showConfirmButton: true,
    });
    return false;
  }

  if (password !== confirmPassword) {
    Swal.fire({
      title: "Gagal Daftar!",
      text: "Kata Sandi dan Konfirmasi Kata Sandi Harus Sama!",
      icon: "error",
      showConfirmButton: true,
    });
    return false;
  }

  return true;
}

function isValidPassword(password) {
  return (
    password.length >= 8 && /[a-zA-Z]/.test(password) && /\d/.test(password)
  );
}
