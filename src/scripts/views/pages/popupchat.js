// Dummy: Set nama psikolog
document.getElementById("namaPsikolog").textContent = "Dr. Andi Psikolog";

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
document.getElementById("chatInput").addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    window.sendMessage();
  }
});

// Optional: Preview nama file yang diupload
document.getElementById("fileUpload").addEventListener("change", function (e) {
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
