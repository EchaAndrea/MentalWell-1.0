document.addEventListener("DOMContentLoaded", function () {
  // Ambil nama dari localStorage
  const role = localStorage.getItem("active_role");
  let nama = "Nama";
  if (role === "psikolog") {
    nama = localStorage.getItem("active_patient_name") || "Pasien";
  } else {
    nama = localStorage.getItem("active_psychologist_name") || "Psikolog";
  }
  const namaPsikolog = document.getElementById("namaPsikolog");
  if (namaPsikolog) namaPsikolog.textContent = nama;

  // Fungsi untuk menutup chat popup
  window.closeChat = function () {
    document.getElementById("chatPopup").style.display = "none";
    document.getElementById("chatOverlay").style.display = "none";
  };

  // Fungsi untuk mengirim pesan
  window.sendMessage = function () {
    const input = document.getElementById("chatInput");
    const message = input.value.trim();
    if (!message) return;

    const chatBody = document.getElementById("chatBody");
    const msgDiv = document.createElement("div");
    msgDiv.className = "alert alert-primary p-2 mb-1 align-self-end";
    msgDiv.textContent = message;
    chatBody.appendChild(msgDiv);

    input.value = "";
    chatBody.scrollTop = chatBody.scrollHeight;
  };

  // Enter untuk kirim pesan
  const chatInput = document.getElementById("chatInput");
  if (chatInput) {
    chatInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        window.sendMessage();
      }
    });
  }

  // Optional: Preview nama file yang diupload
  const fileUpload = document.getElementById("fileUpload");
  if (fileUpload) {
    fileUpload.addEventListener("change", function (e) {
      const file = e.target.files[0];
      if (file) {
        const chatBody = document.getElementById("chatBody");
        const fileDiv = document.createElement("div");
        fileDiv.className = "alert alert-secondary p-2 mb-1 align-self-end";
        fileDiv.textContent = `File: ${file.name}`;
        chatBody.appendChild(fileDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
      }
    });
  }

  // Debug log
  console.log("chatInput:", document.getElementById("chatInput"));
});
