function hitungHasil() {
  const q1 = document.querySelector('input[name="q1"]:checked');
  const q2 = document.querySelector('input[name="q2"]:checked');
  const q3 = document.querySelector('input[name="q3"]:checked');
  const q4 = document.querySelector('input[name="q4"]:checked');
  const q5 = document.querySelector('input[name="q5"]:checked');
  const q6 = document.querySelector('input[name="q6"]:checked');
  const q7 = document.querySelector('input[name="q7"]:checked');
  const q8 = document.querySelector('input[name="q8"]:checked');
  const q9 = document.querySelector('input[name="q9"]:checked');
  const q10 = document.querySelector('input[name="q10"]:checked');

  if (!q1 || !q2 || !q3 || !q4 || !q5|| !q6 || !q7 || !q8 || !q9 || !q10) {
    Swal.fire({
      icon: "warning",
      title: "Oops...",
      text: "Semua pertanyaan harus dijawab!",
    });
    return;
  }

  const total = parseInt(q1.value) + parseInt(q2.value) + parseInt(q3.value);

  localStorage.setItem("score", total);
  window.location.href = "tespsikologi-hasil.html";
}

window.addEventListener("DOMContentLoaded", () => {
  const score = localStorage.getItem("score");
  const levelHasil = document.getElementById("levelHasil");
  const deskripsiHasil = document.getElementById("deskripsiHasil");

  if (score !== null && levelHasil && deskripsiHasil) {
    let level = "";
    let deskripsi = "";

    const totalScore = parseInt(score);

    if (totalScore <= 5) {
      level = "Rendah";
      deskripsi =
        "Berdasarkan hasil screening kesehatan mental, saat ini kondisimu tergolong stabil. Jaga terus kesehatan mental kamu ya.";
    } else if (totalScore <= 10) {
      level = "Sedang";
      deskripsi =
        "Kamu mengalami tingkat stres yang sedang. Perlu memperhatikan kesehatan mental dan menjaga keseimbangan hidup.";
    } else {
      level = "Tinggi";
      deskripsi =
        "Kamu mengalami tingkat stres yang tinggi. Disarankan untuk mencari bantuan profesional.";
    }

    levelHasil.innerText = `"${level}"`;
    deskripsiHasil.innerText = deskripsi;
  }
});
