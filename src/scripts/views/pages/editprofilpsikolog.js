const token = sessionStorage.getItem("authToken");
const editProfileImageIcon = document.getElementById("editProfileImage");
const form = document.querySelector(".editpsikolog-form");

document.addEventListener("DOMContentLoaded", async function () {
  const token = sessionStorage.getItem("authToken");
  try {
    const response = await fetch(
      "https://mentalwell10-api-production.up.railway.app/psychologist/profile",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!response.ok) throw new Error("Unauthorized or server error");
    const psychologistData = await response.json();
    const data = psychologistData.data;
    if (!data) throw new Error("No data received");

    // Isi gambar profil
    document.getElementById("profileimage").innerHTML = `
      <div id="imagePreviewContainer">
        <img src="${data.profile_image || ""}" id="gambar">
      </div>
      <label for="inputImage" class="inputImage">Ubah Gambar</label>
      <input type="file" id="inputImage" onchange="previewImage(event)">
    `;

    // Isi field lain
    document.getElementById("email").innerHTML = `<h4>${data.email || ""}</h4>`;
    document.getElementById("namalengkap").value = data.name || "";
    document.getElementById("namapanggilan").value = data.nickname || "";
    document.getElementById("nowa").value = data.phone_number || "";
    document.getElementById("tgllahir").value = data.birthdate || "";
    document.getElementById("gender").value = data.gender || "";
    document.getElementById("bio").value = data.bio || "";
    document.getElementById("pengalaman").value = data.experience || "";

    // Topik keahlian (checkbox)
    const expertiseCheckboxes = document.querySelectorAll(
      'input[name="topik"]'
    );
    const expertiseTopics = data.topics || [];
    expertiseCheckboxes.forEach((checkbox) => {
      checkbox.checked = expertiseTopics
        .map((row) => row.name)
        .includes(checkbox.value);
    });
  } catch (error) {
    Swal.fire({
      title: "Gagal Memuat Data",
      text: "Silakan login ulang atau hubungi admin.",
      icon: "error",
      showConfirmButton: true,
    });
  }
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

  // Tambahkan id="namalengkap" pada input Nama Lengkap di HTML
  const name = document.getElementById("namalengkap").value;
  const nickname = document.getElementById("namapanggilan").value;
  const phone_number = document.getElementById("nowa").value;
  const birthdate = document.getElementById("tgllahir").value;
  const gender = document.getElementById("gender").value;
  const bio = document.getElementById("bio").value;
  const experience = document.getElementById("pengalaman").value;
  const image = document.getElementById("inputImage").files[0];
  const formData = new FormData();

  formData.append("name", name);
  formData.append("nickname", nickname);
  formData.append("phone_number", phone_number);
  formData.append("birthdate", birthdate);
  formData.append("gender", gender);
  formData.append("bio", bio);
  formData.append("experience", experience);
  if (image) formData.append("profile_image", image);

  // ...topik keahlian jika perlu...

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
    "https://mentalwell10-api-production.up.railway.app/psychologist/profile",
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
      text: "Profil Gagal Diubah, Format File Harus .JPG",
      icon: "error",
      showConfirmButton: true,
    });
  }
});
