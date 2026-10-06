// Langkah 1: variabel dan seleksi elemen dasar
const judulSitus = document.querySelector("header h1");
console.log(judulSitus);
console.log(judulSitus.textContent);

// pindah halaman (dari Modul 1-2)
function tampilkanHalaman(nomor) {
    document.querySelectorAll('.halaman').forEach(h => h.classList.remove('aktif'));
    document.getElementById('halaman' + nomor).classList.add('aktif');
}

// Langkah 2: fungsi dan tombol Dark Mode
const tombolTema = document.querySelector("#btn-tema");

function toggleTema() {
    document.body.classList.toggle("dark-mode");
}

tombolTema.addEventListener("click", toggleTema);

// Langkah 3: tombol tampilkan/sembunyikan aside
const tombolInfo = document.querySelector("#btn-info");
const kotakAside = document.querySelector("aside");

tombolInfo.addEventListener("click", () => {
    kotakAside.classList.toggle("tersembunyi");
});

// Langkah 4: render portofolio dari data JavaScript
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

    // MODUL 5 (B.3 Langkah 2): tombol Like pada tiap artikel
    const tombolLike = document.createElement("button");
    let jumlahLike = 0;
    tombolLike.textContent = `Like (${jumlahLike})`;

    // Langkah 5: tombol hapus pada tiap item
    const tombolHapus = document.createElement("button");
    tombolHapus.textContent = "Hapus";

    article.appendChild(judul);
    article.appendChild(waktu);
    article.appendChild(isi);
    article.appendChild(tombolLike);
    article.appendChild(tombolHapus);
    containerPortofolio.appendChild(article);
});

// Langkah 5: event delegation pada container
// MODUL 5: diperiksa teks tombolnya agar tidak tertukar dengan tombol Like
containerPortofolio.addEventListener("click", (e) => {
    if (e.target.tagName === "BUTTON" &&
        e.target.textContent === "Hapus") {
        e.target.closest("article").remove();
    }
});

// Tugas Modul 4: tombol tambah satu item portofolio baru
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

    // MODUL 5: item baru juga punya tombol Like
    const tombolLike = document.createElement("button");
    tombolLike.textContent = "Like (0)";

    const tombolHapus = document.createElement("button");
    tombolHapus.textContent = "Hapus";

    article.appendChild(judul);
    article.appendChild(waktu);
    article.appendChild(isi);
    article.appendChild(tombolLike);
    article.appendChild(tombolHapus);
    containerPortofolio.appendChild(article);
});

/* ================= MODUL 5 : EVENT HANDLING ================= */

// B.2 Langkah 1: efek hover pada artikel (mouseover & mouseout, delegation)
containerPortofolio.addEventListener("mouseover", (e) => {
    const article = e.target.closest("article");
    if (article) article.classList.add("artikel-hover");
});
containerPortofolio.addEventListener("mouseout", (e) => {
    const article = e.target.closest("article");
    if (article) article.classList.remove("artikel-hover");
});

// B.3 Langkah 2: tombol Like via event delegation
containerPortofolio.addEventListener("click", (e) => {
    if (e.target.tagName === "BUTTON" &&
        e.target.textContent.startsWith("Like")) {
        let jumlah = parseInt(e.target.dataset.like || 0);
        jumlah++;
        e.target.dataset.like = jumlah;
        e.target.textContent = `Like (${jumlah})`;
    }
});

// B.4 Langkah 3 + B.5 Langkah 4: form komentar, preventDefault, render ke DOM
const formKomentar = document.querySelector("#form-komentar");
const daftarKomentar = document.querySelector("#daftar-komentar");
const pesanError = document.querySelector("#pesan-error");

formKomentar.addEventListener("submit", (e) => {
    e.preventDefault();
    const nama = document.querySelector("#input-nama").value.trim();
    const pesan = document.querySelector("#input-pesan").value.trim();

    // Tugas: validasi (minimal 5 karakter) dengan pesan error di halaman, bukan alert()
    if (nama === "" || pesan === "") {
        pesanError.textContent = "Nama dan komentar wajib diisi!";
        return;
    }
    if (pesan.length < 5) {
        pesanError.textContent = "Komentar minimal 5 karakter!";
        return;
    }
    pesanError.textContent = "";

    const itemKomentar = document.createElement("li");
    itemKomentar.textContent = `${nama}: ${pesan} `;

    // Tugas: tombol hapus pada tiap komentar
    const tombolHapusKomentar = document.createElement("button");
    tombolHapusKomentar.textContent = "Hapus";
    itemKomentar.appendChild(tombolHapusKomentar);

    daftarKomentar.appendChild(itemKomentar);
    formKomentar.reset(); // mengosongkan form setelah dikirim
});

// Tugas: event delegation agar tiap komentar punya tombol hapus sendiri
daftarKomentar.addEventListener("click", (e) => {
    if (e.target.tagName === "BUTTON") {
        e.target.closest("li").remove();
    }
});

// Tugas: tombol "Hapus semua komentar"
const tombolHapusSemua = document.querySelector("#btn-hapus-semua");

tombolHapusSemua.addEventListener("click", () => {
    daftarKomentar.innerHTML = "";
});

// B.6 Langkah 5: keyboard shortcut dark mode (tombol "d")
// Tidak berlaku saat mengetik di input/textarea agar tidak mengganggu pengetikan
document.addEventListener("keydown", (e) => {
    const tag = e.target.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA") return;

    if (e.key.toLowerCase() === "d") {
        document.body.classList.toggle("dark-mode");
    }
});

// Tugas opsional: event scroll pada window -> tombol "kembali ke atas"
const tombolAtas = document.querySelector("#btn-atas");

window.addEventListener("scroll", () => {
    if (window.scrollY > 200) {
        tombolAtas.classList.remove("tersembunyi");
    } else {
        tombolAtas.classList.add("tersembunyi");
    }
});

tombolAtas.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
});