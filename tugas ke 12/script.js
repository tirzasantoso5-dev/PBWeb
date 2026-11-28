const judulSitus = document.querySelector("header h1");
console.log(judulSitus);
console.log(judulSitus.textContent);

function tampilkanHalaman(nomor) {
    document.querySelectorAll('.halaman').forEach(h => h.classList.remove('aktif'));
    document.getElementById('halaman' + nomor).classList.add('aktif');
}

// MODUL 10: dark mode + localStorage kini dikelola komponen <tombol-tema> (komponen.js)
const tombolTema = document.querySelector("tombol-tema");
function toggleTema() {
    tombolTema.toggle();
}

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

// MODUL 11: buat <kartu-artikel>; judul/waktu/isi dikirim lewat SLOT (bukan atribut)
function buatKartuArtikel({ judul, isi, waktu, postId, like }) {
    const kartu = document.createElement("kartu-artikel");
    kartu.setAttribute("like-awal", like);
    if (postId) kartu.dataset.postId = postId;

    const h3 = document.createElement("h3");
    h3.slot = "judul";                    // -> <slot name="judul">
    h3.textContent = judul;               // textContent: aman dari XSS

    const p = document.createElement("p"); // tanpa slot -> <slot> default
    p.textContent = isi;

    kartu.append(h3);
    if (waktu) {
        const t = document.createElement("time");
        t.slot = "waktu";
        t.textContent = waktu;
        kartu.append(t);
    }
    kartu.append(p);
    return kartu;
}

function ambilLike(judul) {
    const semuaLike = JSON.parse(localStorage.getItem("semuaLike")) || {};
    return semuaLike[judul] || 0;
}

daftarPortofolio.forEach((data) => {
    containerPortofolio.appendChild(buatKartuArtikel({
        judul: data.judul, isi: data.isi, waktu: data.tanggal,
        like: ambilLike(data.judul),
    }));
});

// MODUL 11 B.5: halaman hanya MENDENGARKAN event dari komponen (event delegation).
// Dipasang pada dua wadah: portofolio lokal & <daftar-artikel> (dari API).
const daftarArtikel = document.querySelector("daftar-artikel");

[containerPortofolio, daftarArtikel].forEach((wadah) => {
    // Event "suka": e.target = <kartu-artikel> (host, karena retargeting)
    wadah.addEventListener("suka", (e) => {
        const { judul, jumlah, postId } = e.detail;
        console.log(`"${judul}" disukai: ${jumlah} kali`);
        simpanLike(judul, jumlah);                       // Tugas 1: simpan ke localStorage
        if (postId) perbaruiLikeKeServer(postId, jumlah); // MODUL 8 B.4: PATCH like ke server
    });

    // Event "hapus-artikel": KOMPONEN hanya melapor, HALAMAN yang menghapus
    wadah.addEventListener("hapus-artikel", (e) => {
        e.target.remove();
    });
});

// Event dari <daftar-artikel>: spinner loading + pulihkan jumlah like
daftarArtikel.addEventListener("artikel-memuat", () => {
    loadingArtikel.classList.remove("tersembunyi");
});
daftarArtikel.addEventListener("artikel-dimuat", () => {
    loadingArtikel.classList.add("tersembunyi");
    daftarArtikel.querySelectorAll("kartu-artikel").forEach((kartu) => {
        const judul = kartu.querySelector('[slot="judul"]').textContent;
        const tersimpan = ambilLike(judul);
        if (tersimpan) kartu.setAttribute("like", tersimpan);   // atribut diamati komponen
    });
});
daftarArtikel.addEventListener("artikel-gagal", () => {
    loadingArtikel.classList.add("tersembunyi");
});

const tombolTambah = document.querySelector("#btn-tambah");

tombolTambah.addEventListener("click", () => {
    const judulBaru = prompt("Judul portofolio:");
    const isiBaru = prompt("Deskripsi singkat:");
    if (!judulBaru || !isiBaru) return;

    containerPortofolio.appendChild(buatKartuArtikel({
        judul: judulBaru, isi: isiBaru,
        waktu: String(new Date().getFullYear()),
        like: ambilLike(judulBaru),
    }));
});

// MODUL 11: efek hover kini memakai :hover di dalam shadow tree (komponen.js),
// karena <article> tidak lagi terjangkau closest() dari halaman.

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

// MODUL 11: isi <kartu-komentar> lewat SLOT — nama ke slot "nama", pesan ke slot default
function isiKartuKomentar(item, nama, pesan) {
    const n = document.createElement("strong");
    n.slot = "nama";
    n.textContent = nama;
    const p = document.createElement("span");
    p.textContent = pesan;
    item.replaceChildren(n, p);
}

// MODUL 10: item komentar kini komponen <kartu-komentar> (tombol Edit & Hapus di dalamnya)
function buatItemKomentar(id, nama, pesan) {
    const item = document.createElement("kartu-komentar");
    if (id !== undefined && id !== null) {
        item.dataset.id = id;      // B.3: simpan id server (untuk PATCH & DELETE)
    }
    isiKartuKomentar(item, nama, pesan);
    return item;
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
            isiKartuKomentar(li, nama, pesan);   // perbarui konten slot
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

// Edit & Hapus: event dari dalam <kartu-komentar>
daftarKomentar.addEventListener("edit-komentar", (e) => {
    const li = e.target;
    const urutan = Array.from(daftarKomentar.children).indexOf(li);
    const daftar = JSON.parse(localStorage.getItem("komentar")) || [];
    const k = daftar[urutan];
    if (!k) return;
    document.querySelector("#input-nama").value = k.nama;
    document.querySelector("#input-pesan").value = k.pesan;
    itemSedangDiedit = li;
    tombolKirim.textContent = "Simpan Perubahan";
    document.querySelector("#input-pesan").focus();
});

daftarKomentar.addEventListener("hapus-komentar", async (e) => {
    const li = e.target;
    const urutan = Array.from(daftarKomentar.children).indexOf(li);
    li.setHapusDisabled(true);   // indikator loading
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
        li.setHapusDisabled(false);
        tampilkanError(error);
        console.error(error);
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

// MODUL 8 artikel dari API: kini dikerjakan <daftar-artikel> (MODUL 11 B.6),
// sehingga muatArtikelDariAPI() dihapus agar data tidak diambil dua kali.
// (loadingArtikel dikendalikan lewat event dari komponen di atas.)
const loadingArtikel = document.querySelector("#loading");
const pesanFetchError = document.querySelector("#pesan-fetch-error");
// komponen mulai memuat sebelum script.js berjalan -> cek status awalnya
if (daftarArtikel.dataset.status === "memuat") {
    loadingArtikel.classList.remove("tersembunyi");
}

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