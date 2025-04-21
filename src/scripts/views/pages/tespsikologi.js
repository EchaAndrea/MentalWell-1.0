document.addEventListener('DOMContentLoaded', () => {
    const formStart = document.getElementById('form-start');
    const formQuestions = document.getElementById('form-questions');
    const formResult = document.getElementById('form-result');
    const btnStart = document.getElementById('btn-start');
    const btnCheckResult = document.getElementById('btn-check-result');
    const resultText = document.getElementById('result-text');

    if (btnStart) {
        btnStart.addEventListener('click', () => {
        formStart.style.display = 'none';
        formQuestions.style.display = 'block';
    });
    }

    if (btnCheckResult) {
        btnCheckResult.addEventListener('click', () => {
        // Hitung skor berdasarkan input radio yang dipilih
        let score = 0;
        const radios = document.querySelectorAll('input[type="radio"]:checked');
        radios.forEach(radio => {
        score += parseInt(radio.value);
        });

        // Tentukan level berdasarkan skor
        let level = '';
        if (score <= 15) level = 'Rendah';
        else if (score <= 30) level = 'Sedang';
        else level = 'Tinggi';

        resultText.innerText = `"${level}"`;

        formQuestions.style.display = 'none';
        formResult.style.display = 'block';
        });
    }
});
