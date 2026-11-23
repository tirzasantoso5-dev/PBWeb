/* =========================================================
   BukuKu — Cari Buku dan Rak Bacaan Pribadi
   Modul 4–5 DOM & Event | 6 Validasi | 7 localStorage
   Modul 8–9 Fetch & status code | 10 Custom Elements
   ========================================================= */

const API_CARI = "https://openlibrary.org/search.json";
const KUNCI_RAK = "bukuku-rak";
const GAMBAR_CADANGAN =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="300">' +
    '<rect width="100%" height="100%" fill="#dde3ea"/>' +
    '<text x="50%" y="50%" font-family="Arial" font-size="18" fill="#667" ' +
    'text-anchor="middle">Tanpa sampul</text></svg>'
  );

/* ---------- Elemen halaman ---------- */
const formCari = document.querySelector("#form-cari");
const inputKata = document.querySelector("#kata-kunci");
const tombolCari = document.querySelector("#tombol-cari");
const pesanError = document.querySelector("#pesan-error");
const statusEl = document.querySelector("#status");
const daftarHasil = document.querySelector("#daftar-hasil");
const daftarRak = document.querySelector("#daftar-rak");
const rakKosong = document.querySelector("#rak-kosong");
const filterStatus = document.querySelector("#filter-status");
const jumlahRak = document.querySelector("#jumlah-rak");
const notif = document.querySelector("#notif");

/* =========================================================
   Modul 7 — Client-side state (localStorage + JSON)
   ========================================================= */
function bacaRak() {
  try {
    const data = JSON.parse(localStorage.getItem(KUNCI_RAK));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function simpanRak() {
  try {
    localStorage.setItem(KUNCI_RAK, JSON.stringify(rak));
  } catch {
    tampilkanNotif("Gagal menyimpan ke browser.");
  }
}

let rak = bacaRak();

/* =========================================================
   Modul 10 — Custom Element <kartu-buku>
   Data dikirim lewat PROPERTI JS (objek), mode lewat atribut.
   ========================================================= */
class KartuBuku extends HTMLElement {
  static get observedAttributes() {
    return ["mode", "tersimpan"];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  set buku(nilai) {
    this._buku = nilai;
    this.render();
  }

  get buku() {
    return this._buku;
  }

  render() {
    const b = this._buku;
    if (!b || !this.isConnected) return;

    const mode = this.getAttribute("mode") || "hasil";
    const sudahTersimpan = this.hasAttribute("tersimpan");

    const kartu = document.createElement("article");
    kartu.className = "kartu";

    const gambar = document.createElement("img");
    gambar.alt = `Sampul buku ${b.judul}`;
    gambar.loading = "lazy";
    gambar.src = b.cover
      ? `https://covers.openlibrary.org/b/id/${Number(b.cover)}-M.jpg`
      : GAMBAR_CADANGAN;
    gambar.addEventListener("error", () => { gambar.src = GAMBAR_CADANGAN; }, { once: true });

    const isi = document.createElement("div");
    isi.className = "isi";

    // textContent (bukan innerHTML) supaya data dari API aman
    const judul = document.createElement("h3");
    judul.textContent = b.judul;
    const penulis = document.createElement("p");
    penulis.className = "penulis";
    penulis.textContent = b.penulis;
    const tahun = document.createElement("p");
    tahun.className = "tahun";
    tahun.textContent = b.tahun ? `Terbit: ${b.tahun}` : "Tahun tidak diketahui";

    const aksi = document.createElement("div");
    aksi.className = "aksi";

    if (mode === "rak") {
      const pilih = document.createElement("select");
      pilih.dataset.aksi = "status";
      pilih.setAttribute("aria-label", `Status baca ${b.judul}`);
      [["ingin", "Ingin dibaca"], ["sudah", "Sudah dibaca"]].forEach(([nilai, teks]) => {
        const opsi = document.createElement("option");
        opsi.value = nilai;
        opsi.textContent = teks;
        opsi.selected = b.status === nilai;
        pilih.appendChild(opsi);
      });
      const hapus = document.createElement("button");
      hapus.type = "button";
      hapus.dataset.aksi = "hapus";
      hapus.textContent = "Hapus";
      aksi.append(pilih, hapus);
    } else {
      const simpan = document.createElement("button");
      simpan.type = "button";
      simpan.dataset.aksi = "simpan";
      simpan.disabled = sudahTersimpan;
      simpan.textContent = sudahTersimpan ? "✓ Tersimpan" : "Simpan";
      aksi.appendChild(simpan);
    }

    isi.append(judul, penulis, tahun, aksi);
    kartu.append(gambar, isi);
    this.replaceChildren(kartu);
  }
}
customElements.define("kartu-buku", KartuBuku);

/* =========================================================
   Modul 9 — Pesan berdasarkan status code HTTP
   ========================================================= */
function pesanDariStatus(status) {
  if (status === 404) return "Data tidak ditemukan di server.";
  if (status === 400) return "Permintaan tidak valid.";
  if (status === 429) return "Terlalu banyak permintaan. Tunggu sebentar lalu coba lagi.";
  if (status >= 500) return "Server sedang bermasalah. Coba lagi nanti.";
  return `Terjadi kesalahan (kode ${status}).`;
}

/* =========================================================
   Modul 8 — Fetch API + async/await + JSON
   ========================================================= */
async function ambilBuku(kataKunci) {
  const params = new URLSearchParams({
    q: kataKunci,
    limit: 12,
    fields: "key,title,author_name,first_publish_year,cover_i",
  });

  const response = await fetch(`${API_CARI}?${params}`);
  if (!response.ok) {
    throw new Error(pesanDariStatus(response.status));
  }
  const data = await response.json();

  // Ubah bentuk data API menjadi bentuk yang dipakai aplikasi
  return data.docs.map((doc) => ({
    id: doc.key,
    judul: doc.title || "Tanpa judul",
    penulis: Array.isArray(doc.author_name) && doc.author_name.length
      ? doc.author_name.slice(0, 2).join(", ")
      : "Penulis tidak diketahui",
    tahun: doc.first_publish_year || null,
    cover: doc.cover_i || null,
  }));
}

/* =========================================================
   Modul 6 — Validasi form pencarian
   ========================================================= */
function validasiKataKunci(teks) {
  if (teks === "") return "Kata kunci tidak boleh kosong.";
  if (teks.length < 2) return "Kata kunci minimal 2 karakter.";
  return "";
}

function tampilkanError(pesan) {
  pesanError.textContent = pesan;
  inputKata.classList.toggle("invalid", pesan !== "");
}

/* =========================================================
   Modul 4–5 — DOM & Event
   ========================================================= */
let timerNotif;
function tampilkanNotif(pesan) {
  notif.textContent = pesan;
  notif.classList.add("tampil");
  clearTimeout(timerNotif);
  timerNotif = setTimeout(() => notif.classList.remove("tampil"), 2200);
}

function tampilkanLoading() {
  statusEl.replaceChildren();
  const spinner = document.createElement("span");
  spinner.className = "spinner";
  statusEl.append(spinner, "Memuat buku…");
}

function sudahDiRak(id) {
  return rak.some((b) => b.id === id);
}

function renderHasil(daftar) {
  daftarHasil.replaceChildren();
  daftar.forEach((buku) => {
    const kartu = document.createElement("kartu-buku");
    kartu.setAttribute("mode", "hasil");
    if (sudahDiRak(buku.id)) kartu.setAttribute("tersimpan", "");
    kartu.buku = buku;
    daftarHasil.appendChild(kartu);
  });
}

function renderRak() {
  const filter = filterStatus.value;
  const tampil = rak.filter((b) => filter === "semua" || b.status === filter);

  jumlahRak.textContent = rak.length;
  daftarRak.replaceChildren();

  if (rak.length === 0) {
    rakKosong.textContent = "Rak masih kosong. Cari buku dan simpan di sini.";
  } else if (tampil.length === 0) {
    rakKosong.textContent = "Tidak ada buku dengan status ini.";
  } else {
    rakKosong.textContent = "";
  }

  tampil.forEach((buku) => {
    const kartu = document.createElement("kartu-buku");
    kartu.setAttribute("mode", "rak");
    kartu.buku = buku;
    daftarRak.appendChild(kartu);
  });
}

/* ---------- Submit pencarian ---------- */
formCari.addEventListener("submit", async (e) => {
  e.preventDefault();
  const kataKunci = inputKata.value.trim();

  const error = validasiKataKunci(kataKunci);
  tampilkanError(error);
  if (error) return;

  tombolCari.disabled = true;
  tombolCari.textContent = "Mencari…";
  daftarHasil.replaceChildren();
  tampilkanLoading();

  try {
    const hasil = await ambilBuku(kataKunci);
    if (hasil.length === 0) {
      statusEl.textContent = "Buku tidak ditemukan. Coba kata kunci lain.";
    } else {
      statusEl.textContent = `Ditemukan ${hasil.length} buku untuk "${kataKunci}".`;
      renderHasil(hasil);
    }
  } catch (err) {
    const jaringan = err instanceof TypeError; // fetch gagal total (offline, dll.)
    statusEl.textContent = jaringan
      ? "Gagal memuat data. Periksa koneksi internet lalu coba lagi."
      : err.message;
  } finally {
    tombolCari.disabled = false;
    tombolCari.textContent = "Cari";
  }
});

inputKata.addEventListener("input", () => tampilkanError(""));

/* ---------- Event delegation: tombol Simpan di hasil ---------- */
daftarHasil.addEventListener("click", (e) => {
  const tombol = e.target.closest('button[data-aksi="simpan"]');
  if (!tombol) return;

  const kartu = tombol.closest("kartu-buku");
  const buku = kartu.buku;
  if (sudahDiRak(buku.id)) {
    tampilkanNotif("Buku sudah ada di rak.");
    return;
  }
  rak.push({ ...buku, status: "ingin" });
  simpanRak();
  kartu.setAttribute("tersimpan", "");
  renderRak();
  tampilkanNotif(`"${buku.judul}" disimpan ke rak.`);
});

/* ---------- Event delegation: Hapus & ubah status di rak ---------- */
daftarRak.addEventListener("click", (e) => {
  const tombol = e.target.closest('button[data-aksi="hapus"]');
  if (!tombol) return;

  const buku = tombol.closest("kartu-buku").buku;
  if (!confirm(`Hapus "${buku.judul}" dari rak?`)) return;

  rak = rak.filter((b) => b.id !== buku.id);
  simpanRak();
  renderRak();
  // Aktifkan lagi tombol Simpan pada hasil pencarian (jika buku itu sedang tampil)
  daftarHasil.querySelectorAll("kartu-buku").forEach((k) => {
    if (k.buku && k.buku.id === buku.id) k.removeAttribute("tersimpan");
  });
  tampilkanNotif("Buku dihapus dari rak.");
});

daftarRak.addEventListener("change", (e) => {
  if (!e.target.matches('select[data-aksi="status"]')) return;

  const buku = e.target.closest("kartu-buku").buku;
  const target = rak.find((b) => b.id === buku.id);
  if (!target) return;
  target.status = e.target.value;
  buku.status = e.target.value;
  simpanRak();
  tampilkanNotif("Status diperbarui.");
  if (filterStatus.value !== "semua") renderRak();
});

filterStatus.addEventListener("change", renderRak);

/* ---------- Navigasi antar bagian ---------- */
const tautan = document.querySelectorAll("nav a[data-tab]");
const bagian = { cari: document.querySelector("#cari"), rak: document.querySelector("#rak") };

function bukaTab(nama) {
  Object.entries(bagian).forEach(([kunci, el]) => { el.hidden = kunci !== nama; });
  tautan.forEach((a) => a.classList.toggle("aktif", a.dataset.tab === nama));
  if (nama === "rak") renderRak();
}

tautan.forEach((a) => {
  a.addEventListener("click", (e) => {
    e.preventDefault();
    bukaTab(a.dataset.tab);
  });
});

/* ---------- Mulai ---------- */
renderRak();