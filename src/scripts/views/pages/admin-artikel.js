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
    console.log("API result:", result); // Debug
    if (
      res.ok &&
      result.status === "success" &&
      Array.isArray(result.articles)
    ) {
      allArticles = result.articles.map((a) => ({
        id: a.id,
        judul: a.title,
        kategori: a.category || "", 
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
    console.error("Fetch error:", err);
  }
  renderTable();
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
  rowsPerPage = value === "all" ? "all" : parseInt(value, 10) || 10;
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
        <a href="/src/templates/admin-lihatartikel.html?artikel_id=${item.id}" class="btn btn-sm btn-secondary me-1" title="Lihat">
          <img src="/src/public/admin/lihat.png" width="13">
        </a>
        <a href="/src/templates/admin-editartikel.html?artikel_id=${item.id}" class="btn btn-sm btn-info me-1" title="Edit">
          <img src="/src/public/admin/edit.png" width="13">
        </a>
        <button class="btn btn-sm btn-danger" onclick="hapusItem(${item.id})" title="Hapus">
          <img src="/src/public/admin/hapus.png" width="13">
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  renderPagination();
}

function renderPagination() {
  const pagination = document.getElementById("pagination");
  if (!pagination) return;

  const totalRows = filteredData.length;
  const perPage = rowsPerPage === "all" ? totalRows : rowsPerPage;
  const totalPages = rowsPerPage === "all" ? 1 : Math.ceil(totalRows / perPage);

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
      if (
        !isNaN(page) &&
        page >= 1 &&
        page <= totalPages &&
        page !== currentPage
      ) {
        currentPage = page;
        renderTable();
      }
    });
  });
}

async function hapusItem(id) {
  const TOKEN = sessionStorage.getItem("authToken");
  if (!TOKEN) {
    Swal.fire({ icon: "error", title: "Token tidak ditemukan" });
    return;
  }

  const konfirmasi = await Swal.fire({
    title: "Yakin ingin menghapus artikel ini?",
    icon: "warning",
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
          headers: {
            Authorization: `Bearer ${TOKEN}`,
          },
        }
      );
      const result = await res.json();
      if (res.ok && result.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: "Artikel berhasil dihapus.",
        });
        // Refresh data
        fetchArticles();
      } else {
        Swal.fire({
          icon: "error",
          title: "Gagal hapus",
          text: result.message || "Gagal menghapus artikel.",
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Gagal terhubung ke server",
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
});
