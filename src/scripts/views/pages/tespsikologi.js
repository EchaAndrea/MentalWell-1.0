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
      confirmButtonText: "OK",
    });
    return;
  }

  if (!usia || usia < 1 || usia > 120) {
    Swal.fire({
      title: "Perhatian!",
      text: "Mohon masukkan usia yang valid (1-120 tahun).",
      icon: "warning",
      confirmButtonText: "OK",
    });
    return;
  }

  if (!gender) {
    Swal.fire({
      title: "Perhatian!",
      text: "Mohon pilih jenis kelamin Anda.",
      icon: "warning",
      confirmButtonText: "OK",
    });
    return;
  }

  // Simpan data user
  window.userData = { nama, usia, gender };

  // Ganti konten halaman dengan halaman pertanyaan
  showQuestionsPage();
}

function showQuestionsPage() {
  const main = document.querySelector("main");
  main.innerHTML = `
    <div class="container-fluid py-5" style="margin-top: 80px">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-12 col-md-10 col-lg-8">
            <div class="card shadow-sm border-0" style="border-radius: 20px">
              <div class="card-body p-4 p-lg-5">
                <div class="d-flex justify-content-between align-items-center mb-4">
                  <button class="btn btn-outline-secondary rounded-pill px-3 py-2" onclick="goBackToForm()" style="font-size: 14px">
                    ← Kembali
                  </button>
                  <h5 class="fw-bold mb-0">Pertanyaan</h5>
                  <div style="width: 80px"></div>
                </div>
                <form id="quiz-form"></form>
                <div class="text-center mt-4">
                  <button class="btn btn-primary rounded-pill px-5 py-2 fs-5 fw-bold" onclick="showResult()" style="height: 50px">
                    Cek Hasil
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Generate pertanyaan
  const form = document.getElementById("quiz-form");
  form.innerHTML = "";

  questions.forEach((q, i) => {
    const group = document.createElement("div");
    group.className = "mb-4 pb-3 border-bottom";

    const questionText = document.createElement("p");
    questionText.className = "fw-bold mb-3";
    questionText.innerText = `${i + 1}. ${q}`;
    group.appendChild(questionText);

    const optionsContainer = document.createElement("div");
    optionsContainer.className = "d-flex gap-3";

    ["Ya", "Tidak"].forEach((val) => {
      const label = document.createElement("label");
      label.className =
        "btn btn-outline-primary rounded-pill px-4 py-2 option-button";
      label.style.cursor = "pointer";

      const input = document.createElement("input");
      input.type = "radio";
      input.name = `question${i}`;
      input.value = val;
      input.style.display = "none";

      input.addEventListener("change", () => {
        group.querySelectorAll(".option-button").forEach((lbl) => {
          lbl.classList.remove("btn-primary");
          lbl.classList.add("btn-outline-primary");
        });
        label.classList.remove("btn-outline-primary");
        label.classList.add("btn-primary");
      });

      label.appendChild(input);
      label.appendChild(document.createTextNode(val));
      optionsContainer.appendChild(label);
    });

    group.appendChild(optionsContainer);
    form.appendChild(group);
  });

  window.scrollTo(0, 0);
}

function goBackToForm() {
  const main = document.querySelector("main");
  main.innerHTML = `
    <div class="container-fluid py-5" style="margin-top: 80px">
      <div class="d-flex flex-column align-items-center justify-content-center" style="min-height: 80vh">
        <div class="row justify-content-center w-100">
          <div class="col-12 col-md-10 col-lg-8">
            <div class="row align-items-center">
              <div class="col-12 col-lg-6 text-center mb-4 mb-lg-0">
                <img src="/src/public/tespsikologi/mediasi.png" alt="Tes Psikologi" class="img-fluid" style="max-width: 400px" />
              </div>
              <div class="col-12 col-lg-6">
                <div class="card shadow-sm border-0" style="border-radius: 20px">
                  <div class="card-body p-4">
                    <h4 class="fw-bold mb-3 text-center">Tes Psikologi</h4>
                    <p class="text-center text-muted mb-4">
                      Tes ini digunakan untuk menilai kondisi emosional dan mental seseorang, termasuk seberapa tinggi tingkat stres yang dialami. Memahami tingkat stres dapat membantumu menemukan cara yang lebih efektif untuk mengatasinya. Yuk, coba tes ini dan pahami lebih dalam keadaan psikologismu!
                    </p>
                    <form>
                      <div class="mb-3">
                        <label for="nama" class="form-label fw-bold">Nama Lengkap</label>
                        <input type="text" id="nama" class="form-control" placeholder="Nama Lengkap" style="border-radius: 50px; height: 50px" value="${
                          window.userData ? window.userData.nama : ""
                        }" />
                      </div>
                      <div class="mb-3">
                        <label for="usia" class="form-label fw-bold">Usia</label>
                        <input type="number" id="usia" class="form-control" placeholder="Usia" style="border-radius: 50px; height: 50px" value="${
                          window.userData ? window.userData.usia : ""
                        }" />
                      </div>
                      <div class="mb-3">
                        <label for="gender" class="form-label fw-bold">Jenis Kelamin</label>
                        <select id="gender" class="form-select" style="border-radius: 50px; height: 50px">
                          <option value="">Jenis Kelamin</option>
                          <option value="Laki-laki" ${
                            window.userData &&
                            window.userData.gender === "Laki-laki"
                              ? "selected"
                              : ""
                          }>Laki-laki</option>
                          <option value="Perempuan" ${
                            window.userData &&
                            window.userData.gender === "Perempuan"
                              ? "selected"
                              : ""
                          }>Perempuan</option>
                        </select>
                      </div>
                      <button type="button" class="btn btn-primary w-100 rounded-pill py-2 fs-5 fw-bold" onclick="startTest()" style="height: 50px">
                        Selanjutnya
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  window.scrollTo(0, 0);
}

function showResult() {
  const answers = [];

  for (let i = 0; i < questions.length; i++) {
    const selected = document.querySelector(
      `input[name="question${i}"]:checked`
    );
    answers.push(selected ? selected.value : null);
  }

  if (answers.includes(null)) {
    Swal.fire({
      title: "Perhatian!",
      text: "Mohon jawab semua pertanyaan terlebih dahulu.",
      icon: "warning",
      confirmButtonText: "OK",
    });
    return;
  }

  // Hitung jawaban "Ya" untuk 1-20 (index 0 sampai 19)
  const ya1to20 = answers
    .slice(0, 20)
    .filter((ans) => ans.toLowerCase() === "ya").length;

  // Hitung jawaban "Ya" untuk 21-29 (index 20 sampai 28)
  const ya21to29 = answers
    .slice(20, 29)
    .filter((ans) => ans.toLowerCase() === "ya").length;

  let result = "";

  if (ya1to20 >= 8 || ya21to29 >= 1) {
    result =
      "Ditemukan gejala yang memerlukan perhatian lebih lanjut. Disarankan untuk menghubungi profesional kesehatan mental.";
  } else {
    result =
      "Tidak ditemukan indikasi yang signifikan, namun tetap jaga kesehatan mental dan emosional Anda.";
  }

  // Simpan hasil
  window.testResult = result;

  // Tampilkan halaman hasil
  showResultsPage();
}

function showResultsPage() {
  const main = document.querySelector("main");
  main.innerHTML = `
    <div class="container-fluid py-5" style="margin-top: 80px">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-12 col-md-10 col-lg-8">
            <div class="card shadow-sm border-0" style="border-radius: 20px">
              <div class="card-body p-4 p-lg-5 text-center">
                <div class="d-flex justify-content-between align-items-center mb-4">
                  <button class="btn btn-outline-secondary rounded-pill px-3 py-2" onclick="showQuestionsPage()" style="font-size: 14px">
                    ← Kembali
                  </button>
                  <h4 class="fw-bold mb-0">Hasil Tes Psikologi</h4>
                  <div style="width: 80px"></div>
                </div>
                <div class="mb-4">
                  <img src="/src/public/tespsikologi/growth.png" alt="Hasil Tes" class="img-fluid mb-4" style="max-width: 250px" />
                </div>
                <p class="text-muted mb-4">Instrumen SRQ-29</p>
                <div class="bg-light p-4 rounded-4 mb-4">
                  <p class="fw-semibold text-dark mb-0">${window.testResult}</p>
                </div>
                <div class="d-flex gap-3 justify-content-center">
                  <button class="btn btn-outline-primary rounded-pill px-4 py-2" onclick="resetTest()" style="height: 50px">
                    Tes Ulang
                  </button>
                  <a href="/src/templates/listpsikolog.html" class="btn btn-primary rounded-pill px-5 py-2 fs-5 fw-bold" style="height: 50px">Cari Bantuan</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  window.scrollTo(0, 0);
}

function resetTest() {
  window.userData = null;
  window.testResult = null;
  goBackToForm();
}

// Fungsi untuk kembali ke halaman pertama
function goToPage1() {
  showPage("page1");
}

// Fungsi untuk kembali ke halaman pertanyaan
function goToPage2() {
  showPage("page2");
}

// Fungsi untuk reset test
function resetTest() {
  document.getElementById("nama").value = "";
  document.getElementById("usia").value = "";
  document.getElementById("gender").value = "";
  document.getElementById("quiz-form").innerHTML = "";
  document.getElementById("result-text").textContent = "";
  showPage("page1");
}
