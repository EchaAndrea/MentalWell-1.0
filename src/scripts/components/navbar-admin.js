class NavbarAdmin extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = `
        <style>
          * {
            box-sizing: border-box;
          }
  
          nav {
            width: 100%;
            height: 89px;
            background-color: #ffffff;
            display: flex;
            align-items: center;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            z-index: 999;
            padding: 0 32px;
            font-family: 'Poppins', sans-serif;
          }
  
          .navbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
          }
  
          .navbar-brand {
            display: flex;
            align-items: center;
            gap: 8px;
          }
  
          .navbar-brand h1 {
            font-size: 24px;
            font-weight: 600;
            color: #535353;
            margin: 0;
          }
  
          .navbar-brand img {
            height: 32px;
            width: auto;
          }
  
          .navbar-list {
            display: flex;
            align-items: center;
            gap: 24px;
          }
  
          .navbar-list-item {
            list-style: none;
            display: flex;
            gap: 16px;
            padding: 0;
            margin: 0;
          }
  
          .navbar-list-item .list-item a {
            font-size: 16px;
            text-decoration: none;
            color: #535353;
            font-weight: 500;
          }
  
          .button-user {
            position: relative;
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
          }
  
          .button-user img {
            height: 32px;
            width: 32px;
            border-radius: 50%;
            object-fit: cover;
          }
  
          .button-user h4 {
            font-size: 16px;
            color: #535353;
            margin: 0;
          }
  
          .button-user .dropdown-content {
            display: none;
            position: absolute;
            top: 100%;
            right: 0;
            background-color: #ffffff;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
            padding: 12px;
            min-width: 160px;
            z-index: 1000;
          }
  
          .button-user:hover .dropdown-content {
            display: block;
          }
  
          .dropdown-content a {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px;
            text-decoration: none;
            color: #535353;
            border-radius: 4px;
            transition: background-color 0.2s;
          }
  
          .dropdown-content a:hover {
            background-color: #f0f0f0;
          }
  
          .dropdown-content img {
            width: 20px;
            height: 20px;
          }
        </style>
  
        <nav>
          <div class="navbar">
            <div class="navbar-brand">
              <img src="/src/public/logo/logoicon.png" width="50px" alt="logo mentalwell">
              <h1>MentalWell 1.0</h1>
            </div>
            <div class="navbar-list">
              <ul class="navbar-list-item">
                <li class="list-item"><a href="/admin-dashboard">Dashboard</a></li>
                <li class="list-item"><a href="/admin-artikel">Artikel</a></li>
                <li class="list-item"><a href="/admin-psikolog">Psikolog</a></li>
              </ul>
              <div class="button-user" id="userDropdown">
                <img id="photoUser" src="/src/public/beranda/man.png" alt="Foto User"  id="photoUser" />
                <h4 id="nicknameTag"></h4>
                <img src="/src/public/dropdown/dropdown.png" alt="Foto User" id="dropdown-" >
                <div class="dropdown-content">
                  <a id="profilLink" href="/editprofiladmin">
                    <img src="/src/public/dropdown/man.png" alt="Profil" />
                    <span>Profil saya</span>
                  </a>
                  <a class="keluar" href="#" id="logoutBtn">
                    <img src="/src/public/dropdown/exit.png" width="30px" height="30px">
                    <span>Keluar</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </nav>
      `;

    this.fetchUserData();
    this.shadowRoot
      .querySelector("#logoutBtn")
      .addEventListener("click", (e) => {
        e.preventDefault();
        sessionStorage.removeItem("authToken");
        window.location.href = "/login";
      });
  }

  async fetchUserData() {
    try {
      const response = await fetch('https://mentalwellbackend-production.up.railway.app/login', {
        credentials: 'include', // jika backend pakai cookie/session
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // ...gunakan data user sesuai kebutuhan...
      this.renderUser(data);
    } catch (error) {
      console.error('Error saat fetch user:', error);
      // Tampilkan pesan error di UI jika perlu
      this.renderUser(null);
    }
  }

  renderUser(data) {
    const nickname = data?.psychologist?.name;
    const photo = data?.psychologist?.profilePicture;

    this.shadowRoot.querySelector("#nicknameTag").textContent =
      nickname || "User";
    if (photo) {
      this.shadowRoot.querySelector("#photoUser").src = photo;
    }
  }
}

customElements.define("navbar-admin", NavbarAdmin);
