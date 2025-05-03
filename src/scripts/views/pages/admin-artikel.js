let artikelList = [
    { id: 1, kategori: "Psikologi", judul: "Tips Mengelola Stres", tanggal: "2023-12-01", dibuatOleh: "Admin" },
    { id: 2, kategori: "Kesehatan", judul: "Pola Tidur Sehat", tanggal: "2023-12-02", dibuatOleh: "Admin" },
  ];
  
  function renderArtikel(data = artikelList) {
    const tbody = document.getElementById("artikelTbody");
    tbody.innerHTML = "";
    data.forEach((item) => {
      tbody.innerHTML += `
        <tr>
          <td><input type="checkbox" class="row-check" data-id="${item.id}" /></td>
          <td>${item.id}</td>
          <td>${item.kategori}</td>
          <td>${item.judul}</td>
          <td>${item.tanggal}</td>
          <td>${item.dibuatOleh}</td>
          <td>
            <button class="btn-action view" onclick="viewArtikel(${item.id})">
                <img src="/src/public/admin/lihat.png" alt="Lihat" />
            </button>
            <button class="btn-action edit" onclick="editArtikel(${item.id})">
                <img src="/src/public/admin/edit.png" alt="Edit" />
            </button>
            <button class="btn-action delete" onclick="hapusArtikel(${item.id})">
                <img src="/src/public/admin/hapus.png" alt="Hapus" />
            </button>
          </td>
        </tr>
      `;
    });
  }
  
  function toggleSelectAll() {
    const isChecked = document.getElementById("selectAll").checked;
    document.querySelectorAll(".row-check").forEach((checkbox) => {
      checkbox.checked = isChecked;
    });
  }
  
  function searchArtikel() {
    const query = document.getElementById("searchInput").value.toLowerCase();
    const filtered = artikelList.filter(a => a.judul.toLowerCase().includes(query));
    renderArtikel(filtered);
  }
  
  function refreshArtikel() {
    renderArtikel();
    document.getElementById("searchInput").value = "";
  }
  
  function hapusArtikel(id) {
    artikelList = artikelList.filter(item => item.id !== id);
    renderArtikel();
  }
  
  function hapusDipilih() {
    const selected = Array.from(document.querySelectorAll(".row-check:checked")).map(cb => parseInt(cb.dataset.id));
    artikelList = artikelList.filter(item => !selected.includes(item.id));
    renderArtikel();
  }
  
  function viewArtikel(id) {
    alert("Lihat artikel ID: " + id);
  }
  
  function editArtikel(id) {
    window.location.href = `artikel-detail.html?id=${id}`;
  }
  
  function navigateToDetail() {
    window.location.href = `artikel-detail.html`;
  }
  
  window.onload = () => renderArtikel();
  