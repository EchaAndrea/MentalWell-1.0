const psikologData = [
  { id: "01", kategori: "Kesehatan Mental", judul: "Kesehatan Mental Anak", tanggal: "06 Juni 2025", dibuatoleh: "Admin" },
  { id: "02", kategori: "Psikologi", judul: "Psikolog Remaja", tanggal: "08 Juni 2025", dibuatoleh: "Admin" },
  { id: "03", kategori: "Kesehatan Mental", judul: "Kesehatan Mental Anak", tanggal: "06 Juni 2025", dibuatoleh: "Admin" },
  { id: "04", kategori: "Psikologi", judul: "Psikolog Remaja", tanggal: "08 Juni 2025", dibuatoleh: "Admin" },
    { id: "05", kategori: "Kesehatan Mental", judul: "Kesehatan Mental Anak", tanggal: "06 Juni 2025", dibuatoleh: "Admin" },
  { id: "06", kategori: "Psikologi", judul: "Psikolog Remaja", tanggal: "08 Juni 2025", dibuatoleh: "Admin" },
  { id: "07", kategori: "Kesehatan Mental", judul: "Kesehatan Mental Anak", tanggal: "06 Juni 2025", dibuatoleh: "Admin" },
  { id: "08", kategori: "Psikologi", judul: "Psikolog Remaja", tanggal: "08 Juni 2025", dibuatoleh: "Admin" },
  { id: "09", kategori: "Kesehatan Mental", judul: "Kesehatan Mental Anak", tanggal: "06 Juni 2025", dibuatoleh: "Admin" },
    { id: "10", kategori: "Psikologi", judul: "Psikolog Remaja", tanggal: "08 Juni 2025", dibuatoleh: "Admin" },
  { id: "11", kategori: "Kesehatan Mental", judul: "Kesehatan Mental Anak", tanggal: "06 Juni 2025", dibuatoleh: "Admin" },
  { id: "12", kategori: "Psikologi", judul: "Psikolog Remaja", tanggal: "08 Juni 2025", dibuatoleh: "Admin" },
  // Tambahkan data lain sesuai kebutuhan
];

let filteredData = [...psikologData];
let rowsPerPage = 10;
let currentPage = 1;

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("filterKategori").addEventListener("change", handleFilter);
  document.getElementById("selectAll").addEventListener("change", function () {
    document.querySelectorAll(".row-checkbox").forEach(cb => cb.checked = this.checked);
  });
  document.getElementById("rowsPerPage").addEventListener("change", updateRowsPerPage);
  renderTable();
});

function handleFilter() {
  const kategori = document.getElementById("filterKategori").value;
  filteredData = kategori === "semua"
    ? [...psikologData]
    : psikologData.filter(item => item.kategori === kategori);
  currentPage = 1;
  renderTable();
}

function handleSearch() {
  const keyword = document.getElementById("searchInput").value.toLowerCase();
  filteredData = psikologData.filter(p =>
    p.kategori.toLowerCase().includes(keyword) ||
    p.judul.toLowerCase().includes(keyword) ||
    p.dibuatoleh.toLowerCase().includes(keyword)
  );
  currentPage = 1;
  renderTable();
}

function resetTable() {
  document.getElementById("searchInput").value = "";
  document.getElementById("filterKategori").value = "semua";
  filteredData = [...psikologData];
  currentPage = 1;
  renderTable();
}

function updateRowsPerPage() {
  const value = document.getElementById("rowsPerPage").value;
  rowsPerPage = value === "all" ? filteredData.length : parseInt(value);
  currentPage = 1;
  renderTable();
}

function changePage(page) {
  currentPage = page;
  renderTable();
}

function renderTable() {
  const tbody = document.getElementById("psikologTableBody");
  tbody.innerHTML = "";

  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const pageData = filteredData.slice(start, end);

  for (const p of pageData) {
    tbody.innerHTML += `
      <tr>
        <td><input type="checkbox" class="row-checkbox" data-id="${p.id}"></td>
        <td>${p.id}</td>
        <td>${p.kategori}</td>
        <td>${p.judul}</td>
        <td>${p.tanggal}</td>
        <td>${p.dibuatoleh}</td>
        <td>
          <a href="/src/templates/admin-editartikel.html?id=${p.id}" class="btn btn-sm btn-secondary">
            <img src="/src/public/admin/lihat.png" width="13">
          </a>
          <a href="/src/templates/admin-editartikel.html?id=${p.id}" class="btn btn-sm btn-info">
            <img src="/src/public/admin/edit.png" width="13">
          </a>
          <button class="btn btn-sm btn-danger" onclick="hapusItem('${p.id}')">
            <img src="/src/public/admin/hapus.png" width="13">
          </button>
        </td>
      </tr>`;
  }

  renderPagination();
}

function renderPagination() {
  const pagination = document.getElementById("pagination");
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  pagination.innerHTML = "";

  // Tombol "Sebelumnya"
  const prevDisabled = currentPage === 1 ? "disabled" : "";
  pagination.innerHTML += `
    <li class="page-item ${prevDisabled}">
      <a class="page-link" href="#" onclick="changePage(${currentPage - 1})">Sebelumnya</a>
    </li>
  `;

  // Nomor halaman
  for (let i = 1; i <= totalPages; i++) {
    const active = currentPage === i ? "active" : "";
    pagination.innerHTML += `
      <li class="page-item ${active}">
        <a class="page-link" href="#" onclick="changePage(${i})">${i}</a>
      </li>
    `;
  }

  // Tombol "Selanjutnya"
  const nextDisabled = currentPage === totalPages ? "disabled" : "";
  pagination.innerHTML += `
    <li class="page-item ${nextDisabled}">
      <a class="page-link" href="#" onclick="changePage(${currentPage + 1})">Selanjutnya</a>
    </li>
  `;
}


function hapusItem(id) {
  const index = psikologData.findIndex(p => p.id === id);
  if (index !== -1) {
    psikologData.splice(index, 1);
    filteredData = [...psikologData];
    renderTable();
  }
}

function hapusYangDipilih() {
  const checkboxes = document.querySelectorAll(".row-checkbox:checked");
  if (checkboxes.length === 0) return alert("Pilih data terlebih dahulu.");

  checkboxes.forEach(cb => {
    const id = cb.getAttribute("data-id");
    const index = psikologData.findIndex(p => p.id === id);
    if (index !== -1) psikologData.splice(index, 1);
  });

  filteredData = [...psikologData];
  renderTable();
}

// Agar bisa dipanggil dari HTML
window.handleSearch = handleSearch;
window.resetTable = resetTable;
window.updateRowsPerPage = updateRowsPerPage;
window.changePage = changePage;
window.hapusItem = hapusItem;
window.hapusYangDipilih = hapusYangDipilih;
