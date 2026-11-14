// B.2 Langkah 1 — <salam-pengguna>
class SalamPengguna extends HTMLElement {
    connectedCallback() {
        const nama = this.getAttribute("nama") || "Tamu";
        this.textContent = `Halo, ${nama}! Selamat datang di blog.`;
    }
}
customElements.define("salam-pengguna", SalamPengguna);


//B.3 – B.6 <kartu-artikel> 
class KartuArtikel extends HTMLElement {
    #like = 0;
    #siap = false;

    static get observedAttributes() { return ["judul", "isi", "batas-like"]; }

    connectedCallback() {
        if (!this.#siap) {
            this.#like = Number(this.getAttribute("like-awal")) || 0;
            this.#siap = true;
        }
        this.render();
    }

    disconnectedCallback() {
        console.log("kartu-artikel dilepas");
    }

    attributeChangedCallback() {
        if (this.isConnected) this.render();
    }

    render() {
        this.innerHTML = `<article class="kartu"><h3></h3><time></time><p></p>
            <button class="btn-like"></button>
            <button class="btn-hapus">Hapus</button></article>`;

        this.querySelector("h3").textContent = this.getAttribute("judul") ?? "";
        this.querySelector("p").textContent = this.getAttribute("isi") ?? "";

        const waktu = this.querySelector("time");
        const teksWaktu = this.dataset.waktu ?? "";
        waktu.textContent = teksWaktu;
        if (!teksWaktu) waktu.remove();

        const like = this.querySelector(".btn-like");
        this.#perbaruiTombolLike(like);

        like.addEventListener("click", () => {
            const batas = this.#batas();
            if (batas !== null && this.#like >= batas) return;
            this.#like++;
            this.#perbaruiTombolLike(like);
            this.dispatchEvent(new CustomEvent("like-berubah", {
                bubbles: true,
                detail: {
                    judul: this.getAttribute("judul") ?? "",
                    jumlah: this.#like,
                    postId: this.dataset.postId,
                },
            }));
        });

        this.querySelector(".btn-hapus")
            .addEventListener("click", () => this.remove());
    }

    // batas-like (opsional): null = tanpa batas
    #batas() {
        const nilai = this.getAttribute("batas-like");
        if (nilai === null || nilai.trim() === "") return null;
        const angka = Number(nilai);
        return Number.isNaN(angka) ? null : angka;
    }

    #perbaruiTombolLike(tombol) {
        const batas = this.#batas();
        tombol.textContent = `Like (${this.#like})`;
        const penuh = batas !== null && this.#like >= batas;
        tombol.disabled = penuh;
        if (penuh) tombol.title = "Batas like tercapai";
        else tombol.removeAttribute("title");
    }
}
customElements.define("kartu-artikel", KartuArtikel);


// B.7 Mandiri — <kartu-komentar>

class KartuKomentar extends HTMLElement {
    static get observedAttributes() { return ["nama", "pesan"]; }

    connectedCallback() { this.render(); }

    attributeChangedCallback() {
        if (this.isConnected) this.render();
    }

    render() {
        this.innerHTML = `<div class="komentar-item"><span class="teks-komentar"></span>
            <button class="btn-edit">Edit</button>
            <button class="btn-hapus-komentar">Hapus</button></div>`;

        const nama = this.getAttribute("nama") ?? "";
        const pesan = this.getAttribute("pesan") ?? "";
        this.querySelector(".teks-komentar").textContent = `${nama}: ${pesan} `;

        const kirim = (jenis) => this.dispatchEvent(new CustomEvent(jenis, {
            bubbles: true,
            detail: { nama, pesan },
        }));
        this.querySelector(".btn-edit")
            .addEventListener("click", () => kirim("edit-komentar"));
        this.querySelector(".btn-hapus-komentar")
            .addEventListener("click", () => kirim("hapus-komentar"));
    }

    // dipakai script.js untuk indikator loading saat DELETE ke server
    setHapusDisabled(status) {
        const tombol = this.querySelector(".btn-hapus-komentar");
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