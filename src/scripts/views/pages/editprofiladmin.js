const token = sessionStorage.getItem("authToken");
const form = document.querySelector(".editpasien-form");

document.addEventListener("DOMContentLoaded", async function () {
  if (!form) {
    console.error("Form .editpasien-form tidak ditemukan!");
    return;
  }
  try {
    const response = await fetch(
      "https://mentalwell10-api-production.up.railway.app/profile",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!response.ok) throw new Error("Unauthorized or server error");
    const data = await response.json();
    const user = data.data || data.result?.users || data;

    document.getElementById("profileimage").innerHTML = `
      <div id="imagePreviewContainer">
        <img src="${
          user.profile_image || ""
        }" id="gambar" style="max-width:120px;max-height:120px;border-radius:50%;">
      </div>
      <label for="inputImage" class="inputImage">Ubah Gambar</label>
      <input type="file" id="inputImage" accept="image/*">
    `;

    document.getElementById("namalengkap").value = user.name || "";
    document.getElementById("namapanggilan").value = user.nickname || "";
    document.getElementById("nowa").value = user.phone_number || "";
    document.getElementById("tgllahir").value = user.birthdate || "";
    document.getElementById("gender").value = user.gender || "";
    document.getElementById("emailHidden").value = user.email || "";
    document.getElementById("email").innerHTML = `<h4>${user.email || ""}</h4>`;

    document
      .getElementById("inputImage")
      .addEventListener("change", previewImage);
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
  const name = document.getElementById("namalengkap").value;
  const nickname = document.getElementById("namapanggilan").value;
  const phone_number = document.getElementById("nowa").value;
  const birthdate = document.getElementById("tgllahir").value;
  const gender = document.getElementById("gender").value;
  const imageInput = document.getElementById("inputImage");
  const image = imageInput ? imageInput.files[0] : null;
  const email = document.getElementById("emailHidden").value;
  const passwordInput = document.getElementById("password"); // pastikan ada input password jika ingin support
  const password = passwordInput ? passwordInput.value : "";

  const formData = new FormData();
  formData.append("name", name);
  formData.append("nickname", nickname);
  formData.append("email", email);
  formData.append("phone_number", phone_number);
  formData.append("gender", gender);
  formData.append("birthdate", birthdate);
  if (image) {
    formData.append("profile_image", image);
  }
  if (password) {
    formData.append("password", password);
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

  try {
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
    let responseData;
    try {
      responseData = await response.json();
    } catch (err) {
      console.error("Gagal parsing JSON:", err);
      Swal.fire({
        title: "Gagal!",
        text: "Format data server tidak valid.",
        icon: "error",
        showConfirmButton: true,
      });
      return;
    }

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
      console.error("Error dari server:", responseData);
      Swal.fire({
        title: "Gagal!",
        text: responseData.message || "Gagal update profil.",
        icon: "error",
        showConfirmButton: true,
      });
    }
  } catch (error) {
    console.error("Fetch error:", error);
    Swal.fire({
      title: "Gagal!",
      text: "Tidak dapat terhubung ke server.",
      icon: "error",
      showConfirmButton: true,
    });
  }
});
