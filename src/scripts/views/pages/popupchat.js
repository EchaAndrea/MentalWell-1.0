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
    fileUpload.addEventListener("change", async function () {
      if (this.files.length > 0) {
        addChatBubble(`📎 File dikirim: ${this.files[0].name}`, "right");
        scrollToBottom();

        // --- Tambahan: Kirim file ke backend ---
        try {
          // Ganti value berikut sesuai kebutuhan (atau ambil dari input/form)
          const psychologist_id =
            localStorage.getItem("active_psychologist_id") || 1;
          const occupation = "mahasiswa";
          const problem_description = "gangguan makan";
          const hope_after = "bisa memiliki pola makan yang baik";
          const payment_proof_file = this.files[0];

          const result = await createRealtimeCounseling({
            psychologist_id,
            occupation,
            problem_description,
            hope_after,
            payment_proof_file,
          });
          addChatBubble("✅ Bukti pembayaran berhasil dikirim!", "left");
          console.log(result);
        } catch (err) {
          addChatBubble("❌ Gagal mengirim bukti pembayaran.", "left");
        }
        // --- End tambahan ---
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
  const overlay = document.getElementById("chatOverlay");

  if (popup.style.display === "flex") {
    // Tutup popup: overlay hilang
    if (overlay) overlay.style.display = "none";
    popup.style.display = "none";
  } else {
    // Buka popup: overlay tampil
    if (overlay) overlay.style.display = "block";
    popup.style.display = "flex";
    if (chatBody && chatBody.children.length === 0) {
      addChatBubble("Halo, ada yang bisa saya bantu?", "left");
    }
  }
};

document.getElementById("chatOverlay")?.addEventListener("click", () => {
  window.toggleChat();
});

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

async function createRealtimeCounseling({
  psychologist_id,
  occupation,
  problem_description,
  hope_after,
  payment_proof_file,
}) {
  if (
    !psychologist_id ||
    !occupation ||
    !problem_description ||
    !hope_after ||
    !payment_proof_file
  ) {
    throw new Error("Semua field wajib diisi dan file harus dipilih.");
  }
  const url = `https://mentalwell10-api-production.up.railway.app/realtime/counseling/${psychologist_id}`;
  const formData = new FormData();
  formData.append("occupation", occupation);
  formData.append("problem_description", problem_description);
  formData.append("hope_after", hope_after);
  formData.append("payment_proof", payment_proof_file);

  try {
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gagal membuat counseling: ${errText}`);
    }
    return await response.json();
  } catch (err) {
    console.error("Error createRealtimeCounseling:", err);
    throw err;
  }
}
