 const psikologData = [
      { nama: "budi", email: "anak@example.com", password: "anak123", topik: "trauma", aktif: true },
      { nama: "jack", email: "remaja@example.com", password: "remaja123", topik: "anak remaja", aktif: true },
      { nama: "adelia", email: "dewasa@example.com", password: "dewasa123", topik: "adiksi", aktif: true },
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

    function handleFilter() {
      const topik = document.getElementById("filterKategori").value;
      filteredData = topik === "semua"
        ? [...psikologData]
        : psikologData.filter(item => item.topik === topik);
      currentPage = 1;
      renderTable();
    }

    function handleSearch() {
      const keyword = document.getElementById("searchInput").value.toLowerCase();
      filteredData = psikologData.filter(p =>
        p.nama.toLowerCase().includes(keyword) ||
        p.nama.toLowerCase().includes(keyword) ||
        p.email.toLowerCase().includes(keyword)
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
            <td><input type="checkbox" class="row-checkbox" data-nama="${p.nama}"></td>
            <td>${p.nama}</td>
            <td>${p.email}</td>
            <td>${p.password}</td>
            <td>${p.topik}</td>
            <td>${p.aktif ? "Aktif" : "Nonaktif"}</td>
            <td>
              <a href="/src/templates/admin-lihatpsikolog.html?nama=${p.nama}" class="btn btn-sm btn-secondary">
                <img src="/src/public/admin/lihat.png" width="13">
              </a>
              <a href="/src/templates/admin-editpsikolog.html?nama=${p.nama}" class="btn btn-sm btn-info">
                <img src="/src/public/admin/edit.png" width="13">
              </a>
              <button class="btn btn-sm btn-danger" onclick="hapusItem('${p.nama}')">
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
        </li>`;

      for (let i = 1; i <= totalPages; i++) {
        const active = currentPage === i ? "active" : "";
        pagination.innerHTML += `
          <li class="page-item ${active}">
            <a class="page-link" href="#" onclick="changePage(${i})">${i}</a>
          </li>`;
      }

      const nextDisabled = currentPage === totalPages ? "disabled" : "";
      pagination.innerHTML += `
        <li class="page-item ${nextDisabled}">
          <a class="page-link" href="#" onclick="changePage(${currentPage + 1})">Selanjutnya</a>
        </li>`;
    }

    function hapusItem(nama) {
      const index = psikologData.findIndex(p => p.nama === nama);
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
        const nama = cb.getAttribute("data-nama");
        const index = psikologData.findIndex(p => p.nama === nama);
        if (index !== -1) psikologData.splice(index, 1);
      });

      filteredData = [...psikologData];
      renderTable();
    }

    window.handleSearch = handleSearch;
    window.resetTable = resetTable;
    window.updateRowsPerPage = updateRowsPerPage;
    window.changePage = changePage;
    window.hapusItem = hapusItem;
    window.hapusYangDipilih = hapusYangDipilih;