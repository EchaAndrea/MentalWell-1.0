const token = sessionStorage.getItem("authToken");
const editIcon = document.getElementById("editIcon");
const form = document.querySelector(".editpasien-form");

document.addEventListener("DOMContentLoaded", async function () {
  const token = sessionStorage.getItem("authToken");
  const response = await fetch(
    "https://mentalwell10-api-production.up.railway.app/my-data",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const data = await response.json();
  const user = data.result.users;

  document.getElementById("namalengkap").value = user.name || "";
  document.getElementById("namapanggilan").value = user.nickname || "";
  document.getElementById("nowa").value = user.phone_number || "";
  document.getElementById("tgllahir").value = user.birthdate || "";
  document.getElementById("gender").value =
    user.gender?.toLowerCase() === "perempuan" ? "perempuan" : "laki_laki";
  document.getElementById("email").innerHTML = `<h4>${user.email || ""}</h4>`;
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
