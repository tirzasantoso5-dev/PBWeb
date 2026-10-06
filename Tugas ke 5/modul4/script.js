// Langkah 1: variabel dan seleksi elemen dasar
const judulSitus = document.querySelector("header h1");
console.log(judulSitus);
console.log(judulSitus.textContent);

function tampilkanHalaman(nomor) {
    document.querySelectorAll('.halaman').forEach(h => h.classList.remove('aktif'));
    document.getElementById('halaman' + nomor).classList.add('aktif');
}

const tombolTema = document.querySelector("#btn-tema");

function toggleTema() {
    document.body.classList.toggle("dark-mode");
}

tombolTema.addEventListener("click", toggleTema);

const tombolInfo = document.querySelector("#btn-info");
const kotakAside = document.querySelector("aside");

tombolInfo.addEventListener("click", () => {
    kotakAside.classList.toggle("tersembunyi");
});

const daftarPortofolio = [
    { judul: "Website Profil Diri", tanggal: "2026",
      isi: "Halaman profil pribadi dibuat dengan HTML, CSS, dan JavaScript." },
    { judul: "Pendakian Gunung Prau", tanggal: "2026",
      isi: "Pengalaman mendaki Gunung Prau." },
    { judul: "Mahasiswa Informatika", tanggal: "2026",
      isi: "Belajar pemrograman dan pengembangan website di Universitas Sanata Dharma." },
];

const containerPortofolio = document.querySelector(".daftar-portofolio");

daftarPortofolio.forEach((data) => {
    const article = document.createElement("article");

    const judul = document.createElement("h3");
    judul.textContent = data.judul;

    const waktu = document.createElement("time");
    waktu.textContent = data.tanggal;

    const isi = document.createElement("p");
    isi.textContent = data.isi;

    const tombolHapus = document.createElement("button");
    tombolHapus.textContent = "Hapus";
    article.appendChild(judul);
    article.appendChild(waktu);
    article.appendChild(isi);
    article.appendChild(tombolHapus);
    containerPortofolio.appendChild(article);
});

containerPortofolio.addEventListener("click", (e) => {
    if (e.target.tagName === "BUTTON") {
        e.target.closest("article").remove();
    }
});

const tombolTambah = document.querySelector("#btn-tambah");

tombolTambah.addEventListener("click", () => {
    const judulBaru = prompt("Judul portofolio:");
    const isiBaru = prompt("Deskripsi singkat:");
    if (!judulBaru || !isiBaru) return;

    const article = document.createElement("article");

    const judul = document.createElement("h3");
    judul.textContent = judulBaru;

    const waktu = document.createElement("time");
    waktu.textContent = new Date().getFullYear();

    const isi = document.createElement("p");
    isi.textContent = isiBaru;

    const tombolHapus = document.createElement("button");
    tombolHapus.textContent = "Hapus";

    article.appendChild(judul);
    article.appendChild(waktu);
    article.appendChild(isi);
    article.appendChild(tombolHapus);
    containerPortofolio.appendChild(article);
});