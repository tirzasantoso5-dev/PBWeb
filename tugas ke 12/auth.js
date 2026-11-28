
const API = "https://dummyjson.com";
const KUNCI = "token-blog";

function simpanToken(token, ingat = false) {
  hapusToken();                                   // pastikan tidak ada token ganda
  (ingat ? localStorage : sessionStorage).setItem(KUNCI, token);
}
function ambilToken() {
  return sessionStorage.getItem(KUNCI) ?? localStorage.getItem(KUNCI);
}
function hapusToken() {
  sessionStorage.removeItem(KUNCI);
  localStorage.removeItem(KUNCI);
}
function sudahLogin() { return ambilToken() !== null; }

// --- Langkah 1: login() ---
async function login(username, password, ingat = false) {
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();                  
  if (!res.ok) throw new Error(data.message || "Login gagal");
  simpanToken(data.accessToken, ingat);
  return data;
}

function wajibLogin() {
  if (!sudahLogin()) location.replace("login.html");
}

async function fetchAman(url, opsi = {}) {
  const res = await fetch(url, {
    ...opsi,
    headers: { ...opsi.headers, Authorization: `Bearer ${ambilToken()}` },
  });
  if (res.status === 401) {
    hapusToken();
    location.replace("login.html?sesi=habis");
    throw new Error("Sesi berakhir");
  }
  return res;
}

// --- Langkah 4: logout() (B.5) ---
function logout() {
  hapusToken();
  location.href = "login.html";
}

function bacaToken(token) {
  const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
  return JSON.parse(atob(payload));
}

function terapkanHakAkses() {
  document.body.classList.toggle("belum-login", !sudahLogin());
}

function mulaiHitungMundur(elemen) {
  let exp;
  try { exp = bacaToken(ambilToken()).exp; } catch (e) { return; }   // token tak terbaca -> abaikan
  if (!exp) return;

  const perbarui = () => {
    const sisa = Math.floor(exp - Date.now() / 1000);                // detik
    if (sisa <= 0) {
      clearInterval(pewaktu);
      hapusToken();
      location.replace("login.html?sesi=habis");
      return;
    }
    const mm = String(Math.floor(sisa / 60)).padStart(2, "0");
    const ss = String(sisa % 60).padStart(2, "0");
    elemen.textContent = `Sesi berakhir dalam ${mm}:${ss}`;
  };
  const pewaktu = setInterval(perbarui, 1000);
  perbarui();
}