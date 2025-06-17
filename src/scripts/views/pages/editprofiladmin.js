const token = sessionStorage.getItem("authToken");
const form = document.querySelector(".editpasien-form");

document.addEventListener("DOMContentLoaded", async function () {
  // Fetch admin data from the new backend endpoint
  const response = await fetch(
    "https://mentalwell10-api-production.up.railway.app/profile",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const adminData = await response.json();

  document.getElementById("profileimage").innerHTML = `
    <div id="imagePreviewContainer">
      <img src="${adminData.profile_image}" id="gambar">
    </div>
    <label for="inputImage" class="inputImage">Ubah Gambar</label>
    <input type="file" id="inputImage" onchange="previewImage(event)">
  `;

  // Update email
  document.getElementById("email").innerHTML = `<h4>${adminData.email}</h4>`;

  // Update name
  document.getElementById("namalengkap").value = adminData.name;

  // Update nickname
  document.getElementById("namapanggilan").value = adminData.nickname;

  // Update phone number
  document.getElementById("nowa").value = adminData.phone_number;

  // Update birthdate
  document.getElementById("tgllahir").value = adminData.birthdate;

  // Update gender
  document.getElementById("gender").value = adminData.gender;
});

function previewImage(event) {
  const inputImage = event.target;
  const imagePreview = document.getElementById("gambar");
  const imagePreviewContainer = document.getElementById(
    "imagePreviewContainer"
  );

  if (inputImage.files && inputImage.files[0]) {
    const reader = new FileReader();

    reader.onload = function (e) {
      imagePreview.src = e.target.result;
      imagePreviewContainer.style.display = "block";
    };

    reader.readAsDataURL(inputImage.files[0]);
  } else {
    imagePreview.src = "";
    imagePreviewContainer.style.display = "none";
  }
}

form.addEventListener("submit", async function (event) {
  event.preventDefault();
  const name = document.getElementById("namalengkap").value;
  const nickname = document.getElementById("namapanggilan").value;
  const phone_number = document.getElementById("nowa").value;
  const birthdate = document.getElementById("tgllahir").value;
  const gender = document.getElementById("gender").value;
  const image = document.getElementById("inputImage").files[0];
  const email = document.getElementById("email").innerText.trim();
  // Jika ingin mengubah password, isi di sini. Jika tidak, bisa dikosongkan atau hapus baris ini.
  const password = ""; // atau '12345678aa' jika memang ingin default

  const formData = new FormData();
  formData.append("name", name);
  formData.append("nickname", nickname);
  formData.append("email", email);
  formData.append("phone_number", phone_number);
  formData.append("gender", gender);
  formData.append("birthdate", birthdate);
  if (password) formData.append("password", password);
  if (image) formData.append("profile_image", image);

  Swal.fire({
    title: "Memuat...",
    text: "Harap tunggu sejenak. Profil anda akan segera berubah. ",
    allowOutsideClick: false,
    showCancelButton: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });

  const response = await fetch(
    "https://mentalwell10-api-production.up.railway.app/profile",
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );

  if (response.ok) {
    Swal.close();

    Swal.fire({
      title: "Profil Berhasil Diubah",
      icon: "success",
      showConfirmButton: false,
      timer: 2000,
    });
    location.reload();
  } else {
    const errorMessage = await response.text();
    Swal.fire({
      title: "Gagal!",
      text: "Profil Gagal Diubah, Format Gambar Harus .JPG",
      icon: "error",
      showConfirmButton: true,
    });
  }
});
