const psikologData = [
  { judul: "Kesehatan Mental Anak Remaja Saat Ini", kategori: "Kesehatan Mental", tanggal: "06 Juni 2025", dibuatoleh: "Admin" },
  { judul: "Psikologi Remaja Terhadap Pertumbuhan Anak", kategori: "Psikologi", tanggal: "08 Juni 2025", dibuatoleh: "Admin" },
  { judul: "Kesehatan Mental Anak Remaja Saat Ini", kategori: "Kesehatan Mental", tanggal: "06 Juni 2025", dibuatoleh: "Admin" },
  { judul: "Psikologi Remaja Terhadap Pertumbuhan Anak", kategori: "Psikologi", tanggal: "08 Juni 2025", dibuatoleh: "Admin" },
  { judul: "Kesehatan Mental Anak Remaja Saat Ini", kategori: "Kesehatan Mental", tanggal: "06 Juni 2025", dibuatoleh: "Admin" },
  { judul: "Psikologi Remaja Terhadap Pertumbuhan Anak", kategori: "Psikologi", tanggal: "08 Juni 2025", dibuatoleh: "Admin" },
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
        <td><input type="checkbox" class="row-checkbox" data-judul="${p.judul}"></td>
        <td>${p.judul}</td>
        <td>${p.kategori}</td>
        <td>${p.tanggal}</td>
        <td>${p.dibuatoleh}</td>
        <td>
          <a href="/src/templates/admin-lihatartikel.html?judul=${encodeURIComponent(p.judul)}" class="btn btn-sm btn-secondary">
            <img src="/src/public/admin/lihat.png" width="13">
          </a>
          <a href="/src/templates/admin-editartikel.html?judul=${encodeURIComponent(p.judul)}" class="btn btn-sm btn-info">
            <img src="/src/public/admin/edit.png" width="13">
          </a>
          <button class="btn btn-sm btn-danger" onclick="hapusItem('${p.judul}')">
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

  const prevDisabled = currentPage === 1 ? "disabled" : "";
  pagination.innerHTML += `
    <li class="page-item ${prevDisabled}">
      <a class="page-link" href="#" onclick="changePage(${currentPage - 1})">Sebelumnya</a>
    </li>
  `;

  for (let i = 1; i <= totalPages; i++) {
    const active = currentPage === i ? "active" : "";
    pagination.innerHTML += `
      <li class="page-item ${active}">
        <a class="page-link" href="#" onclick="changePage(${i})">${i}</a>
      </li>
    `;
  }

  const nextDisabled = currentPage === totalPages ? "disabled" : "";
  pagination.innerHTML += `
    <li class="page-item ${nextDisabled}">
      <a class="page-link" href="#" onclick="changePage(${currentPage + 1})">Selanjutnya</a>
    </li>
  `;
}

function hapusItem(judul) {
  const index = psikologData.findIndex(p => p.judul === judul);
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
    const judul = cb.getAttribute("data-judul");
    const index = psikologData.findIndex(p => p.judul === judul);
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
