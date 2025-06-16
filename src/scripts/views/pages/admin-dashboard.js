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
  let start = (currentPage - 1) * rowsPerPage;
  let end =
    rowsPerPage === "all" ? filteredCounselings.length : start + rowsPerPage;
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
