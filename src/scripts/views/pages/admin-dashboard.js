let allCounselings = [];
let filteredCounselings = [];
let currentPage = 1;
let rowsPerPage = 10;

document.addEventListener("DOMContentLoaded", () => {
  fetchCounselings();

  document
    .getElementById("filterKategori")
    .addEventListener("change", handleFilter);
  document
    .getElementById("searchInput")
    .addEventListener("input", handleSearch);
  document
    .getElementById("rowsPerPage")
    .addEventListener("change", updateRowsPerPage);
});

async function fetchCounselings() {
  const TOKEN = sessionStorage.getItem("authToken");
  if (!TOKEN) {
    window.location.href = "https://mentalwell-10-frontend.vercel.app/";
    return;
  }

  try {
    const res = await fetch(
      `https://mentalwell10-api-production.up.railway.app/admin/counselings`,
      {
        headers: { Authorization: `Bearer ${TOKEN}` },
      }
    );
    const data = await res.json();
    allCounselings = data.counselings || [];
    filteredCounselings = [...allCounselings];
    renderTable();
  } catch (err) {
    alert("Gagal memuat data konseling");
  }
}

function renderTable() {
  const tbody = document.getElementById("psikologTableBody");
  tbody.innerHTML = "";

  // Pastikan rowsPerPage bertipe number
  let perPage =
    rowsPerPage === "all" ? filteredCounselings.length : Number(rowsPerPage);
  let start = (currentPage - 1) * perPage;
  let end =
    rowsPerPage === "all" ? filteredCounselings.length : start + perPage;
  let pageData = filteredCounselings.slice(start, end);

  pageData.forEach((item) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><input type="checkbox"></td>
      <td>${item.id}</td>
      <td>${item.patient_name}</td>
      <td>${item.schedule_date}</td>
      <td>${item.schedule_time}</td>
      <td>${renderStatus(item.payment_status)}</td>
      <td>
        <a href="/src/templates/admin-detaildashboard.html?id=${
          item.id
        }" class="btn btn-sm btn-primary">Detail</a>
      </td>
    `;
    tbody.appendChild(tr);
  });

  renderPagination();
}

function renderStatus(status) {
  switch (status) {
    case "approved":
      return '<span class="badge bg-success">Lunas</span>';
    case "waiting":
      return '<span class="badge bg-warning text-dark">Belum Lunas</span>';
    case "failed":
      return '<span class="badge bg-danger">Gagal</span>';
    case "refunded":
      return '<span class="badge bg-info text-dark">Refund</span>';
    default:
      return status;
  }
}

function handleFilter() {
  const kategori = document.getElementById("filterKategori").value;
  filteredCounselings =
    kategori === "semua"
      ? [...allCounselings]
      : allCounselings.filter((c) => c.payment_status === kategori);
  currentPage = 1;
  renderTable();
}

function handleSearch() {
  const keyword = document.getElementById("searchInput").value.toLowerCase();
  filteredCounselings = allCounselings.filter(
    (c) =>
      c.patient_name.toLowerCase().includes(keyword) ||
      c.id.toString().includes(keyword)
  );
  currentPage = 1;
  renderTable();
}

function resetTable() {
  document.getElementById("filterKategori").value = "semua";
  document.getElementById("searchInput").value = "";
  filteredCounselings = [...allCounselings];
  currentPage = 1;
  renderTable();
}

function updateRowsPerPage() {
  const val = document.getElementById("rowsPerPage").value;
  rowsPerPage = val === "all" ? "all" : parseInt(val);
  currentPage = 1;
  renderTable();
}

function renderPagination() {
  const pagination = document.querySelector(".pagination");
  if (!pagination) return;

  // Hitung total halaman
  const totalRows = filteredCounselings.length;
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
