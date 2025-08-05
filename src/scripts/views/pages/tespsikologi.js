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

  // Hitung jawaban "Ya" berdasarkan kelompok sesuai interpretasi SRQ-29
  const ya1to20 = answers.slice(0, 20).filter((a) => a === "Ya").length; // No 1-20 (Gejala neurosis - cut off 5-7)
  const ya21 = answers[20] === "Ya" ? 1 : 0; // No 21 (Penggunaan zat psikoaktif)
  const ya22to24 = answers.slice(21, 24).filter((a) => a === "Ya").length; // No 22-24 (Gejala psikotik - 1 jawaban Ya = masalah serius)
  const ya25to29 = answers.slice(24).filter((a) => a === "Ya").length; // No 25-29 (Gejala PTSD - 1 jawaban Ya = indikasi PTSD)

  // Tentukan hasil berdasarkan interpretasi SRQ-29
  let result = "";
  let hasProblems = false;
  let indications = [];

  // Analisis berdasarkan interpretasi SRQ-29:
  // a. Tidak terdapat nilai cut off universal
  // b. 5-7 jawaban YA pada no 1-20 mengindikasikan masalah psikologis
  // c. No 21 mengindikasikan penggunaan zat psikoaktif
  // d. 1 jawaban YA dari no 22-24 mengindikasikan masalah serius (psikotik)
  // e. 1 jawaban YA dari no 25-29 mengindikasikan gejala PTSD
  if (ya1to20 >= 5) {
    hasProblems = true;
    if (ya1to20 >= 7) {
      indications.push(
        "Indikasi kuat adanya masalah psikologis (gejala neurosis) - Skor: " +
          ya1to20 +
          "/20"
      );
    } else {
      indications.push(
        "Indikasi adanya masalah psikologis (gejala neurosis) - Skor: " +
          ya1to20 +
          "/20"
      );
    }
  }

  if (ya21 >= 1) {
    hasProblems = true;
    indications.push("Terdeteksi penggunaan zat psikoaktif/alkohol berlebihan");
  }

  if (ya22to24 >= 1) {
    hasProblems = true;
    indications.push("Terdeteksi gejala psikotik");
  }

  if (ya25to29 >= 1) {
    hasProblems = true;
    indications.push(
      "Terdeteksi gejala PTSD (Post Traumatic Stress Disorder) - Skor: " +
        ya25to29 +
        "/5"
    );
  }

  // Buat hasil berdasarkan temuan
  let resultData = {
    type: "",
    indications: indications,
    score: ya1to20,
  };

  if (hasProblems) {
    resultData.type = "problems";
  } else {
    if (ya1to20 >= 1 && ya1to20 < 5) {
      resultData.type = "mild";
    } else {
      resultData.type = "good";
    }
  }

  displayResult(resultData);
  showPage("page3");
}

// Tampilkan hasil tes
function displayResult(resultData) {
  const resultElement = document.getElementById("result-text");

  let resultText = "";

  if (resultData.type === "good") {
    resultText = `Selamat ${window.userData.nama}! Berdasarkan hasil tes SRQ-29, kondisi kesehatan mental Anda saat ini tergolong baik. Skor Anda ${resultData.score}/20 menunjukkan tidak ada indikasi masalah psikologis yang signifikan.`;
  } else if (resultData.type === "mild") {
    resultText = `Halo ${window.userData.nama}, hasil tes menunjukkan ada beberapa gejala ringan yang perlu diperhatikan. Skor Anda ${resultData.score}/20 masih dalam batas normal namun sebaiknya tetap menjaga kesehatan mental dengan baik.`;
  } else if (resultData.type === "problems") {
    resultText = `Halo ${window.userData.nama}, hasil tes menunjukkan adanya beberapa indikasi yang perlu mendapat perhatian lebih:\n\n`;

    if (resultData.indications.length > 0) {
      resultData.indications.forEach((indication, index) => {
        resultText += `• ${indication}\n`;
      });
    }

    resultText +=
      "\nKami sangat menyarankan Anda untuk berkonsultasi dengan profesional kesehatan mental untuk evaluasi dan bantuan lebih lanjut.";
  }

  // Tambahkan disclaimer medis yang lebih jelas
  resultText +=
    "\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n⚠️ PENTING UNTUK DIINGAT:\nIni merupakan penilaian mandiri dan bukan merupakan diagnosis medis maupun pengganti pemeriksaan profesional, sehingga diperlukan konsultasi dengan ahli kesehatan mental untuk evaluasi yang lebih komprehensif.";

  resultElement.innerHTML = resultText.replace(/\n/g, "<br>");
  resultElement.style.textAlign = "left";
  resultElement.style.lineHeight = "1.6";
}

// Tampilkan halaman awal saat pertama kali load
document.addEventListener("DOMContentLoaded", () => showPage("page1"));
