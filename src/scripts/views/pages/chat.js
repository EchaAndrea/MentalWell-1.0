const users = ["Natasya Alana Putri", "Anindya Kinarya", "Echa Andrea"];
const messages = {
  "Natasya Alana Putri": ["Halo!", "Apa kabar?"],
  "Anindya Kinarya": ["Selamat pagi!", "Ada yang bisa saya bantu?"],
  "Echa Andrea": ["Tes chat dari Echa."]
};

const userList = document.getElementById("userList");
const chatMessages = document.getElementById("chatMessages");
const chatUserName = document.getElementById("chatUserName");
const msgInput = document.getElementById("msgInput");
let currentUser = "";

users.forEach((user) => {
  const li = document.createElement("li");
  li.innerHTML = `<i class="fas fa-user-circle"></i> ${user}`;
  li.onclick = () => loadChat(user);
  userList.appendChild(li);
});

function loadChat(user) {
  currentUser = user;
  chatUserName.textContent = user;
  chatMessages.innerHTML = "";
  messages[user].forEach((msg, index) => {
    addMessage(msg, index % 2 === 0 ? "left" : "right");
  });
}

function addMessage(text, side = "right") {
  const msg = document.createElement("div");
  msg.className = `message-bubble ${side}`;
  msg.textContent = text;
  chatMessages.appendChild(msg);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

document.getElementById("sendBtn").onclick = () => {
  const text = msgInput.value.trim();
  if (text !== "" && currentUser) {
    addMessage(text, "right");
    msgInput.value = "";
  }
};
