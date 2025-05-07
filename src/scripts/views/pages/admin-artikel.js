const psikologData = [
  { id: "01", kategori: "Kesehatan Mental", judul: "Kesehatan Mental Anak", tanggal: "06 Juni 2025", dibuatoleh: "Admin" },
  { id: "02", kategori: "Psikologi", judul: "Psikolog Remaja", tanggal: "08 Juni 2025", dibuatoleh: "Admin" },
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
          <a href="/admin/artikel/lihat.html?id=${p.id}" class="btn btn-sm btn-secondary">
            <img src="/src/public/admin/lihat.png" width="13">
          </a>
          <a href="/admin/artikel/edit.html?id=${p.id}" class="btn btn-sm btn-info">
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

  if (totalPages <= 1) return;

  const createButton = (label, page, disabled = false, active = false) => {
    return `<button 
      ${disabled ? "disabled" : `onclick="changePage(${page})"`}
      class="${active ? "active" : ""}">
      ${label}
    </button>`;
  };

  pagination.innerHTML += createButton("sebelumnya", currentPage - 1, currentPage === 1);

  for (let i = 1; i <= totalPages; i++) {
    pagination.innerHTML += createButton(i, i, false, i === currentPage);
  }

  pagination.innerHTML += createButton("selanjutnya", currentPage + 1, currentPage === totalPages);
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
