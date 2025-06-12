const token = sessionStorage.getItem("authToken");
const editIcon = document.getElementById("editIcon");
const form = document.querySelector(".editpasien-form");

document.addEventListener("DOMContentLoaded", async function () {
  // Fetch patient data from the backend with authorization
  const response = await fetch(
    "https://mentalwell10-api-production.up.railway.app/profile",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const patientData = await response.json();

  document.getElementById("profileimage").innerHTML = `
    <div id="imagePreviewContainer">
      <img src="${patientData.users.profile_image}" id="gambar">
    </div>
    <label for="inputImage" class="inputImage">Ubah Gambar</label>
    <input type="file" id="inputImage" onchange="previewImage(event)">
  `;

  // Update email
  document.getElementById(
    "email"
  ).innerHTML = `<h4>${patientData.users.email}</h4>`;

  // Update name
  document.getElementById("namalengkap").value = patientData.users.name;

  // Update nickname
  document.getElementById("namapanggilan").value = patientData.users.nickname;

  // Update phone number
  document.getElementById("nowa").value = patientData.users.phone_number;

  // Update birthdate
  document.getElementById("tgllahir").value = patientData.users.birthdate;

  // Update gender
  document.getElementById("gender").value = patientData.users.gender;
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
  const imageInput = document.getElementById("inputImage");
  const image = imageInput ? imageInput.files[0] : null;
  const formData = new FormData();

  formData.append("name", name);
  formData.append("nickname", nickname);
  formData.append("phone_number", phone_number);
  formData.append("birthdate", birthdate);
  formData.append("gender", gender);
  if (image) {
    formData.append("profile_image", image);
  }

  Swal.fire({
    title: "Memuat...",
    text: "Harap tunggu sejenak. Profil anda akan segera berubah.",
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
        // Jangan set Content-Type, biarkan browser yang mengatur
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
      text: errorMessage,
      icon: "error",
      showConfirmButton: true,
    });
  }
});
