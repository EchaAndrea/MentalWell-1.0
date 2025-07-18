class NavBar extends HTMLElement {
  constructor() {
    super();

    // Create a shadow root
    this.attachShadow({ mode: "open" });

    // Define the HTML content for the component
    this.shadowRoot.innerHTML = `
            <style>
              /* Add your styling for the navbar here */
              nav {
                position: fixed;
                top: 0;
                z-index: 99;
                width: 100%;
              }
              .navbar {
                width: 100%;
                height: 89px;
                display: flex;
                justify-content: space-between;
                position: sticky;
                top: 0;
                z-index: 99;
                background-color: #fff;
              }
        
              .navbar .navbar-brand {
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: space-between;
                margin-left: 2rem;
              }
        
              .navbar .navbar-brand h1 {
                color: #044b77;
                font-size: 25px;
                /* text-transform: uppercase; */
                margin-left: 5px;
              }
        
              .navbar .navbar-list {
                display: flex;
                gap: 2rem;
                justify-content: center;
              }
        
              .navbar .navbar-list .button {
                display: flex;
                align-items: center;
                margin-right: 2rem;
              }
        
              .navbar .navbar-list .button button {
                width: 95px;
                height: 44px;
                border-radius: 10px;
                background-color: #044b77;
                color: #ffffff;
                font-size: 17px;
              }
        
              .navbar .navbar-list .button button:hover {
                background-color: #3ad0ea;
                color: #ffffff;
                background-color: #02bbdd;
                cursor: pointer;
                color: white;
              }
        
              .navbar .navbar-list .navbar-list-item {
                text-decoration: none;
                display: flex;
                align-items: center;
                gap: 2rem;
              }
        
              .navbar .navbar-list .list-item {
                list-style: none;
              }
        
              .navbar .navbar-list .navbar-list-item .list-item a {
                text-decoration: none;
                list-style: none;
                color: black;
                font-size: 17px;
                font-weight: 500px;
                padding-top: 10px;
                padding-bottom: 10px;
              }
        
              /* animasi */
              .navbar .navbar-list .navbar-list-item .list-item a::after {
                content: "";
                width: 0;
                height: 2px;
                background-color: #000;
                display: block;
                transition: 0.2s linear;
              }
        
              .navbar .navbar-list .navbar-list-item .list-item a:hover::after {
                width: 100%;
              }
  
              .navbar .navbar-list .button-user {
                  display: flex;
                  align-items: center;
                }
                
                .navbar .navbar-list .button-user button {
                  width: 95px;
                  height: 40px;
                  background-color: white;
                  border: none;
                  font-size: 20px;
                  cursor: pointer;
                }
                
              #dropdown- {
                width: 40px;
                height: 40px;
                margin-right: 1rem;
              }
              #photoUser {
                  height: 32px;
                  width: 32px;
                  border-radius: 50%;
                  object-fit: cover;
                  cursor: pointer;
                  margin-right: 1rem;
                }

                .navbar .navbar-list .button-user h4 {
                  margin-right: 1rem;
                }

                // dropdown menu
                .button-user {
                  position: relative;
                  display: inline-block;
              }
              
              .dropdown-content {
                display: none;
                position: absolute;
                background-color: #f9f9f9;
                min-width: 160px;
                box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
                z-index: 1;
                top: 88px;
                right: 1px;
                border-bottom-left-radius: 10px;
              }
    
              .dropdown-content .keluar-button {
                display: flex;
                flex-direction: row;
              }
              
              .dropdown-content a:hover {
                  color: #fff;
              }
    
              .dropdown-content .keluar-button:hover {
                background-color: #044B97;
                color: #fff;
                cursor: pointer;
              }

              .keluar {
                border-bottom-left-radius: none;
                display: flex;
                align-items: center; /* Pusatkan elemen secara vertikal */
                text-decoration: none; /* Hilangkan garis bawah pada tautan */
                color: black; /* Ubah warna teks jika diinginkan */
                padding: 12px 16px;
              }

              .keluar img {
                margin-right: 10px;
              }
            </style>
            
            <nav>
                <div class="navbar">
                    <div class="navbar-brand">
                        <img src="/src/public/logo/logo-mentalwell.jpg" width="50px" alt="logo mentalwell">
                        <h1>MentalWell  1.0</h1>
                    </div>
                    <div class="navbar-list">
                        <ul class="navbar-list-item">
                          <li class="list-item"><a href="/dashboardpsikolog">Dashboard</a></li>
                        </ul>
                        <div class="button-user" id="userDropdown">
                            <img src="/src/public/beranda/man.png" alt="Foto User" id="photoUser" >
                            <h4 id="nicknameTag"></h4>
                            <img src="/src/public/dropdown/dropdown.png" alt="Foto User" id="dropdown-" >
                            <div class="dropdown-content">
                              <div class="keluar-button" id="keluar-button">
                                <a class="keluar" href="#">
                                  <img src="/src/public/dropdown/exit.png" width="30px" height="30px">
                                  <span>Keluar</span>
                                </a>
                              </div>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
          `;
    this.connectedCallback();
  }

  connectedCallback() {
    const photoUser = this.shadowRoot.getElementById("photoUser");
    const nicknameTag = this.shadowRoot.getElementById("nicknameTag");

    const token = sessionStorage.getItem("authToken");
    if (!token) {
      window.location.href = "/"; // Atau ke halaman login
      return;
    }
    const requestOptions = {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };

    fetch(
      "https://mentalwell10-api-production.up.railway.app/psychologist/profile",
      requestOptions
    )
      .then((response) => response.json())
      .then((data) => {
        // Cek struktur respons API
        console.log("Psychologist Profile API response:", data);
        const currentUser = data.data;
        if (nicknameTag && photoUser && currentUser) {
          nicknameTag.innerText = currentUser.name || "Psikolog";
          photoUser.src = currentUser.profile_image
            ? currentUser.profile_image + "?t=" + Date.now()
            : "/src/public/beranda/man.png";
        } else {
          console.error(
            'Element with ID "nicknameTag" not found atau data user kosong.'
          );
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });

    // Get userDropdown element within Shadow DOM
    const userDropdown = this.shadowRoot.getElementById("userDropdown");

    // Add event listeners for mouseover and mouseout within Shadow DOM
    userDropdown.addEventListener("mouseover", () => {
      userDropdown.querySelector(".dropdown-content").style.display = "block";
    });

    userDropdown.addEventListener("mouseout", () => {
      userDropdown.querySelector(".dropdown-content").style.display = "none";
    });

    this.shadowRoot.querySelector(".keluar").addEventListener("click", () => {
      this.logout();
    });
  }

  logout() {
    sessionStorage.removeItem("authToken");
    window.location.href = "/";
  }
}

// Define the custom element
customElements.define("navbar-psikolog", NavBar);
