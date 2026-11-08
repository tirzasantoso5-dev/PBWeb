"use strict";

/* =============================================================
   MODUL 8 — KONSUMSI REST API
   Bagian B — Kegiatan Praktikum (program lengkap: script.js)
   Mata Kuliah: Pemrograman Berbasis Web (PROG31W)

   File KUMULATIF (melanjutkan modul sebelumnya):
     - Modul 3 (DOM) · Modul 4 (Event Handling) · Modul 5 (Validasi)
     - Modul 6 (localStorage) · Modul 7 (Fetch GET)
     - Modul 8 (POST, PATCH, DELETE)   <-- fokus modul ini

   Perubahan utama Modul 8:
     - Komentar dikirim ke server dengan POST (B.2) & ditampilkan
       beserta id dari server (B.3).
     - Jumlah Like juga diperbarui ke server dengan PATCH (B.4).
     - Komentar dihapus dari server dengan DELETE (B.5).
     - Pesan error dibedakan berdasarkan status code (B.6).
   Berpasangan dengan index.html & style.css pada paket yang sama.
   ============================================================= */

const BASE = "https://jsonplaceholder.typicode.com";


/* ============ B.6 — Pesan berbeda berdasarkan status code ============ */
function pesanDariStatus(status) {
  if (status === 404) return "Data tidak ditemukan di server.";
  if (status === 400) return "Data yang dikirim tidak valid.";
  if (status >= 500) return "Server sedang bermasalah, coba lagi nanti.";
  return "Terjadi kesalahan tidak terduga.";
}


/* ===================== Dark Mode (Modul 6) ===================== */
const tombolTema = document.querySelector("#btn-tema");
function toggleTema() {
  document.body.classList.toggle("dark-mode");
  localStorage.setItem("tema", document.body.classList.contains("dark-mode") ? "dark" : "light");
}
if (tombolTema) tombolTema.addEventListener("click", toggleTema);
if (localStorage.getItem("tema") === "dark") document.body.classList.add("dark-mode");

const tombolInfo = document.querySelector("#btn-info");
const kotakAside = document.querySelector("aside");
if (tombolInfo && kotakAside) {
  tombolInfo.addEventListener("click", () => kotakAside.classList.toggle("tersembunyi"));
}


/* ===================== Artikel dari API (Modul 7) + Like PATCH (Modul 8) ===================== */
const containerArtikel = document.querySelector(".daftar-artikel");

if (containerArtikel) {
  const loading = document.querySelector("#loading");

  async function muatArtikelDariAPI() {
    if (loading) loading.style.display = "block";
    try {
      const response = await fetch(BASE + "/posts?_limit=5");
      if (!response.ok) throw new Error("Status: " + response.status);
      const daftarPost = await response.json();

      const semuaLike = JSON.parse(localStorage.getItem("semuaLike")) || {};
      daftarPost.forEach((post) => {
        const article = document.createElement("article");
        article.dataset.postId = post.id;             // dipakai untuk PATCH like (B.4)

        const judul = document.createElement("h3");
        judul.textContent = post.title;

        const isi = document.createElement("p");
        isi.textContent = post.body;

        const tombolLike = document.createElement("button");
        let jumlahLike = semuaLike[post.title] || 0;
        tombolLike.textContent = `Like (${jumlahLike})`;
        tombolLike.dataset.like = jumlahLike;

        const tombolHapus = document.createElement("button");
        tombolHapus.textContent = "Hapus";

        article.appendChild(judul);
        article.appendChild(isi);
        article.appendChild(tombolLike);
        article.appendChild(tombolHapus);
        containerArtikel.appendChild(article);
      });
    } catch (error) {
      containerArtikel.innerHTML = "<p>Gagal memuat artikel, silakan coba lagi nanti.</p>";
      console.error("Gagal mengambil data:", error);
    } finally {
      if (loading) loading.style.display = "none";
    }
  }
  muatArtikelDariAPI();

  // hover (Modul 4)
  containerArtikel.addEventListener("mouseover", (e) => {
    const a = e.target.closest("article"); if (a) a.classList.add("artikel-hover");
  });
  containerArtikel.addEventListener("mouseout", (e) => {
    const a = e.target.closest("article"); if (a) a.classList.remove("artikel-hover");
  });

  // Like: tambah angka, simpan localStorage (Modul 6) + PATCH ke server (Modul 8 · B.4)
  containerArtikel.addEventListener("click", (e) => {
    if (e.target.tagName === "BUTTON" && e.target.textContent.startsWith("Like")) {
      let jumlah = parseInt(e.target.dataset.like || 0);
      jumlah++;
      e.target.dataset.like = jumlah;
      e.target.textContent = `Like (${jumlah})`;

      const article = e.target.closest("article");
      const judul = article.querySelector("h3").textContent;
      simpanLike(judul, jumlah);                        // Modul 6
      perbaruiLikeKeServer(article.dataset.postId, jumlah); // Modul 8
    }
  });

  // Hapus artikel (Modul 3)
  containerArtikel.addEventListener("click", (e) => {
    if (e.target.tagName === "BUTTON" && e.target.textContent === "Hapus") {
      e.target.closest("article").remove();
    }
  });
}

function simpanLike(judulArtikel, jumlah) {
  const semuaLike = JSON.parse(localStorage.getItem("semuaLike")) || {};
  semuaLike[judulArtikel] = jumlah;
  localStorage.setItem("semuaLike", JSON.stringify(semuaLike));
}

/* B.4 — PATCH jumlah like ke server (endpoint /posts/id sebagai simulasi) */
async function perbaruiLikeKeServer(postId, jumlahLike) {
  try {
    const response = await fetch(`${BASE}/posts/${postId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ likes: jumlahLike }),
    });
    if (!response.ok) throw new Error("Status: " + response.status);
    console.log("Like berhasil diperbarui di server");
  } catch (error) {
    console.error("Gagal memperbarui like:", error);
  }
}


/* ===================== Profil penulis dari API (Modul 7) ===================== */
async function muatProfilPenulis() {
  const namaEl = document.querySelector("#nama-penulis");
  const emailEl = document.querySelector("#email-penulis");
  if (!namaEl || !emailEl) return;
  try {
    const response = await fetch(BASE + "/users/1");
    if (!response.ok) throw new Error("Status: " + response.status);
    const user = await response.json();
    namaEl.textContent = user.name;
    emailEl.textContent = user.email;
  } catch (error) {
    console.error("Gagal memuat profil penulis:", error);
  }
}
muatProfilPenulis();


/* ===================== Komentar: POST, PATCH (edit), DELETE (Modul 8) ===================== */
const formKomentar = document.querySelector("#form-komentar");
const daftarKomentar = document.querySelector("#daftar-komentar");

/* penyimpanan lokal agar komentar tetap tampil setelah refresh (Modul 6) */
function ambilKomentar() { return JSON.parse(localStorage.getItem("komentar")) || []; }
function simpanKomentarArr(arr) { localStorage.setItem("komentar", JSON.stringify(arr)); }

/* TUGAS 2 — satu fungsi untuk semua request; kalau gagal, status code ikut disimpan
   di error.status supaya pesanDariStatus() bisa dipakai di POST, PATCH, dan DELETE */
async function panggilAPI(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) {
    const err = new Error("Status: " + response.status);
    err.status = response.status;
    throw err;
  }
  return await response.json().catch(() => ({})); // DELETE bisa membalas body kosong
}
function pesanError(error) {
  return error.status ? pesanDariStatus(error.status)
 : "Gagal terhubung ke server, periksa koneksi internet.";
}

/* TUGAS 3 — loading: nonaktifkan tombol selama request berjalan */
async function denganLoading(tombol, teksSementara, aksi) {
  const teksAsli = tombol.textContent;
  tombol.disabled = true;
  tombol.textContent = teksSementara;
  try {
    return await aksi();
  } finally {
    tombol.disabled = false;
    tombol.textContent = teksAsli;
  }
}

/* render satu komentar + tombol Edit & Hapus; dataset.id = id dari server (B.3) */
function renderKomentar(k) {
  const li = document.createElement("li");
  li.dataset.id = k.id;

  const teks = document.createElement("span");
  teks.className = "teks-komentar";
  teks.textContent = `${k.nama}: ${k.pesan} `;

  const tombolEdit = document.createElement("button");
  tombolEdit.textContent = "Edit";
  tombolEdit.dataset.aksi = "edit";

  const tombolHapus = document.createElement("button");
  tombolHapus.textContent = "Hapus";
  tombolHapus.dataset.aksi = "hapus";

  li.append(teks, tombolEdit, tombolHapus);
  daftarKomentar.appendChild(li);
}

/* B.2 — kirim komentar baru dengan POST */
function kirimKomentarKeServer(nama, pesan) {
  return panggilAPI(BASE + "/comments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: nama, body: pesan, postId: 1 }),
  }); // server membalas data + id baru
}

/* TUGAS 1 — perbarui komentar dengan PATCH */
function perbaruiKomentarKeServer(id, nama, pesan) {
  return panggilAPI(`${BASE}/comments/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: nama, body: pesan }),
  });
}

if (formKomentar && daftarKomentar) {
  ambilKomentar().forEach(renderKomentar); // tampilkan komentar tersimpan saat halaman dibuka

  const inputNamaKomentar = document.querySelector("#input-nama");
  const inputPesanKomentar = document.querySelector("#input-pesan");
  const tombolKirim = formKomentar.querySelector("button[type='submit']");
  let idSedangDiedit = null; // null = mode tambah (POST), berisi id = mode edit (PATCH)

  function keluarModeEdit() {
    idSedangDiedit = null;
    tombolKirim.textContent = "Kirim";
    formKomentar.reset();
  }

  formKomentar.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nama = inputNamaKomentar.value.trim();
    const pesan = inputPesanKomentar.value.trim();
    if (nama === "" || pesan === "") {           // validasi (Modul 4-5) dipertahankan
      alert("Nama dan komentar wajib diisi!");
      return;
    }

    try {
      if (idSedangDiedit === null) {
        // ---- mode tambah: POST ----
        const hasil = await denganLoading(tombolKirim, "Mengirim...",
          () => kirimKomentarKeServer(nama, pesan));
        const k = { id: hasil.id, nama: nama, pesan: pesan };   // B.3: simpan id server
        renderKomentar(k);
        const arr = ambilKomentar(); arr.push(k); simpanKomentarArr(arr);
        formKomentar.reset();
        console.log("Komentar tersimpan di server dengan id:", hasil.id);
      } else {
        // ---- mode edit: PATCH ----
        const id = idSedangDiedit;
        await denganLoading(tombolKirim, "Menyimpan...",
          () => perbaruiKomentarKeServer(id, nama, pesan));
        const li = daftarKomentar.querySelector(`li[data-id="${id}"]`);
        if (li) li.querySelector(".teks-komentar").textContent = `${nama}: ${pesan} `;
        simpanKomentarArr(ambilKomentar().map((k) =>
          String(k.id) === String(id) ? { ...k, nama, pesan } : k));
        keluarModeEdit();
        console.log("Komentar berhasil diperbarui, id:", id);
      }
    } catch (error) {
      alert(pesanError(error));                  // TUGAS 2: pesan sesuai status code
      console.error(error);
    }
  });

  /* Edit & Hapus lewat event delegation */
  daftarKomentar.addEventListener("click", async (e) => {
    const tombol = e.target.closest("button");
    if (!tombol) return;
    const li = tombol.closest("li");
    const id = li.dataset.id;

    if (tombol.dataset.aksi === "edit") {
      // tampilkan kembali isi komentar ke form
      const k = ambilKomentar().find((x) => String(x.id) === String(id));
      if (!k) return;
      inputNamaKomentar.value = k.nama;
      inputPesanKomentar.value = k.pesan;
      idSedangDiedit = id;
      tombolKirim.textContent = "Simpan Perubahan";
      inputPesanKomentar.focus();
      return;
    }

    if (tombol.dataset.aksi === "hapus") {
      try {
        await denganLoading(tombol, "Menghapus...", () =>
          panggilAPI(`${BASE}/comments/${id}`, { method: "DELETE" }));
        li.remove();
        simpanKomentarArr(ambilKomentar().filter((k) => String(k.id) !== String(id)));
        if (String(idSedangDiedit) === String(id)) keluarModeEdit();
      } catch (error) {
        alert(pesanError(error));                // TUGAS 2
        console.error(error);
      }
    }
  });
}

/* Keyboard shortcut "d" untuk dark mode (abaikan saat mengetik) */
document.addEventListener("keydown", (e) => {
  const tag = e.target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA") return;
  if (e.key.toLowerCase() === "d") toggleTema();
});


/* ===================== Validasi Form (Modul 5) ===================== */
const inputNama = document.querySelector("#input-nama");
if (inputNama) {
  inputNama.addEventListener("input", () => {
    if (inputNama.validity.valueMissing) inputNama.setCustomValidity("Nama wajib diisi");
    else if (inputNama.validity.tooShort) inputNama.setCustomValidity("Nama minimal 3 karakter");
    else inputNama.setCustomValidity("");
  });
}
const inputPesan = document.querySelector("#input-pesan");
if (inputPesan) {
  inputPesan.addEventListener("input", () => {
    if (inputPesan.validity.valueMissing) inputPesan.setCustomValidity("Komentar wajib diisi");
    else if (inputPesan.validity.tooShort) inputPesan.setCustomValidity("Komentar minimal 5 karakter");
    else inputPesan.setCustomValidity("");
  });
}

const formDaftar = document.querySelector("#form-daftar");
const errorKonfirmasi = document.querySelector("#error-konfirmasi");
if (formDaftar && errorKonfirmasi) {
  formDaftar.addEventListener("submit", (e) => {
    e.preventDefault();
    const password = document.querySelector("#password").value;
    const konfirmasi = document.querySelector("#konfirmasi").value;
    if (password !== konfirmasi) {
      errorKonfirmasi.textContent = "Konfirmasi password tidak sama dengan password";
    } else {
      errorKonfirmasi.textContent = "";
      alert("Pendaftaran berhasil (simulasi)!");
      formDaftar.reset();
    }
  });
}
function validasiField(input, errorElement) {
  errorElement.textContent = input.checkValidity() ? "" : input.validationMessage;
}
[
  ["#username", "#error-username"],
  ["#email", "#error-email"],
  ["#password", "#error-password"],
].forEach(([f, er]) => {
  const field = document.querySelector(f);
  const errEl = document.querySelector(er);
  if (field && errEl) field.addEventListener("input", () => validasiField(field, errEl));
});


/* ===================== Reset data (Modul 6) ===================== */
const tombolReset = document.querySelector("#btn-reset");
if (tombolReset) {
  tombolReset.addEventListener("click", () => {
    if (confirm("Hapus semua data tersimpan (tema, like, komentar)?")) {
      localStorage.clear();
      location.reload();
    }
  });
}