const ENDPOINT = "https://mentalwellbackend-production.up.railway.app";
const TOKEN = "{{admin_token}}";

let allArticles = [];
let filteredData = [];
let rowsPerPage = 10;
let currentPage = 1;

document.addEventListener("DOMContentLoaded", async () => {
  await fetchArticles();
  renderKategoriOptions();
  document
    .getElementById("filterKategori")
    .addEventListener("change", handleFilter);
  document
    .getElementById("searchInput")
    .addEventListener("input", handleSearch);
  document
    .getElementById("rowsPerPage")
    .addEventListener("change", updateRowsPerPage);
  document.getElementById("selectAll")?.addEventListener("change", function () {
    const checkboxes = document.querySelectorAll(".row-checkbox");
    checkboxes.forEach((cb) => (cb.checked = this.checked));
  });
  renderTable();
});

async function fetchArticles() {
  try {
    const res = await fetch(`${ENDPOINT}/article`, {
      headers: { Authorization: `Bearer ${TOKEN}` },
    });
    const result = await res.json();
    if (res.ok && result.data) {
      allArticles = result.data.map((a) => ({
        id: a.id,
        judul: a.title,
        kategori: a.category,
        tanggal: a.date
          ? new Date(a.date).toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })
          : "",
        dibuatoleh: a.created_by || "Admin",
      }));
      filteredData = [...allArticles];
    } else {
      allArticles = [];
      filteredData = [];
    }
  } catch (err) {
    allArticles = [];
    filteredData = [];
  }
}

function renderKategoriOptions() {
  const select = document.getElementById("filterKategori");
  if (!select) return;
  const kategoriSet = new Set(allArticles.map((a) => a.kategori));
  select.innerHTML =
    `<option value="semua">Semua Kategori</option>` +
    [...kategoriSet].map((k) => `<option value="${k}">${k}</option>`).join("");
}

function handleFilter() {
  const kategori = document.getElementById("filterKategori").value;
  filteredData =
    kategori === "semua"
      ? [...allArticles]
      : allArticles.filter((item) => item.kategori === kategori);
  currentPage = 1;
  renderTable();
}

function handleSearch() {
  const keyword = document.getElementById("searchInput").value.toLowerCase();
  filteredData = allArticles.filter(
    (p) =>
      (p.kategori || "").toLowerCase().includes(keyword) ||
      (p.judul || "").toLowerCase().includes(keyword) ||
      (p.dibuatoleh || "").toLowerCase().includes(keyword)
  );
  currentPage = 1;
  renderTable();
}

function updateRowsPerPage() {
  rowsPerPage =
    parseInt(document.getElementById("rowsPerPage").value, 10) || 10;
  currentPage = 1;
  renderTable();
}

function changePage(page) {
  currentPage = page;
  renderTable();
}

function renderTable() {
  const table = document.querySelector("table");
  if (!table) return;
  let html = `
    <thead>
      <tr>
        <th><input type="checkbox" id="selectAll"></th>
        <th>Judul</th>
        <th>Kategori</th>
        <th>Tanggal</th>
        <th>Dibuat Oleh</th>
        <th>Aksi</th>
      </tr>
    </thead>
    <tbody>
  `;
  const start = (currentPage - 1) * rowsPerPage;
  const pageData = filteredData.slice(start, start + rowsPerPage);
  if (pageData.length === 0) {
    html += `<tr><td colspan="6" class="text-center">Tidak ada data</td></tr>`;
  } else {
    for (const item of pageData) {
      html += `
        <tr>
          <td><input type="checkbox" class="row-checkbox" data-id="${item.id}"></td>
          <td>${item.judul}</td>
          <td>${item.kategori}</td>
          <td>${item.tanggal}</td>
          <td>${item.dibuatoleh}</td>
          <td>
            <a href="/src/templates/admin-lihatartikel.html?artikel_id=${item.id}" class="btn btn-sm btn-info me-1">Lihat</a>
            <a href="/src/templates/admin-editartikel.html?artikel_id=${item.id}" class="btn btn-sm btn-warning me-1">Edit</a>
            <button class="btn btn-sm btn-danger" onclick="hapusItem(${item.id})">Hapus</button>
          </td>
        </tr>
      `;
    }
  }
  html += `</tbody>`;
  table.innerHTML = html;
  document.getElementById("selectAll")?.addEventListener("change", function () {
    const checkboxes = document.querySelectorAll(".row-checkbox");
    checkboxes.forEach((cb) => (cb.checked = this.checked));
  });
  renderPagination();
}

function renderPagination() {
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const pagination = document.getElementById("pagination");
  if (!pagination) return;
  let html = "";
  for (let i = 1; i <= totalPages; i++) {
    html += `<li class="page-item${i === currentPage ? " active" : ""}">
      <a class="page-link" href="#" onclick="changePage(${i});return false;">${i}</a>
    </li>`;
  }
  pagination.innerHTML = html;
}

async function hapusItem(id) {
  const konfirmasi = await Swal.fire({
    icon: "warning",
    title: "Hapus Artikel?",
    text: "Artikel yang dihapus tidak dapat dikembalikan.",
    showCancelButton: true,
    confirmButtonText: "Ya, hapus!",
    cancelButtonText: "Batal",
  });
  if (konfirmasi.isConfirmed) {
    try {
      const res = await fetch(`${ENDPOINT}/article/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${TOKEN}` },
      });
      const result = await res.json();
      if (res.ok && result.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: "Artikel dihapus.",
        });
        await fetchArticles();
        renderKategoriOptions();
        renderTable();
      } else {
        Swal.fire({
          icon: "error",
          title: "Gagal",
          text: result.message || "Gagal menghapus.",
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Tidak dapat terhubung ke server.",
      });
    }
  }
}

async function hapusYangDipilih() {
  const checked = Array.from(
    document.querySelectorAll(".row-checkbox:checked")
  ).map((cb) => cb.dataset.id);
  if (checked.length === 0) {
    Swal.fire({
      icon: "info",
      title: "Tidak ada yang dipilih",
      text: "Pilih artikel yang ingin dihapus.",
    });
    return;
  }
  const konfirmasi = await Swal.fire({
    icon: "warning",
    title: "Hapus Artikel Terpilih?",
    text: "Artikel yang dihapus tidak dapat dikembalikan.",
    showCancelButton: true,
    confirmButtonText: "Ya, hapus!",
    cancelButtonText: "Batal",
  });
  if (konfirmasi.isConfirmed) {
    for (const id of checked) {
      await hapusItem(id);
    }
    await fetchArticles();
    renderKategoriOptions();
    renderTable();
  }
}

// Agar bisa dipanggil dari HTML
window.handleSearch = handleSearch;
window.resetTable = () => {
  document.getElementById("searchInput").value = "";
  handleSearch();
};
window.updateRowsPerPage = updateRowsPerPage;
window.changePage = changePage;
window.hapusItem = hapusItem;
window.hapusYangDipilih = hapusYangDipilih;
