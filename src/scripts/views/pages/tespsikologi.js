function hitungHasil() {
  const q1 = document.querySelector('input[name="q1"]:checked');
  const q2 = document.querySelector('input[name="q2"]:checked');
  const q3 = document.querySelector('input[name="q3"]:checked');

  if (!q1 || !q2 || !q3) {
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
