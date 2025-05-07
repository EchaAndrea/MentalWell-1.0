const dataKonseling = [
    { nama: "Andi", tanggal: "01-05-2025", jam: "10:00", jenis: "Chat", status: "Lunas" },
    { nama: "Budi", tanggal: "02-05-2025", jam: "14:00", jenis: "Chat", status: "Belum Lunas" },
    { nama: "Citra", tanggal: "03-05-2025", jam: "09:00", jenis: "Chat", status: "Lunas" },
    // Tambahkan data lainnya jika perlu
  ];
  
  let filteredData = [...dataKonseling];
  let rowsPerPage = 10;
  let currentPage = 1;
  
  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("filterKategori").addEventListener("change", handleFilter);
    renderTable();
  });
  
  // Filter berdasarkan status bayar
  function handleFilter() {
    const kategori = document.getElementById("filterKategori").value;
    filteredData = kategori === "semua"
      ? [...dataKonseling]
      : dataKonseling.filter(item => {
          const statusNormalized = item.status.trim().toLowerCase();
          return (
            (kategori === "lunas" && statusNormalized === "lunas") ||
            (kategori === "belum-lunas" && statusNormalized === "belum lunas")
          );
        });
    currentPage = 1;
    renderTable();
  }
  
  // Pencarian nama
  function handleSearch() {
    const keyword = document.getElementById("searchInput").value.toLowerCase();
    filteredData = dataKonseling.filter(item =>
      item.nama.toLowerCase().includes(keyword)
    );
    currentPage = 1;
    renderTable();
  }
  
  // Reset semua filter dan pencarian
  function resetTable() {
    document.getElementById("searchInput").value = "";
    document.getElementById("filterKategori").value = "semua";
    filteredData = [...dataKonseling];
    currentPage = 1;
    renderTable();
  }
  
  // Ganti jumlah baris per halaman
  function updateRowsPerPage() {
    const value = document.getElementById("rowsPerPage").value;
    rowsPerPage = value === "all" ? filteredData.length : parseInt(value);
    currentPage = 1;
    renderTable();
  }
  
  // Ganti halaman
  function changePage(page) {
    currentPage = page;
    renderTable();
  }
  
  // Render tabel
  function renderTable() {
    const tbody = document.getElementById("psikologTableBody");
    tbody.innerHTML = "";
  
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const pageData = filteredData.slice(start, end);
  
    for (const item of pageData) {
      tbody.innerHTML += `
        <tr>
          <td>${item.nama}</td>
          <td>${item.tanggal}</td>
          <td>${item.jam}</td>
          <td>${item.jenis}</td>
          <td>${item.status}</td>
          <td>
            <a href="/admin/dashboard/admin-detaildashboard.html" class="btn btn-sm btn-secondary">
              <img src="/src/public/admin/edit.png" width="13" alt="Detail">
            </a>
          </td>
        </tr>
      `;
    }
  
    renderPagination();
  }
  
  // Render pagination
  function renderPagination() {
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    const pagination = document.getElementById("paginationContainer");
    pagination.innerHTML = "";
  
    pagination.innerHTML += `<li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
      <a class="page-link" href="#" onclick="changePage(${currentPage - 1})">Sebelumnya</a></li>`;
  
    for (let i = 1; i <= totalPages; i++) {
      pagination.innerHTML += `<li class="page-item ${i === currentPage ? 'active' : ''}">
        <a class="page-link" href="#" onclick="changePage(${i})">${i}</a></li>`;
    }
  
    pagination.innerHTML += `<li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
      <a class="page-link" href="#" onclick="changePage(${currentPage + 1})">Selanjutnya</a></li>`;
  }
  
  // Agar bisa dipanggil dari HTML
  window.handleSearch = handleSearch;
  window.resetTable = resetTable;
  window.updateRowsPerPage = updateRowsPerPage;
  window.changePage = changePage;
  