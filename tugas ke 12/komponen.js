class SalamPengguna extends HTMLElement {
    connectedCallback() {
        const nama = this.getAttribute("nama") || "Tamu";
        this.textContent = `Halo, ${nama}! Selamat datang di blog.`;
    }
}
customElements.define("salam-pengguna", SalamPengguna);


const templateKartu = document.createElement("template");
templateKartu.innerHTML = `
    <style>
        :host { display: block; }
        .kartu {
            border: 1px solid var(--kartu-garis, #ddd);
            border-radius: var(--kartu-radius, 8px);
            padding: 16px;
            margin: 12px 0;
            text-align: left;
            background: var(--kartu-latar, transparent);
            color: var(--kartu-teks, inherit);
            transition: background-color .15s ease;
        }
        /* pengganti efek hover (.artikel-hover) yang dulu dipasang lewat JS */
        .kartu:hover {
            background: var(--kartu-hover, #eef4fb);
            color: var(--kartu-teks-hover, #1a1a1a);
        }
        ::slotted(h3) { margin: 0 0 .25rem; }
        ::slotted(time) {
            display: block;
            font-size: 0.85em;
            opacity: 0.8;
            margin-bottom: 6px;
        }
        .aksi { margin-top: .5rem; }
        button { cursor: pointer; margin-right: .5rem; }
    </style>
    <article class="kartu">
        <slot name="judul">Tanpa judul</slot>
        <slot name="waktu"></slot>
        <slot>Tanpa isi</slot>
        <div class="aksi">
            <button type="button" class="btn-like" part="tombol-like"></button>
            <button type="button" class="btn-hapus" part="tombol-hapus">Hapus</button>
        </div>
    </article>`;


// B.2 – B.5 <kartu-artikel> — Shadow DOM + slot + CustomEvent
class KartuArtikel extends HTMLElement {
    #like = 0;
    #siap = false;
    #tombolLike;

    // "like"  : memulihkan jumlah like dari halaman (localStorage)
    // "batas-like" : batas maksimal like (opsional)
    static get observedAttributes() { return ["batas-like", "like"]; }

    constructor() {
        super();
        // Shadow tree & listener dibuat SEKALI di constructor agar tidak
        // terpasang ganda ketika elemen dipindahkan.
        this.attachShadow({ mode: "open" });
        this.shadowRoot.appendChild(templateKartu.content.cloneNode(true));

        this.#tombolLike = this.shadowRoot.querySelector(".btn-like");
        this.#tombolLike.addEventListener("click", () => {
            const batas = this.#batas();
            if (batas !== null && this.#like >= batas) return;
            this.#like++;
            this.#perbaruiTombolLike();
            // B.5 — beri tahu halaman. bubbles + composed: menembus batas shadow.
            this.dispatchEvent(new CustomEvent("suka", {
                bubbles: true,
                composed: true,
                detail: {
                    judul: this.querySelector('[slot="judul"]')?.textContent ?? "",
                    jumlah: this.#like,
                    postId: this.dataset.postId,
                },
            }));
        });

        this.shadowRoot.querySelector(".btn-hapus").addEventListener("click", () => {
            // Komponen TIDAK menghapus dirinya sendiri; halaman yang memutuskan.
            this.dispatchEvent(new CustomEvent("hapus-artikel", {
                bubbles: true,
                composed: true,
            }));
        });
    }

    connectedCallback() {
        if (!this.#siap) {
            this.#like = Number(this.getAttribute("like") ?? this.getAttribute("like-awal")) || 0;
            this.#siap = true;
        }
        this.#perbaruiTombolLike();
    }

    disconnectedCallback() {
        console.log("kartu-artikel dilepas");
    }

    attributeChangedCallback(nama, lama, baru) {
        if (nama === "like") this.#like = Number(baru) || 0;
        this.#perbaruiTombolLike();
    }

    // batas-like (opsional): null = tanpa batas
    #batas() {
        const nilai = this.getAttribute("batas-like");
        if (nilai === null || nilai.trim() === "") return null;
        const angka = Number(nilai);
        return Number.isNaN(angka) ? null : angka;
    }

    #perbaruiTombolLike() {
        const batas = this.#batas();
        const tombol = this.#tombolLike;
        tombol.textContent = `Like (${this.#like})`;
        const penuh = batas !== null && this.#like >= batas;
        tombol.disabled = penuh;
        if (penuh) tombol.title = "Batas like tercapai";
        else tombol.removeAttribute("title");
    }
}
customElements.define("kartu-artikel", KartuArtikel);


function buatKartu(post) {
    const kartu = document.createElement("kartu-artikel");
    kartu.dataset.postId = post.id;       // id server (untuk PATCH like)

    const judul = document.createElement("h3");
    judul.slot = "judul";                 // masuk ke <slot name="judul">
    judul.textContent = post.title;       // textContent: aman dari XSS

    const waktu = document.createElement("time");
    waktu.slot = "waktu";
    waktu.textContent = "Artikel API #" + post.id;

    const isi = document.createElement("p");  // tanpa slot -> <slot> default
    isi.textContent = post.body;

    kartu.append(judul, waktu, isi);
    return kartu;
}

class DaftarArtikel extends HTMLElement {
    static #API = "https://jsonplaceholder.typicode.com";
    #sudahMuat = false;

    connectedCallback() {
        // Hindari pengambilan data ganda bila elemen dipindahkan
        if (this.#sudahMuat) return;
        this.#sudahMuat = true;
        this.muat();
    }

    async muat() {
        this.dataset.status = "memuat";
        this.replaceChildren();
        this.dispatchEvent(new CustomEvent("artikel-memuat", { bubbles: true }));
        const batas = Number(this.getAttribute("batas")) || 5;

        try {
            const res = await fetch(`${DaftarArtikel.#API}/posts?_limit=${batas}`);
            if (!res.ok) throw new Error("Status: " + res.status);
            const data = await res.json();

            this.replaceChildren(...data.map(buatKartu));
            this.dataset.status = "siap";
            this.dispatchEvent(new CustomEvent("artikel-dimuat", {
                detail: { jumlah: data.length },
                bubbles: true,
            }));
        } catch (error) {
            console.error("Gagal mengambil data artikel:", error);
            const pesan = document.createElement("p");
            pesan.textContent = "Gagal memuat artikel, silakan coba lagi nanti.";
            const ulang = document.createElement("button");
            ulang.type = "button";
            ulang.textContent = "Coba lagi";
            ulang.addEventListener("click", () => this.muat());
            this.replaceChildren(pesan, ulang);
            this.dataset.status = "gagal";
            this.dispatchEvent(new CustomEvent("artikel-gagal", { bubbles: true }));
        }
    }
}
customElements.define("daftar-artikel", DaftarArtikel);


const templateKomentar = document.createElement("template");
templateKomentar.innerHTML = `
    <style>
        :host { display: block; }
        .komentar-item {
            text-align: left;
            margin: 6px 0;
            border-left: 4px solid var(--komentar-aksen, #ffcc00);
            padding-left: .6rem;
        }
        ::slotted([slot="nama"]) { margin-right: .15rem; }
        button { cursor: pointer; margin-left: .25rem; }
    </style>
    <div class="komentar-item">
        <slot name="nama">Anonim</slot>:
        <slot>(kosong)</slot>
        <button type="button" class="btn-edit">Edit</button>
        <button type="button" class="btn-hapus-komentar">Hapus</button>
    </div>`;

class KartuKomentar extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.appendChild(templateKomentar.content.cloneNode(true));

        // detail nama & pesan dibaca dari konten slot (light DOM)
        const kirim = (jenis) => this.dispatchEvent(new CustomEvent(jenis, {
            bubbles: true,
            composed: true,
            detail: {
                id: this.dataset.id,
                nama: this.querySelector('[slot="nama"]')?.textContent ?? "",
                pesan: this.querySelector(":not([slot])")?.textContent ?? "",
            },
        }));
        this.shadowRoot.querySelector(".btn-edit")
            .addEventListener("click", () => kirim("edit-komentar"));
        this.shadowRoot.querySelector(".btn-hapus-komentar")
            .addEventListener("click", () => kirim("hapus-komentar"));
    }

    // dipakai script.js untuk indikator loading saat DELETE ke server
    setHapusDisabled(status) {
        const tombol = this.shadowRoot.querySelector(".btn-hapus-komentar");
        if (tombol) tombol.disabled = status;
    }
}
customElements.define("kartu-komentar", KartuKomentar);


// B.7 Mandiri — <tombol-tema>

class TombolTema extends HTMLElement {
    connectedCallback() {
        let tema = null;
        try { tema = localStorage.getItem("tema"); } catch (e) { /* abaikan */ }
        document.body.classList.toggle("dark-mode", tema === "dark");
        this.render();
    }

    render() {
        this.innerHTML = `<button id="btn-tema" type="button"></button>`;
        const tombol = this.querySelector("button");
        this.#perbaruiLabel(tombol);
        tombol.addEventListener("click", () => this.toggle());
    }

    toggle() {
        const gelap = document.body.classList.toggle("dark-mode");
        try { localStorage.setItem("tema", gelap ? "dark" : "light"); } catch (e) { /* abaikan */ }
        const tombol = this.querySelector("button");
        if (tombol) this.#perbaruiLabel(tombol);
    }

    #perbaruiLabel(tombol) {
        tombol.textContent = document.body.classList.contains("dark-mode")
            ? "Mode Terang" : "Mode Gelap";
    }
}
customElements.define("tombol-tema", TombolTema);