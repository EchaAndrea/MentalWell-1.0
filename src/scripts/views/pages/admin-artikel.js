let allArticles = [];
let filteredData = [];
let rowsPerPage = 10;
let currentPage = 1;

async function fetchArticles() {
  const TOKEN = sessionStorage.getItem("authToken");
if (!TOKEN) {
  window.location.href = "https://mentalwell-10-frontend.vercel.app/";
  return;
}
  try {
    const res = await fetch(
      `https://mentalwell10-api-production.up.railway.app/articles`,
      {
        headers: { Authorization: `Bearer ${TOKEN}` },
      }
    );
    const result = await res.json();
    if (
      res.ok &&
      result.status === "success" &&
      Array.isArray(result.articles)
    ) {
      allArticles = result.articles.map((a) => ({
        id: a.id,
        judul: a.title,
        kategori: a.category || "-", // jika tidak ada, tampilkan '-'
        tanggal: a.created_at
          ? new Date(a.created_at).toLocaleDateString("id-ID", {
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
  if (!tbody) return;

  // Pastikan rowsPerPage bertipe number
  let perPage =
    rowsPerPage === "all" ? filteredData.length : Number(rowsPerPage);
  let start = (currentPage - 1) * perPage;
  let end = rowsPerPage === "all" ? filteredData.length : start + perPage;
  let pageData = filteredData.slice(start, end);

  tbody.innerHTML = "";

  if (pageData.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center">Tidak ada data</td></tr>`;
    return;
  }

  pageData.forEach((item) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><input type="checkbox" class="row-checkbox" data-id="${item.id}"></td>
      <td>${item.id}</td>
      <td>${item.judul}</td>
      <td>${item.kategori}</td>
      <td>${item.tanggal}</td>
      <td>${item.dibuatoleh}</td>
      <td>
        <a href="/src/templates/admin-lihatartikel.html?artikel_id=${item.id}" class="btn btn-sm btn-info me-1">Lihat</a>
        <a href="/src/templates/admin-editartikel.html?artikel_id=${item.id}" class="btn btn-sm btn-warning me-1">Edit</a>
        <button class="btn btn-sm btn-danger" onclick="hapusItem(${item.id})">Hapus</button>
      </td>
    `;
    tbody.appendChild(tr);
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
      const res = await fetch(
        `https://mentalwell10-api-production.up.railway.app/article/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${TOKEN}` },
        }
      );
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
