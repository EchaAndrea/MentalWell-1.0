document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const psikologId = urlParams.get('id');
  const adminToken = localStorage.getItem("admin_token");
  if (!psikologId) return;

  const form = document.getElementById('formArtikel');
  if (!form) return;

  // Fetch detail psikolog dari backend
  let psikologData;
  try {
    const res = await fetch(`https://mentalwell10-api-production.up.railway.app/admin/psychologist/${psikologId}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const json = await res.json();
    if (json.status === "success") {
      psikologData = json.data;
    } else {
      throw new Error(json.message);
    }
  } catch (e) {
    alert("Gagal memuat detail psikolog");
    return;
  }

  // Isi form sesuai data dari backend
  form.nama.value = psikologData.name || "";
  form.email.value = psikologData.email || "";
  form.password.value = "********";
  form.nohp.value = psikologData.phone_number || "";
  form.tanggallahir.value = psikologData.birthdate || "";
  form.jeniskelamin.value = psikologData.gender || "";
  form.pengalaman.value = psikologData.experience || "";
  form.bio.value = psikologData.bio || "";
  document.getElementById('namaFile').value = psikologData.profile_image || "";

  // Checkbox keahlian
  const semuaCheckbox = form.querySelectorAll('input[type="checkbox"][name="keahlian"]');
  const topicNames = (psikologData.topics || []).map(t => t.name.toLowerCase());
  semuaCheckbox.forEach(cb => {
    cb.checked = topicNames.includes(cb.value.toLowerCase());
    cb.disabled = true;
  });

  // Jadwal
  const jadwalContainer = document.getElementById('jadwalContainer');
  jadwalContainer.innerHTML = '';
  (psikologData.schedules || []).forEach(jadwalItem => {
    const row = document.createElement('div');
    row.classList.add('row', 'mb-2', 'align-items-center', 'jadwal-row');

    const colHari = document.createElement('div');
    colHari.classList.add('col-md-4');
    const selectHari = document.createElement('select');
    selectHari.name = "hari[]";
    selectHari.classList.add('form-select');
    selectHari.disabled = true;
    ["", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"].forEach(h => {
      const opt = document.createElement('option');
      opt.value = h;
      opt.textContent = h === "" ? "Pilih Hari" : h;
      if (h === jadwalItem.hari) opt.selected = true;
      selectHari.appendChild(opt);
    });
    colHari.appendChild(selectHari);

    const colJam = document.createElement('div');
    colJam.classList.add('col-md-6');
    const jamDiv = document.createElement('div');
    jamDiv.classList.add('d-flex');

    const inputJamMulai = document.createElement('input');
    inputJamMulai.type = "time";
    inputJamMulai.name = "jamMulai[]";
    inputJamMulai.classList.add('form-control', 'me-2');
    inputJamMulai.value = jadwalItem.jamMulai;
    inputJamMulai.disabled = true;

    const spanPisah = document.createElement('span');
    spanPisah.classList.add('mx-1', 'd-flex', 'align-items-center');
    spanPisah.textContent = "-";

    const inputJamSelesai = document.createElement('input');
    inputJamSelesai.type = "time";
    inputJamSelesai.name = "jamSelesai[]";
    inputJamSelesai.classList.add('form-control', 'ms-2');
    inputJamSelesai.value = jadwalItem.jamSelesai;
    inputJamSelesai.disabled = true;

    jamDiv.appendChild(inputJamMulai);
    jamDiv.appendChild(spanPisah);
    jamDiv.appendChild(inputJamSelesai);
    colJam.appendChild(jamDiv);

    const colTombol = document.createElement('div');
    colTombol.classList.add('col-md-2', 'd-flex', 'justify-content-start', 'gap-2');

    const btnTambah = document.createElement('button');
    btnTambah.type = 'button';
    btnTambah.classList.add('btn', 'btn-tambah', 'tambah-jadwal');
    btnTambah.disabled = true;
    btnTambah.innerHTML = '<i class="fas fa-plus" aria-hidden="true"></i>';

    const btnHapus = document.createElement('button');
    btnHapus.type = 'button';
    btnHapus.classList.add('btn', 'btn-danger', 'hapus-jadwal');
    btnHapus.disabled = true;
    btnHapus.innerHTML = '<i class="fas fa-trash-alt"></i>';

    colTombol.appendChild(btnTambah);
    colTombol.appendChild(btnHapus);

    row.appendChild(colHari);
    row.appendChild(colJam);
    row.appendChild(colTombol);
    jadwalContainer.appendChild(row);
  });

  // Disable semua field form kecuali tombol submit dan kembali
  const semuaElemenForm = form.querySelectorAll('input, select, textarea');
  semuaElemenForm.forEach(el => {
    el.disabled = true;
  });

  // File input
  const inputFile = form.querySelector('input[type="file"]');
  if (inputFile) inputFile.disabled = true;
});
