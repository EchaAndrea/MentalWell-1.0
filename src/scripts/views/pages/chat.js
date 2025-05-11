function toggleChat() {
    const popup = document.getElementById("chatPopup");
    popup.style.display = popup.style.display === "flex" ? "none" : "flex";
  
    const chatBody = document.getElementById("chatBody");
    if (chatBody.children.length === 0) {
      addChatBubble("Halo, ada yang bisa saya bantu?", "left");
    }
  }
  
  function sendMessage() {
    const input = document.getElementById("chatInput");
    const message = input.value.trim();
    if (message !== "") {
      addChatBubble(message, "right");
      input.value = "";
      scrollToBottom();
  
      setTimeout(() => {
        addChatBubble("Terima kasih sudah berbagi, saya akan bantu semampu saya.", "left");
        scrollToBottom();
      }, 800);
    }
  }
  
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
  
  document.addEventListener("DOMContentLoaded", function () {
    const chatBody = document.getElementById("chatBody");
    addChatBubble("Halo, ada yang bisa saya bantu?", "left");
  
    const input = document.getElementById("chatInput");
    input.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        sendMessage();
      }
    });
  
    document.getElementById("fileUpload").addEventListener("change", function () {
      if (this.files.length > 0) {
        addChatBubble(`📎 File dikirim: ${this.files[0].name}`, "right");
        scrollToBottom();
      }
    });
  });
  