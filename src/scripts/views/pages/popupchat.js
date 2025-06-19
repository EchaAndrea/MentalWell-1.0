document.addEventListener("DOMContentLoaded", function () {
  const input = document.getElementById("chatInput");
  if (input) {
    input.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        sendMessage();
      }
    });
  }

  const fileUpload = document.getElementById("fileUpload");
  if (fileUpload) {
    fileUpload.addEventListener("change", function () {
      if (this.files.length > 0) {
        addChatBubble(`📎 File dikirim: ${this.files[0].name}`, "right");
        scrollToBottom();
      }
    });
  }

  // Tampilkan nama target di popup chat
  const targetName = localStorage.getItem("active_counseling_name");
  const nameDiv = document.getElementById("chatTargetName");
  if (nameDiv && targetName) {
    nameDiv.textContent = `Chat dengan: ${targetName}`;
  }
  // Tambahan: isi header juga
  const headerName = document.getElementById("namaPsikolog");
  if (headerName && targetName) {
    headerName.textContent = targetName;
  }
});

window.toggleChat = function () {
  const popup = document.getElementById("chatPopup");
  const chatBody = document.getElementById("chatBody");

  if (popup.style.display === "flex") {
    popup.style.display = "none";
  } else {
    popup.style.display = "flex";
    if (chatBody && chatBody.children.length === 0) {
      addChatBubble("Halo, ada yang bisa saya bantu?", "left");
    }
  }
};

window.sendMessage = function () {
  const input = document.getElementById("chatInput");
  const message = input.value.trim();
  if (message !== "") {
    addChatBubble(message, "right");
    input.value = "";
    scrollToBottom();

    setTimeout(() => {
      addChatBubble(
        "Terima kasih sudah berbagi, saya akan bantu semampu saya.",
        "left"
      );
      scrollToBottom();
    }, 800);
  }
};

function addChatBubble(text, position) {
  const chatBody = document.getElementById("chatBody");
  const bubble = document.createElement("div");
  bubble.className = `chat-bubble ${position}`;
  bubble.textContent = text;
  chatBody.appendChild(bubble);
}

function scrollToBottom() {
  const chatBody = document.getElementById("chatBody");
  chatBody.scrollTop = chatBody.scrollHeight;
}
