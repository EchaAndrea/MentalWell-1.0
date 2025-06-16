let dataKonseling = [];
let filteredData = [];
let rowsPerPage = 10;
let currentPage = 1;

const PAYMENT_STATUS_MAP = {
  approved: "Lunas",
  waiting: "Belum Lunas",
  failed: "Gagal",
  refunded: "Refund",
};

document.addEventListener("DOMContentLoaded", async () => {
  await fetchCounselings();
  document
    .getElementById("filterKategori")
    .addEventListener("change", handleFilter);
  renderTable();
});

async function fetchCounselings() {
  try {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      window.location.href = "/src/templates/admin-login.html";
      return;
    }
    const res = await fetch(
      "https://mentalwell10-api-production.up.railway.app/admin/counselings",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (res.status === 401) {
      // Token tidak valid/expired
      localStorage.removeItem("admin_token");
      window.location.href = "/src/templates/admin-login.html";
      return;
    }
    const json = await res.json();
    if (json.status === "success") {
      dataKonseling = json.counselings.map((item) => ({
        id: item.id,
        nama: item.patient_name,
        tanggal: formatDate(item.schedule_date),
        waktu: item.schedule_time,
        status: PAYMENT_STATUS_MAP[item.payment_status] || item.payment_status,
      }));
      filteredData = [...dataKonseling];
    }
  } catch (e) {
    document.getElementById("psikologTableBody").innerHTML = `
      <tr><td colspan="7" class="text-center text-danger">Gagal memuat data konseling. Silakan cek koneksi atau hubungi admin.</td></tr>
    `;
    dataKonseling = [];
    filteredData = [];
  }
}

function formatDate(dateStr) {
  // dari yyyy-mm-dd ke dd-mm-yyyy
  const [y, m, d] = dateStr.split("-");
  return `${d}-${m}-${y}`;
}

// Filter berdasarkan status bayar
function handleFilter() {
  const kategori = document.getElementById("filterKategori").value;
  filteredData =
    kategori === "semua"
      ? [...dataKonseling]
      : dataKonseling.filter((item) => {
          const statusKey = Object.keys(PAYMENT_STATUS_MAP).find(
            (key) =>
              PAYMENT_STATUS_MAP[key].toLowerCase() ===
              item.status.toLowerCase()
          );
          return statusKey === kategori;
        });
  currentPage = 1;
  renderTable();
}

// Pencarian nama
function handleSearch() {
  const keyword = document.getElementById("searchInput").value.toLowerCase();
  filteredData = dataKonseling.filter((item) =>
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

// Fungsi redirect ke halaman detail
function redirectToDetail(nama) {
  window.location.href = `/src/templates/admin-detaildashboard.html?nama=${encodeURIComponent(
    nama
  )}`;
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
        <td><input type="checkbox" class="row-checkbox" data-nama="${item.id}"></td>  
        <td>${item.id}</td>
        <td>${item.nama}</td>
        <td>${item.tanggal}</td>
        <td>${item.waktu}</td>
        <td>${item.status}</td>
        <td>
          <button class="btn btn-sm btn-secondary" onclick="redirectToDetail('${item.nama}')">
            <img src="/src/public/admin/edit.png" width="13" alt="Detail">
          </button>
        </td>
      </tr>
    `;
  }

  renderPagination();
}

// Render pagination
function renderPagination() {
  const totalPages = Math.ceil(filteredData.length / rowsPerPage) || 1;
  const pagination = document.querySelector(".pagination");
  pagination.innerHTML = "";

  pagination.innerHTML += `<li class="page-item ${
    currentPage === 1 ? "disabled" : ""
  }">
    <a class="page-link" href="#" onclick="changePage(${
      currentPage - 1
    })">Sebelumnya</a></li>`;

  for (let i = 1; i <= totalPages; i++) {
    pagination.innerHTML += `<li class="page-item ${
      i === currentPage ? "active" : ""
    }">
      <a class="page-link" href="#" onclick="changePage(${i})">${i}</a></li>`;
  }

  pagination.innerHTML += `<li class="page-item ${
    currentPage === totalPages ? "disabled" : ""
  }">
    <a class="page-link" href="#" onclick="changePage(${
      currentPage + 1
    })">Selanjutnya</a></li>`;
}

// Agar bisa dipanggil dari HTML
window.handleSearch = handleSearch;
window.resetTable = resetTable;
window.updateRowsPerPage = updateRowsPerPage;
window.changePage = changePage;
window.redirectToDetail = redirectToDetail;
