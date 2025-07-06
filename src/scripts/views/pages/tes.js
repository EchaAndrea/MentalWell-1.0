const questions = [
  "Apakah anda sering menderita sakit kepala?",
  "Apakah anda tidak nafsu makan?",
  "Apakah anda sulit tidur?",
  "Apakah anda mudah takut?",
  "Apakah anda merasa tegang, cemas atau kuatir?",
  "Apakah tangan anda gemetar?",
  "Apakah pencernaan anda terganggu/ buruk?",
  "Apakah anda sulit untuk berpikir jernih?",
  "Apakah anda merasa tidak bahagia?",
  "Apakah anda menangis lebih sering?",
  "Apakah anda merasa sulit untuk menikmati kegiatan sehari-hari?",
  "Apakah anda sulit untuk mengambil keputusan?",
  "Apakah pekerjaan anda sehari-hari terganggu?",
  "Apakah anda tidak mampu melakukan hal-hal yang bermanfaat dalam hidup?",
  "Apakah anda kehilangan minat pada berbagai hal?",
  "Apakah anda merasa tidak berharga?",
  "Apakah anda mempunyai pikiran untuk mengakhiri hidup?",
  "Apakah anda merasa lelah sepanjang waktu?",
  "Apakah anda mengalami rasa tidak enak di perut?",
  "Apakah anda mudah lelah?",
  "Apakah anda lebih sering menggunakan alkohol/zat terlarang dari biasanya?",
  "Apakah anda merasa seseorang bermaksud mencelakai anda?",
  "Apakah anda merasa ada sesuatu yang mengganggu pikiran anda?",
  "Apakah anda mendengar suara-suara yang tidak didengar orang lain?",
  "Apakah anda mengalami mimpi bencana atau seakan bencana itu muncul kembali?",
  "Apakah anda menghindari berbagai kegiatan, tempat, orang, atau pikiran yang mengingatkan akan bencana tersebut?",
  "Apakah anda kurang tertarik terhadap teman-teman atau kegiatan sehari-hari?",
  "Apakah anda merasa sangat sedih apabila berada dalam situasi yang mengingatkan akan bencana tersebut?",
  "Apakah anda sulit menghayati atau mengeluarkan perasaan?"
];

function startTest() {
  // Validasi input form
  const nama = document.getElementById("nama").value.trim();
  const usia = document.getElementById("usia").value.trim();
  const gender = document.getElementById("gender").value;

  if (!nama) {
    Swal.fire({
      title: "Perhatian!",
      text: "Mohon masukkan nama lengkap Anda.",
      icon: "warning",
      confirmButtonText: "OK"
    });
    return;
  }

  if (!usia || usia < 1 || usia > 120) {
    Swal.fire({
      title: "Perhatian!",
      text: "Mohon masukkan usia yang valid (1-120 tahun).",
      icon: "warning",
      confirmButtonText: "OK"
    });
    return;
  }

  if (!gender) {
    Swal.fire({
      title: "Perhatian!",
      text: "Mohon pilih jenis kelamin Anda.",
      icon: "warning",
      confirmButtonText: "OK"
    });
    return;
  }

  document.getElementById("page1").style.display = "none";
  document.getElementById("page2").style.display = "block";

  const form = document.getElementById("quiz-form");
  form.innerHTML = "";

  questions.forEach((q, i) => {
    const group = document.createElement("div");
    group.className = "option-container";

    const questionText = document.createElement("p");
    questionText.style.fontWeight = "bold"; 
    questionText.style.marginBottom = "0.3rem";
    questionText.innerText = `${i + 1}. ${q}`;
    group.appendChild(questionText);

    ["Ya", "Tidak"].forEach((val) => {
      const label = document.createElement("label");
      label.className = "option-button";

      const input = document.createElement("input");
      input.type = "radio";
      input.name = `question${i}`;
      input.value = val;
      input.style.marginRight = "8px";

      input.addEventListener("change", () => {
        group.querySelectorAll(".option-button").forEach(lbl => lbl.classList.remove("active"));
        label.classList.add("active");
      });

      label.appendChild(input);
      label.appendChild(document.createTextNode(val));
      group.appendChild(label);
    });

    form.appendChild(group);
  });
}

function showResult() {
  const answers = [];

  for (let i = 0; i < questions.length; i++) {
    const selected = document.querySelector(`input[name="question${i}"]:checked`);
    answers.push(selected ? selected.value : null);
  }

  if (answers.includes(null)) {
    Swal.fire("Lengkapi semua jawaban terlebih dahulu.");
    return;
  }

  // Hitung jawaban "Ya" untuk 1-20 (index 0 sampai 19)
  const ya1to20 = answers.slice(0, 20).filter(ans => ans.toLowerCase() === "ya").length;

  // Hitung jawaban "Ya" untuk 21-29 (index 20 sampai 28)
  const ya21to29 = answers.slice(20, 29).filter(ans => ans.toLowerCase() === "ya").length;

  let result = "";

  if (ya1to20 >= 8 || ya21to29 >= 1) {
    result = "Ditemukan gejala yang memerlukan perhatian lebih lanjut. Disarankan untuk menghubungi profesional kesehatan mental.";
  } else {
    result = "Tidak ditemukan indikasi yang signifikan, namun tetap jaga kesehatan mental dan emosional Anda.";
  }

  document.getElementById("page2").style.display = "none";
  document.getElementById("page3").style.display = "block";
  document.getElementById("result-text").textContent = result;
}