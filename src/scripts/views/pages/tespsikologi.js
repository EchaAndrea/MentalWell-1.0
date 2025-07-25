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
  "Apakah anda sulit menghayati atau mengeluarkan perasaan?",
];

let questionsGenerated = false;

// Pindah antar halaman
function showPage(pageId) {
  const pages = ["page1", "page2", "page3"];
  pages.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.style.display = id === pageId ? "block" : "none";
  });
  window.scrollTo(0, 0);
}

// Mulai tes
function startTest() {
  const nama = document.getElementById("nama").value.trim();
  const usia = document.getElementById("usia").value.trim();
  const gender = document.getElementById("gender").value;

  if (!nama || !usia || !gender) {
    Swal.fire("Perhatian!", "Mohon lengkapi semua isian.", "warning");
    return;
  }

  window.userData = { nama, usia, gender };
  showPage("page2");
  if (!questionsGenerated) generateQuestions();
}

// Generate pertanyaan 
function generateQuestions() {
  const form = document.getElementById("quiz-form");
  form.innerHTML = "";

  questions.forEach((question, i) => {
    const block = document.createElement("div");
    block.className = "question-block";

    const qText = document.createElement("p");
    qText.className = "fw-bold";
    qText.innerText = `${i + 1}. ${question}`;
    block.appendChild(qText);

    const options = document.createElement("div");
    options.className = "option-container";

    ["Ya", "Tidak"].forEach((val) => {
      const label = document.createElement("label");
      const input = document.createElement("input");
      input.type = "radio";
      input.name = `question${i}`;
      input.value = val;
      input.className = "me-2";

      const span = document.createElement("span");
      span.innerText = val;

      label.appendChild(input);
      label.appendChild(span);
      options.appendChild(label);
    });

    block.appendChild(options);
    form.appendChild(block);
  });

  questionsGenerated = true;
}

// Cek hasil akhir tes
function showResult() {
  const answers = [];

  for (let i = 0; i < questions.length; i++) {
    const selected = document.querySelector(
      `input[name="question${i}"]:checked`
    );
    answers.push(selected ? selected.value : null);
  }

  if (answers.includes(null)) {
    Swal.fire("Perhatian!", "Mohon jawab semua pertanyaan.", "warning");
    return;
  }

  // Hitung jawaban "Ya" berdasarkan kelompok
  const ya1to20 = answers.slice(0, 20).filter((a) => a === "Ya").length; // No 1-20 (GME)
  const ya21 = answers[20] === "Ya" ? 1 : 0; // No 21 (Penggunaan zat)
  const ya22to24 = answers.slice(21, 24).filter((a) => a === "Ya").length; // No 22-24 (Psikotik)
  const ya25to29 = answers.slice(24).filter((a) => a === "Ya").length; // No 25-29 (PTSD)

  // Tentukan hasil berdasarkan aturan SRQ-29
  let result = "";

  if (ya1to20 >= 5 || ya21 >= 1 || ya22to24 >= 1 || ya25to29 >= 1) {
    result =
      "Berdasarkan hasil tes, ditemukan beberapa indikator yang memerlukan perhatian lebih lanjut dari profesional kesehatan mental.";
  } else {
    result =
      "Hasil tes menunjukkan kondisi yang relatif baik. Namun, tetap penting untuk menjaga kesehatan mental.";
  }

  document.getElementById("result-text").innerText = result;
  showPage("page3");
}

// Tampilkan halaman awal saat pertama kali load
document.addEventListener("DOMContentLoaded", () => showPage("page1"));
