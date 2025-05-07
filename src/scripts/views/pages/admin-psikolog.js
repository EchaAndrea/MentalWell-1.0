const psikologData = [
    { id: "01", username: "useranak", nama: "Psikolog Anak", email: "anak@example.com", kategori: "anak", aktif: true },
    { id: "02", username: "userremaja", nama: "Psikolog Remaja", email: "remaja@example.com", kategori: "remaja", aktif: true },
    // Tambah data lainnya sesuai kebutuhan
  ];
  
  let filteredData = [...psikologData];
  let rowsPerPage = 10;
  let currentPage = 1;
  
  document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("filterKategori").addEventListener("change", handleFilter);
    document.getElementById("selectAll").addEventListener("change", function () {
      document.querySelectorAll(".row-checkbox").forEach(cb => cb.checked = this.checked);
    });
  
    renderTable();
  });
  
  // Filter berdasarkan kategori
  function handleFilter() {
    const kategori = document.getElementById("filterKategori").value;
    filteredData = kategori === "semua"
      ? [...psikologData]
      : psikologData.filter(item => item.kategori === kategori);
    currentPage = 1;
    renderTable();
  }
  
  // Pencarian
  function handleSearch() {
    const keyword = document.getElementById("searchInput").value.toLowerCase();
    filteredData = psikologData.filter(p =>
      p.username.toLowerCase().includes(keyword) ||
      p.nama.toLowerCase().includes(keyword) ||
      p.email.toLowerCase().includes(keyword)
    );
    currentPage = 1;
    renderTable();
  }
  
  // Reset filter dan pencarian
  function resetTable() {
    document.getElementById("searchInput").value = "";
    document.getElementById("filterKategori").value = "semua";
    filteredData = [...psikologData];
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
  
    for (const p of pageData) {
      tbody.innerHTML += `
        <tr>
          <td><input type="checkbox" class="row-checkbox" data-id="${p.id}"></td>
          <td>${p.id}</td>
          <td>${p.username}</td>
          <td>${p.nama}</td>
          <td>${p.email}</td>
          <td>${p.aktif ? "Aktif" : "Nonaktif"}</td>
          <td>
            <a href="/admin/psikolog/lihat.html?id=${p.id}" class="btn btn-sm btn-secondary">
              <img src="/src/public/admin/lihat.png" width="13">
            </a>
            <a href="/admin/psikolog/edit.html?id=${p.id}" class="btn btn-sm btn-info">
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
  
  // Render pagination
  function renderPagination() {
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    const pagination = document.getElementById("paginationContainer");
    pagination.innerHTML = "";
  
    pagination.innerHTML += `<li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
      <a class="page-link" href="#" onclick="changePage(${currentPage - 1})">sebelumnya</a></li>`;
  
    for (let i = 1; i <= totalPages; i++) {
      pagination.innerHTML += `<li class="page-item ${i === currentPage ? 'active' : ''}">
        <a class="page-link" href="#" onclick="changePage(${i})">${i}</a></li>`;
    }
  
    pagination.innerHTML += `<li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
      <a class="page-link" href="#" onclick="changePage(${currentPage + 1})">selanjutnya</a></li>`;
  }
  
  // Hapus satu item (tanpa konfirmasi)
  function hapusItem(id) {
    const index = psikologData.findIndex(p => p.id === id);
    if (index !== -1) {
      psikologData.splice(index, 1);
      filteredData = [...psikologData];
      renderTable();
    }
  }
  
  // Hapus semua yang dipilih (tanpa konfirmasi)
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
  
  // Agar fungsi bisa dipanggil dari HTML (onclick)
  window.handleSearch = handleSearch;
  window.resetTable = resetTable;
  window.updateRowsPerPage = updateRowsPerPage;
  window.changePage = changePage;
  window.hapusItem = hapusItem;
  window.hapusYangDipilih = hapusYangDipilih;
  