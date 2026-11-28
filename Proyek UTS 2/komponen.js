/* =========================================================
   komponen.js — Modul 10: Custom Elements
   <kartu-buku> : satu kartu buku yang reusable.
   Data dikirim lewat ATRIBUT (selalu berupa string):
     buku-id, judul, penulis, tahun, cover, status
   Mode tampilan:
     mode="hasil"  -> tombol Simpan  (atribut tersimpan = sudah di rak)
     mode="rak"    -> pilihan status + tombol Hapus
   Harus ditautkan SEBELUM script.js.
   ========================================================= */

const GAMBAR_CADANGAN =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="300">' +
    '<rect width="100%" height="100%" fill="#dde3ea"/>' +
    '<text x="50%" y="50%" font-family="Arial" font-size="18" fill="#667" ' +
    'text-anchor="middle">Tanpa sampul</text></svg>'
  );

class KartuBuku extends HTMLElement {
  static get observedAttributes() {
    return ["judul", "penulis", "tahun", "cover", "status", "mode", "tersimpan"];
  }

  connectedCallback() {
    this.render();
  }

  disconnectedCallback() {
    console.log("kartu-buku dilepas:", this.getAttribute("judul"));
  }

  attributeChangedCallback() {
    if (this.isConnected) this.render();
  }

  render() {
    const mode = this.getAttribute("mode") || "hasil";
    const judul = this.getAttribute("judul") ?? "";
    const status = this.getAttribute("status") || "ingin";

    // Kerangka HTML ditulis tetap; data diisi dengan textContent (aman)
    this.innerHTML = `
      <article class="kartu">
        <img class="sampul" alt="" loading="lazy">
        <div class="isi">
          <h3></h3>
          <p class="penulis"></p>
          <p class="tahun"></p>
          <div class="aksi"></div>
        </div>
      </article>`;

    this.querySelector("h3").textContent = judul;
    this.querySelector(".penulis").textContent =
      this.getAttribute("penulis") || "Penulis tidak diketahui";
    this.querySelector(".tahun").textContent = this.getAttribute("tahun")
      ? `Terbit: ${this.getAttribute("tahun")}`
      : "Tahun tidak diketahui";

    const gambar = this.querySelector(".sampul");
    gambar.alt = `Sampul buku ${judul}`;
    const cover = Number(this.getAttribute("cover"));
    gambar.src = cover
      ? `https://covers.openlibrary.org/b/id/${cover}-M.jpg`
      : GAMBAR_CADANGAN;
    gambar.addEventListener("error", () => { gambar.src = GAMBAR_CADANGAN; }, { once: true });

    const aksi = this.querySelector(".aksi");
    if (mode === "rak") {
      const pilih = document.createElement("select");
      pilih.dataset.aksi = "status";
      pilih.setAttribute("aria-label", `Status baca ${judul}`);
      [["ingin", "Ingin dibaca"], ["sudah", "Sudah dibaca"]].forEach(([nilai, teks]) => {
        const opsi = document.createElement("option");
        opsi.value = nilai;
        opsi.textContent = teks;
        opsi.selected = status === nilai;
        pilih.appendChild(opsi);
      });
      const hapus = document.createElement("button");
      hapus.type = "button";
      hapus.dataset.aksi = "hapus";
      hapus.textContent = "Hapus";
      aksi.append(pilih, hapus);
    } else {
      const sudahTersimpan = this.hasAttribute("tersimpan");
      const simpan = document.createElement("button");
      simpan.type = "button";
      simpan.dataset.aksi = "simpan";
      simpan.disabled = sudahTersimpan;
      simpan.textContent = sudahTersimpan ? "✓ Tersimpan" : "Simpan";
      aksi.appendChild(simpan);
    }
  }
}

customElements.define("kartu-buku", KartuBuku);