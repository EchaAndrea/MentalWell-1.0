let psikologData = [];
let filteredData = [];
let rowsPerPage = 10;
let currentPage = 1;

document.addEventListener("DOMContentLoaded", async function () {
  await fetchPsikologData();
  document
    .getElementById("filterKategori")
    .addEventListener("change", handleFilter);
  document
    .getElementById("searchInput")
    .addEventListener("input", handleSearch);
  document
    .getElementById("rowsPerPage")
    .addEventListener("change", updateRowsPerPage);
  document.getElementById("selectAll").addEventListener("change", function () {
    document
      .querySelectorAll(".row-checkbox")
      .forEach((cb) => (cb.checked = this.checked));
  });
});

async function fetchPsikologData() {
  const TOKEN = sessionStorage.getItem("authToken");
  if (!TOKEN) {
    window.location.href = "https://mentalwell-10-frontend.vercel.app/";
    return;
  }
  try {
    const res = await fetch(
      "https://mentalwell10-api-production.up.railway.app/admin/psychologists",
      {
        headers: { Authorization: `Bearer ${TOKEN}` },
      }
    );
    if (res.status === 401) {
      alert("Sesi Anda sudah habis atau tidak valid. Silakan login ulang.");
      window.location.href = "https://mentalwell-10-frontend.vercel.app/";
      return;
    }
    const json = await res.json();
    if (json.status === "success") {
      psikologData = json.data.map((item) => ({
        id: item.id,
        nama: item.name,
        email: item.email,
        topik: "-", // Tidak ada field topics di response, jadi default "-"
        status: item.availability === "available",
        password: "********", // Tidak ada password dari BE
      })).sort((a, b) => b.id - a.id);
      filteredData = [...psikologData];
    } else {
      psikologData = [];
      filteredData = [];
    }
  } catch (e) {
    alert("Gagal memuat data psikolog");
    psikologData = [];
    filteredData = [];
  }
  renderTable();
}

function handleFilter() {
  const topik = document.getElementById("filterKategori").value;
  filteredData =
    topik === "semua"
      ? [...psikologData]
      : psikologData.filter((item) => item.topik === topik);
  currentPage = 1;
  renderTable();
}

function handleSearch() {
  const keyword = document.getElementById("searchInput").value.toLowerCase();
  filteredData = psikologData.filter(
    (p) =>
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
  rowsPerPage =
    value === "all" ? filteredData.length : parseInt(value, 10) || 10;
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
  const end = rowsPerPage === "all" ? filteredData.length : start + rowsPerPage;
  const pageData = filteredData.slice(start, end);

  if (pageData.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center">Tidak ada data</td></tr>`;
    renderPagination();
    return;
  }

  for (const p of pageData) {
    tbody.innerHTML += `
      <tr>
        <td><input type="checkbox" class="row-checkbox" data-id="${p.id}"></td>
        <td>${p.id}</td>
        <td>${p.nama}</td>
        <td>${p.email}</td>
        <td>${p.password}</td>
        <td>${p.topik}</td>
        <td>${p.status ? "Aktif" : "Nonaktif"}</td>
        <td>
          <a href="/src/templates/admin-lihatpsikolog.html?id=${
            p.id
          }" class="btn btn-sm btn-secondary">
            <img src="/src/public/admin/lihat.png" width="13">
          </a>
          <a href="/src/templates/admin-editpsikolog.html?id=${
            p.id
          }" class="btn btn-sm btn-info">
            <img src="/src/public/admin/edit.png" width="13">
          </a>
          <button class="btn btn-sm btn-danger" onclick="hapusItem(${p.id})">
            <img src="/src/public/admin/hapus.png" width="13">
          </button>
        </td>
      </tr>`;
  }
  renderPagination();
}

function renderPagination() {
  const pagination = document.querySelector(".pagination");
  if (!pagination) return;

  // Hitung total halaman
  const totalRows = filteredData.length; // Perbaiki dari filteredCounselings ke filteredData
  const perPage = rowsPerPage === "all" ? totalRows : rowsPerPage;
  const totalPages = rowsPerPage === "all" ? 1 : Math.ceil(totalRows / perPage);

  // Bersihkan pagination lama
  pagination.innerHTML = "";

  // Tombol Sebelumnya
  const prevClass = currentPage === 1 ? "disabled" : "";
  pagination.innerHTML += `
    <li class="page-item ${prevClass}">
      <a class="page-link" href="#" data-page="${
        currentPage - 1
      }">Sebelumnya</a>
    </li>
  `;

  // Nomor halaman
  for (let i = 1; i <= totalPages; i++) {
    const activeClass = currentPage === i ? "active" : "";
    pagination.innerHTML += `
      <li class="page-item ${activeClass}">
        <a class="page-link" href="#" data-page="${i}">${i}</a>
      </li>
    `;
  }

  // Tombol Selanjutnya
  const nextClass = currentPage === totalPages ? "disabled" : "";
  pagination.innerHTML += `
    <li class="page-item ${nextClass}">
      <a class="page-link" href="#" data-page="${
        currentPage + 1
      }">Selanjutnya</a>
    </li>
  `;

  // Event listener untuk pagination
  pagination.querySelectorAll("a.page-link").forEach((el) => {
    el.addEventListener("click", function (e) {
      e.preventDefault();
      const page = parseInt(this.getAttribute("data-page"));
      if (!isNaN(page) && page >= 1 && page !== currentPage) {
        currentPage = page;
        renderTable();
      }
    });
  });
}

async function hapusItem(id) {
  const TOKEN = sessionStorage.getItem("authToken");
  if (!TOKEN) {
    alert("Token tidak ditemukan. Silakan login ulang.");
    return;
  }

  const konfirmasi = confirm("Yakin ingin menghapus psikolog ini?");
  if (!konfirmasi) return;

  try {
    const res = await fetch(
      `https://mentalwell10-api-production.up.railway.app/admin/psychologist/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${TOKEN}`,
        },
      }
    );
    const result = await res.json();
    if (res.ok && result.status === "success") {
      alert("Psikolog berhasil dihapus.");
      await fetchPsikologData(); // Refresh data dari server
    } else {
      alert(result.message || "Gagal menghapus psikolog.");
    }
  } catch (err) {
    alert("Gagal terhubung ke server.");
  }
}

function hapusYangDipilih() {
  const checkboxes = document.querySelectorAll(".row-checkbox:checked");
  if (checkboxes.length === 0) return alert("Pilih data terlebih dahulu.");

  checkboxes.forEach((cb) => {
    const id = parseInt(cb.getAttribute("data-id"));
    const index = psikologData.findIndex((p) => p.id === id);
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
