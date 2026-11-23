"use strict";

/* =============================================================
   MODUL 12 — COMPONENT-BASED UI (Shadow DOM, Slot, Custom Event)
   Bagian B — Kegiatan Praktikum : script.js
   Mata Kuliah: Pemrograman Berbasis Web (PROG31W)

   Program KUMULATIF (melanjutkan Modul 3-8 dan Modul 11), DENGAN perubahan Modul 12:
     - muatArtikel() dari Modul 11 DIHAPUS: pengambilan data kini dilakukan
       <daftar-artikel> (komponen.js, B.6).
     - Halaman tidak lagi menangani klik tombol, melainkan MENDENGARKAN
       CustomEvent dari komponen: "suka", "hapus-artikel", "artikel-dimuat",
       dan "hapus-komentar".
     - Like disimpan ke localStorage (Tugas Mandiri 1).
     - Komentar dirender sebagai <kartu-komentar> (Tugas Mandiri 2).
   Komponen didefinisikan di komponen.js (ditautkan sebelum file ini).
   ============================================================= */

const BASE = "https://jsonplaceholder.typicode.com";


/* ===================== Dark Mode (Modul 3 + 6) ===================== */
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


/* ===================== B.5 - B.6 — Event dari <kartu-artikel> ===================== */
// <daftar-artikel> (komponen.js) mengambil data sendiri. Halaman hanya
// MENDENGARKAN event dengan satu listener pada container (event delegation).
const wadah = document.querySelector(".daftar-artikel");

// Jumlah like per artikel disimpan di localStorage: { "1": 3, "4": 1 }
function ambilLike() { return JSON.parse(localStorage.getItem("like")) || {}; }
function simpanLike(obj) { localStorage.setItem("like", JSON.stringify(obj)); }

if (wadah) {
  // Event "suka" (CustomEvent dari kartu): e.target = <kartu-artikel> (host)
  wadah.addEventListener("suka", (e) => {
    const kartu = e.target;
    const judul = kartu.querySelector('[slot="judul"]').textContent;
    console.log(`"${judul}" disukai: ${e.detail.jumlah} kali`);

    const like = ambilLike();
    like[kartu.dataset.id] = e.detail.jumlah;
    simpanLike(like);
  });

  // Event "hapus-artikel": KOMPONEN hanya melapor, HALAMAN yang menghapus
  wadah.addEventListener("hapus-artikel", (e) => {
    const kartu = e.target;
    const like = ambilLike();
    delete like[kartu.dataset.id];
    simpanLike(like);
    kartu.remove();
  });

  // Event "artikel-dimuat": pulihkan jumlah like lewat atribut "like"
  wadah.addEventListener("artikel-dimuat", () => {
    const like = ambilLike();
    wadah.querySelectorAll("kartu-artikel").forEach((kartu) => {
      const tersimpan = like[kartu.dataset.id];
      if (tersimpan) kartu.setAttribute("like", tersimpan);
    });
  });
}


/* ===================== Profil penulis dari API (Modul 7) ===================== */
async function muatProfilPenulis() {
  const namaEl = document.querySelector("#nama-penulis");
  const emailEl = document.querySelector("#email-penulis");
  if (!namaEl || !emailEl) return;
  try {
    const res = await fetch(BASE + "/users/1");
    if (!res.ok) throw new Error("Status: " + res.status);
    const user = await res.json();
    namaEl.textContent = user.name;
    emailEl.textContent = user.email;
  } catch (error) {
    console.error("Gagal memuat profil penulis:", error);
  }
}
muatProfilPenulis();


/* ===================== Komentar: POST + DELETE (Modul 8) ===================== */
const formKomentar = document.querySelector("#form-komentar");
const daftarKomentar = document.querySelector("#daftar-komentar");

function ambilKomentar() { return JSON.parse(localStorage.getItem("komentar")) || []; }
function simpanKomentarArr(arr) { localStorage.setItem("komentar", JSON.stringify(arr)); }

function pesanDariStatus(status) {
  if (status === 404) return "Data tidak ditemukan di server.";
  if (status === 400) return "Data yang dikirim tidak valid.";
  if (status >= 500) return "Server sedang bermasalah, coba lagi nanti.";
  return "Terjadi kesalahan tidak terduga.";
}

// Modul 12: komentar dirender sebagai <kartu-komentar> dengan SLOT.
// Nama masuk ke slot "nama", pesan ke slot default. Data pengguna tetap
// diisi lewat textContent (aman dari XSS).
function renderKomentar(k) {
  const kartu = document.createElement("kartu-komentar");
  kartu.dataset.id = k.id;

  const nama = document.createElement("strong");
  nama.slot = "nama";
  nama.textContent = k.nama;

  const pesan = document.createElement("span");
  pesan.textContent = k.pesan;

  kartu.append(nama, pesan);
  daftarKomentar.appendChild(kartu);
}

async function kirimKomentarKeServer(nama, pesan) {
  const res = await fetch(BASE + "/comments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: nama, body: pesan, postId: 1 }),
  });
  if (!res.ok) throw new Error("Gagal mengirim komentar, status: " + res.status);
  return await res.json();
}

if (formKomentar && daftarKomentar) {
  ambilKomentar().forEach(renderKomentar);

  formKomentar.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nama = document.querySelector("#input-nama").value.trim();
    const pesan = document.querySelector("#input-pesan").value.trim();
    if (nama === "" || pesan === "") {
      alert("Nama dan komentar wajib diisi!");
      return;
    }
    try {
      const hasil = await kirimKomentarKeServer(nama, pesan);
      const k = { id: hasil.id, nama, pesan };
      renderKomentar(k);
      const arr = ambilKomentar(); arr.push(k); simpanKomentarArr(arr);
      formKomentar.reset();
    } catch (error) {
      alert("Gagal mengirim komentar, silakan coba lagi.");
      console.error(error);
    }
  });

  // Modul 12: tombol Hapus ada di dalam shadow tree <kartu-komentar>, jadi
  // halaman mendengarkan CustomEvent "hapus-komentar", bukan event "click".
  daftarKomentar.addEventListener("hapus-komentar", async (e) => {
    const kartu = e.target;
    const id = e.detail.id;
    try {
      const res = await fetch(`${BASE}/comments/${id}`, { method: "DELETE" });
      if (!res.ok) { alert(pesanDariStatus(res.status)); return; }
      kartu.remove();
      simpanKomentarArr(ambilKomentar().filter((k) => String(k.id) !== String(id)));
    } catch (error) {
      alert("Terjadi kesalahan jaringan saat menghapus komentar.");
      console.error(error);
    }
  });
}

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
    if (confirm("Hapus semua data tersimpan (tema, komentar, like)?")) {
      localStorage.clear();
      location.reload();
    }
  });
}
