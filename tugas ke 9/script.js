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
    const temaSekarang = document.body.classList.contains("dark-mode")
        ? "dark" : "light";
    localStorage.setItem("tema", temaSekarang);
}

tombolTema.addEventListener("click", toggleTema);

function muatPreferensiTema() {
    const tema = localStorage.getItem("tema");
    if (tema === "dark") {
        document.body.classList.add("dark-mode");
    }
}
muatPreferensiTema();

const tombolInfo = document.querySelector("#btn-info");
const kotakAside = document.querySelector("aside");

tombolInfo.addEventListener("click", () => {
    kotakAside.classList.toggle("tersembunyi");
    // MODUL 7 (tugas 1): simpan status tampil/sembunyi aside
    localStorage.setItem("asideTersembunyi",
        kotakAside.classList.contains("tersembunyi"));
});

if (localStorage.getItem("asideTersembunyi") === "true") {
    kotakAside.classList.add("tersembunyi");
}

const daftarPortofolio = [
    { judul: "Website Profil Diri", tanggal: "2026",
      isi: "Halaman profil pribadi dibuat dengan HTML, CSS, dan JavaScript." },
    { judul: "Pendakian Gunung Prau", tanggal: "2026",
      isi: "Pengalaman mendaki Gunung Prau." },
    { judul: "Mahasiswa Informatika", tanggal: "2026",
      isi: "Belajar pemrograman dan pengembangan website di Universitas Sanata Dharma." },
];

const containerPortofolio = document.querySelector(".daftar-portofolio");

function simpanLike(judulArtikel, jumlah) {
    const semuaLike = JSON.parse(localStorage.getItem("semuaLike")) || {};
    semuaLike[judulArtikel] = jumlah;
    localStorage.setItem("semuaLike", JSON.stringify(semuaLike));
}

daftarPortofolio.forEach((data) => {
    const article = document.createElement("article");

    const judul = document.createElement("h3");
    judul.textContent = data.judul;

    const waktu = document.createElement("time");
    waktu.textContent = data.tanggal;

    const isi = document.createElement("p");
    isi.textContent = data.isi;

    const tombolLike = document.createElement("button");
    const semuaLike = JSON.parse(localStorage.getItem("semuaLike")) || {};
    let jumlahLike = semuaLike[data.judul] || 0;
    tombolLike.textContent = `Like (${jumlahLike})`;
    tombolLike.dataset.like = jumlahLike;
    
    const tombolHapus = document.createElement("button");
    tombolHapus.textContent = "Hapus";

    article.appendChild(judul);
    article.appendChild(waktu);
    article.appendChild(isi);
    article.appendChild(tombolLike);
    article.appendChild(tombolHapus);
    containerPortofolio.appendChild(article);
});

containerPortofolio.addEventListener("click", (e) => {
    if (e.target.tagName === "BUTTON" &&
        e.target.textContent === "Hapus") {
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

containerPortofolio.addEventListener("mouseover", (e) => {
    const article = e.target.closest("article");
    if (article) article.classList.add("artikel-hover");
});
containerPortofolio.addEventListener("mouseout", (e) => {
    const article = e.target.closest("article");
    if (article) article.classList.remove("artikel-hover");
});

containerPortofolio.addEventListener("click", (e) => {
    if (e.target.tagName === "BUTTON" &&
        e.target.textContent.startsWith("Like")) {
        let jumlah = parseInt(e.target.dataset.like || 0);
        jumlah++;
        e.target.dataset.like = jumlah;
        e.target.textContent = `Like (${jumlah})`;
        const judul = e.target.closest("article").querySelector("h3").textContent;
        simpanLike(judul, jumlah);
        const postId = e.target.closest("article").dataset.postId;
        if (postId) perbaruiLikeKeServer(postId, jumlah);   // MODUL 8 B.4: PATCH like ke server
    }
});

const formKomentar = document.querySelector("#form-komentar");
const daftarKomentar = document.querySelector("#daftar-komentar");
const pesanError = document.querySelector("#pesan-error");
const tombolKirim = formKomentar.querySelector("button[type='submit']");
let itemSedangDiedit = null; // null = mode tambah (POST), berisi <li> = mode edit (PATCH)

// MODUL 8 B.6: pesan berbeda berdasarkan status code
function pesanDariStatus(status) {
    if (status === 404) return "Data tidak ditemukan di server.";
    if (status === 400) return "Data yang dikirim tidak valid.";
    if (status >= 500) return "Server sedang bermasalah, coba lagi nanti.";
    return "Terjadi kesalahan tidak terduga.";
}

// tampilkan pesan error: dari status code (jika ada) atau masalah jaringan
function tampilkanError(error) {
    if (error instanceof TypeError) {
        alert("Gagal terhubung ke server, periksa koneksi internet.");
    } else {
        alert(error.message);   // sudah berisi pesanDariStatus(...)
    }
}

// komentar disimpan di localStorage bersama id dari server
function simpanKomentar(id, nama, pesan) {
    const daftar = JSON.parse(localStorage.getItem("komentar")) || [];
    daftar.push({ id, nama, pesan });
    localStorage.setItem("komentar", JSON.stringify(daftar));
}

function buatItemKomentar(id, nama, pesan) {
    const itemKomentar = document.createElement("li");
    if (id !== undefined && id !== null) {
        itemKomentar.dataset.id = id;      // B.3: simpan id server (untuk PATCH & DELETE)
    }

    const teks = document.createElement("span");
    teks.className = "teks-komentar";
    teks.textContent = `${nama}: ${pesan} `;

    const tombolEdit = document.createElement("button");
    tombolEdit.textContent = "Edit";

    const tombolHapusKomentar = document.createElement("button");
    tombolHapusKomentar.textContent = "Hapus";

    itemKomentar.appendChild(teks);
    itemKomentar.appendChild(tombolEdit);
    itemKomentar.appendChild(tombolHapusKomentar);
    return itemKomentar;
}

function muatKomentar() {
    const daftar = JSON.parse(localStorage.getItem("komentar")) || [];
    daftar.forEach((k) => {
        daftarKomentar.appendChild(buatItemKomentar(k.id, k.nama, k.pesan));
    });
}
muatKomentar();

// B.2 — kirim komentar baru dengan POST
async function kirimKomentarKeServer(nama, pesan) {
    const response = await fetch(URL_API + "/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nama, body: pesan, postId: 1 }),
    });
    if (!response.ok) {
        throw new Error(pesanDariStatus(response.status));
    }
    return await response.json();   // server membalas data + id baru
}

// Tugas mandiri — perbarui komentar dengan PATCH
async function perbaruiKomentarKeServer(id, nama, pesan) {
    const response = await fetch(`${URL_API}/comments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nama, body: pesan }),
    });
    if (!response.ok) {
        throw new Error(pesanDariStatus(response.status));
    }
    return await response.json();
}

// B.5 — hapus komentar dengan DELETE
async function hapusKomentarDiServer(id) {
    const response = await fetch(`${URL_API}/comments/${id}`, {
        method: "DELETE",
    });
    if (!response.ok) {
        throw new Error(pesanDariStatus(response.status));
    }
}

function keluarModeEdit() {
    itemSedangDiedit = null;
    tombolKirim.textContent = "Kirim";
    formKomentar.reset();
}

formKomentar.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nama = document.querySelector("#input-nama").value.trim();
    const pesan = document.querySelector("#input-pesan").value.trim();

    if (nama === "" || pesan === "") {
        pesanError.textContent = "Nama dan komentar wajib diisi!";
        return;
    }
    if (pesan.length < 5) {
        pesanError.textContent = "Komentar minimal 5 karakter!";
        return;
    }
    pesanError.textContent = "";

    tombolKirim.disabled = true;               // indikator loading: cegah klik dua kali
    tombolKirim.textContent = "Memproses...";

    try {
        if (itemSedangDiedit === null) {
            // ---- mode tambah: POST (B.2 + B.3) ----
            const hasil = await kirimKomentarKeServer(nama, pesan);
            console.log("Komentar tersimpan di server, id:", hasil.id);
            simpanKomentar(hasil.id, nama, pesan);
            daftarKomentar.appendChild(buatItemKomentar(hasil.id, nama, pesan));
            formKomentar.reset();
        } else {
            // ---- mode edit: PATCH ----
            const li = itemSedangDiedit;
            if (li.dataset.id) {
                await perbaruiKomentarKeServer(li.dataset.id, nama, pesan);
            }
            const urutan = Array.from(daftarKomentar.children).indexOf(li);
            const daftar = JSON.parse(localStorage.getItem("komentar")) || [];
            if (daftar[urutan]) {
                daftar[urutan].nama = nama;
                daftar[urutan].pesan = pesan;
                localStorage.setItem("komentar", JSON.stringify(daftar));
            }
            li.querySelector(".teks-komentar").textContent = `${nama}: ${pesan} `;
            keluarModeEdit();
        }
        sessionStorage.removeItem("draftNama");
        sessionStorage.removeItem("draftPesan");
    } catch (error) {
        tampilkanError(error);
        console.error(error);
    } finally {
        tombolKirim.disabled = false;
        tombolKirim.textContent = itemSedangDiedit ? "Simpan Perubahan" : "Kirim";
    }
});

// Edit & Hapus lewat event delegation
daftarKomentar.addEventListener("click", async (e) => {
    if (e.target.tagName !== "BUTTON") return;
    const li = e.target.closest("li");
    const urutan = Array.from(daftarKomentar.children).indexOf(li);

    if (e.target.textContent === "Edit") {
        // tampilkan kembali isi komentar pada form
        const daftar = JSON.parse(localStorage.getItem("komentar")) || [];
        const k = daftar[urutan];
        if (!k) return;
        document.querySelector("#input-nama").value = k.nama;
        document.querySelector("#input-pesan").value = k.pesan;
        itemSedangDiedit = li;
        tombolKirim.textContent = "Simpan Perubahan";
        document.querySelector("#input-pesan").focus();
        return;
    }

    if (e.target.textContent === "Hapus") {
        const tombolHapusKomentar = e.target;
        tombolHapusKomentar.disabled = true;   // indikator loading
        try {
            if (li.dataset.id) {
                await hapusKomentarDiServer(li.dataset.id);
            }
            const daftar = JSON.parse(localStorage.getItem("komentar")) || [];
            daftar.splice(urutan, 1);
            localStorage.setItem("komentar", JSON.stringify(daftar));
            if (li === itemSedangDiedit) keluarModeEdit();
            li.remove();
        } catch (error) {
            tombolHapusKomentar.disabled = false;
            tampilkanError(error);
            console.error(error);
        }
    }
});

const tombolHapusSemua = document.querySelector("#btn-hapus-semua");

tombolHapusSemua.addEventListener("click", () => {
    daftarKomentar.innerHTML = "";
    localStorage.removeItem("komentar");
    keluarModeEdit();
});

document.addEventListener("keydown", (e) => {
    const tag = e.target.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA") return;

    if (e.key.toLowerCase() === "d") {
        toggleTema();
    }
});

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

document.querySelector("#btn-reset").addEventListener("click", () => {
    const konfirmasi = confirm(
        "Hapus semua data tersimpan (tema, like, komentar)?");
    if (konfirmasi) {
        localStorage.clear();
        sessionStorage.clear();
        location.reload(); 
    }
});

const inputNama = document.querySelector("#input-nama");
const inputPesan = document.querySelector("#input-pesan");

inputNama.value = sessionStorage.getItem("draftNama") || "";
inputPesan.value = sessionStorage.getItem("draftPesan") || "";

inputNama.addEventListener("input", () => {
    sessionStorage.setItem("draftNama", inputNama.value);
});
inputPesan.addEventListener("input", () => {
    sessionStorage.setItem("draftPesan", inputPesan.value);
});


//MODUL 8 — FETCH API & JSON (SEMUA KODE DI BAWAH INI BARU) 

//MODUL 8 (B.2): alamat dasar API + fungsi bantu fetch
const URL_API = "https://jsonplaceholder.typicode.com";

async function ambilJSON(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error("Status: " + response.status);
    }
    return await response.json();
}

// MODUL 8 artikel dari API + loading + try/catch 
const loadingArtikel = document.querySelector("#loading");
const pesanFetchError = document.querySelector("#pesan-fetch-error");

async function muatArtikelDariAPI() {
    loadingArtikel.classList.remove("tersembunyi");   // B.4: tampilkan loading
    pesanFetchError.textContent = "";
    try {
        const daftarPost = await ambilJSON(URL_API + "/posts?_limit=5");

        daftarPost.forEach((post) => {
            const article = document.createElement("article");
            article.dataset.postId = post.id;   // MODUL 8 B.4: id server untuk PATCH like

            const judul = document.createElement("h3");
            judul.textContent = post.title;

            const waktu = document.createElement("time");
            waktu.textContent = "Artikel API #" + post.id;

            const isi = document.createElement("p");
            isi.textContent = post.body;

            const tombolLike = document.createElement("button");
            const semuaLike = JSON.parse(localStorage.getItem("semuaLike")) || {};
            const jumlahLike = semuaLike[post.title] || 0;
            tombolLike.textContent = `Like (${jumlahLike})`;
            tombolLike.dataset.like = jumlahLike;

            const tombolHapus = document.createElement("button");
            tombolHapus.textContent = "Hapus";

            article.appendChild(judul);
            article.appendChild(waktu);
            article.appendChild(isi);
            article.appendChild(tombolLike);
            article.appendChild(tombolHapus);
            containerPortofolio.appendChild(article);
        });
    } catch (error) {
        //pesan ramah untuk pengguna, detail teknis hanya di console
        pesanFetchError.textContent =
            "Gagal memuat artikel, silakan coba lagi nanti.";
        console.error("Gagal mengambil data artikel:", error);
    } finally {
        loadingArtikel.classList.add("tersembunyi");   
    }
}
muatArtikelDariAPI();

//MODUL 8  data penulis untuk <aside> dari endpoint /users 
async function muatProfilPenulis() {
    try {
        const user = await ambilJSON(URL_API + "/users/1");
        document.querySelector("#nama-penulis").textContent = user.name;
        document.querySelector("#email-penulis").textContent = user.email;
    } catch (error) {
        document.querySelector("#nama-penulis").textContent = "Tidak tersedia";
        document.querySelector("#email-penulis").textContent = "Tidak tersedia";
        console.error("Gagal memuat profil penulis:", error);
    }
}
muatProfilPenulis();

// MODUL 8 komentar awal dari /posts/1/comments
const loadingKomentar = document.querySelector("#loading-komentar");
const pesanKomentarError = document.querySelector("#pesan-komentar-error");
const daftarKomentarAPI = document.querySelector("#daftar-komentar-api");

async function muatKomentarDariAPI() {
    loadingKomentar.classList.remove("tersembunyi");
    pesanKomentarError.textContent = "";
    try {
        const daftar = await ambilJSON(URL_API + "/posts/1/comments?_limit=3");
        daftar.forEach((k) => {
            const li = document.createElement("li");
            li.textContent = `${k.email}: ${k.body}`;
            daftarKomentarAPI.appendChild(li);
        });
    } catch (error) {
        pesanKomentarError.textContent =
            "Gagal memuat komentar awal, silakan coba lagi nanti.";
        console.error("Gagal mengambil data komentar:", error);
    } finally {
        loadingKomentar.classList.add("tersembunyi");
    }
}
muatKomentarDariAPI();

// MODUL 8 B.4 — PATCH jumlah like ke server (endpoint /posts/id sebagai simulasi)
async function perbaruiLikeKeServer(postId, jumlahLike) {
    try {
        const response = await fetch(`${URL_API}/posts/${postId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ likes: jumlahLike }),
        });
        if (!response.ok) {
            throw new Error(pesanDariStatus(response.status));
        }
        pesanFetchError.textContent = "";
        console.log("Like berhasil diperbarui di server");
    } catch (error) {
        pesanFetchError.textContent = error instanceof TypeError
            ? "Gagal terhubung ke server, periksa koneksi internet."
            : error.message;
        console.error("Gagal memperbarui like:", error);
    }
}