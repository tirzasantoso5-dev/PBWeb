"use strict";

const form = document.querySelector("#form-pmb");
const pesanRingkas = document.querySelector("#pesan-ringkas");

// Semua field yang divalidasi satu per satu (radio dan checkbox terpisah)
const daftarId = ["nama", "tempat-lahir", "tgl-lahir", "nik", "agama", "email", "hp",
  "foto", "alamat", "kota", "provinsi", "kodepos", "ayah", "ibu", "pekerjaan",
  "hp-ortu", "sekolah", "nisn", "jurusan", "lulus", "nilai", "prodi1", "prodi2",
  "username", "password", "konfirmasi"];

const password = document.querySelector("#password");
const konfirmasi = document.querySelector("#konfirmasi");
const prodi1 = document.querySelector("#prodi1");
const prodi2 = document.querySelector("#prodi2");

// Pesan error dari input.validity (Constraint Validation API)
function buatPesan(input) {
  const nama = input.dataset.nama;

  if (input.validity.valueMissing) {
    if (input.tagName === "SELECT" || input.type === "file") {
      return nama + " wajib dipilih";
    }
    return nama + " wajib diisi";
  }
  if (input.validity.typeMismatch) {
    return "Format email tidak valid";
  }
  if (input.validity.tooShort) {
    return nama + " minimal " + input.minLength + " karakter";
  }
  if (input.validity.patternMismatch) {
    return input.dataset.pesan;
  }
  if (input.validity.rangeUnderflow) {
    return nama + " minimal " + input.min;
  }
  if (input.validity.rangeOverflow) {
    return nama + " maksimal " + input.max;
  }
  if (input.validity.stepMismatch) {
    return nama + " maksimal 2 angka di belakang koma";
  }
  return "";
}

// Validasi kustom (aturan di luar HTML5)
function cekKustom(input) {
  if (input.id === "tgl-lahir") {
    if (new Date(input.value) > new Date()) {
      return "Tanggal lahir tidak boleh di masa depan";
    }
  }
  if (input.id === "foto") {
    const berkas = input.files[0];
    if (berkas && berkas.size > 2 * 1024 * 1024) {
      return "Ukuran foto maksimal 2 MB";
    }
  }
  if (input.id === "password") {
    if (!/[0-9]/.test(input.value) || !/[A-Za-z]/.test(input.value)) {
      return "Password harus mengandung huruf dan angka";
    }
  }
  if (input.id === "konfirmasi") {
    if (input.value !== password.value) {
      return "Konfirmasi password tidak sama dengan password";
    }
  }
  if (input.id === "prodi2") {
    if (input.value !== "" && input.value === prodi1.value) {
      return "Pilihan 2 tidak boleh sama dengan Pilihan 1";
    }
  }
  return "";
}

// Validasi satu field, tampilkan pesan di elemen error miliknya
function validasiField(input, errorElement) {
  input.setCustomValidity("");

  let pesan = buatPesan(input);
  if (pesan === "") {
    pesan = cekKustom(input);
  }
  input.setCustomValidity(pesan);

  input.classList.add("disentuh");
  errorElement.textContent = pesan;
  return pesan === "";
}

// Pasang event pada setiap field
daftarId.forEach((id) => {
  const input = document.querySelector("#" + id);
  const error = document.querySelector("#error-" + id);
  input.addEventListener("input", () => validasiField(input, error));
  input.addEventListener("change", () => validasiField(input, error));
  input.addEventListener("blur", () => validasiField(input, error));
});

// Field yang bergantung pada field lain dicek ulang
password.addEventListener("input", () => {
  if (konfirmasi.value !== "") {
    validasiField(konfirmasi, document.querySelector("#error-konfirmasi"));
  }
});
prodi1.addEventListener("change", () => {
  validasiField(prodi2, document.querySelector("#error-prodi2"));
});

// Hanya angka untuk NIK, NISN, kode pos
["nik", "nisn", "kodepos"].forEach((id) => {
  const input = document.querySelector("#" + id);
  input.addEventListener("input", () => {
    input.value = input.value.replace(/[^0-9]/g, "");
  });
});

// Radio (jenis kelamin dan jalur)
function validasiRadio(nama) {
  const dipilih = document.querySelector("input[name='" + nama + "']:checked");
  const error = document.querySelector("#error-" + nama);
  error.textContent = dipilih ? "" : "Pilihan ini wajib dipilih";
  return dipilih !== null;
}
["jk", "jalur"].forEach((nama) => {
  document.querySelectorAll("input[name='" + nama + "']").forEach((r) => {
    r.addEventListener("change", () => validasiRadio(nama));
  });
});

// Checkbox persetujuan
const setuju = document.querySelector("#setuju");
function validasiSetuju() {
  document.querySelector("#error-setuju").textContent =
    setuju.checked ? "" : "Anda harus menyetujui pernyataan ini";
  return setuju.checked;
}
setuju.addEventListener("change", validasiSetuju);

// Menampilkan data yang sudah diisi dalam bentuk tabel
const hasil = document.querySelector("#hasil");
const tabelData = document.querySelector("#tabel-data");

function ambilData() {
  const baris = [];
  daftarId.forEach((id) => {
    const input = document.querySelector("#" + id);

    // Sisipkan radio pada urutan yang pas
    if (id === "tempat-lahir") {
      baris.push(["Jenis kelamin", document.querySelector("input[name='jk']:checked").value]);
    }
    if (id === "prodi1") {
      baris.push(["Jalur pendaftaran", document.querySelector("input[name='jalur']:checked").value]);
    }

    // Password tidak ditampilkan
    if (id === "password" || id === "konfirmasi") return;

    let nilai = input.value;
    if (id === "foto") nilai = input.files[0].name;
    if (nilai === "") nilai = "-";
    baris.push([input.dataset.nama, nilai]);
  });
  return baris;
}

function tampilkanData(baris) {
  tabelData.innerHTML = "";
  baris.forEach((item) => {
    const tr = tabelData.insertRow();
    const th = document.createElement("th");
    th.textContent = item[0];
    tr.appendChild(th);
    tr.insertCell().textContent = item[1];
  });

  // Nomor pendaftaran acak (simulasi)
  const acak = String(Math.floor(Math.random() * 1000000)).padStart(6, "0");
  document.querySelector("#no-daftar").textContent = "PMB-" + new Date().getFullYear() + "-" + acak;

  form.hidden = true;      // sembunyikan form
  hasil.hidden = false;    // tampilkan halaman hasil
  window.scrollTo(0, 0);
}

// Saat dikirim: proses hanya jika semua valid
form.addEventListener("submit", (e) => {
  e.preventDefault();
  let jumlahSalah = 0;
  let fieldPertama = null;

  daftarId.forEach((id) => {
    const input = document.querySelector("#" + id);
    const error = document.querySelector("#error-" + id);
    if (!validasiField(input, error)) {
      jumlahSalah++;
      if (fieldPertama === null) fieldPertama = input;
    }
  });
  if (!validasiRadio("jk")) jumlahSalah++;
  if (!validasiRadio("jalur")) jumlahSalah++;
  if (!validasiSetuju()) jumlahSalah++;

  if (jumlahSalah === 0) {
    const dataIsian = ambilData();   // ambil data SEBELUM form direset
    form.reset();
    pesanRingkas.textContent = "";
    tampilkanData(dataIsian);
  } else {
    pesanRingkas.textContent = "Terdapat " + jumlahSalah + " isian yang belum benar. Periksa kembali.";
    if (fieldPertama) fieldPertama.focus();
  }
});

// Tombol reset membersihkan pesan error
form.addEventListener("reset", () => {
  document.querySelectorAll(".pesan-error").forEach((s) => (s.textContent = ""));
  form.querySelectorAll(".disentuh").forEach((el) => el.classList.remove("disentuh"));
  pesanRingkas.textContent = "";
});

// Tombol "Daftarkan calon mahasiswa lain": kembali ke form kosong
document.querySelector("#btn-lagi").addEventListener("click", () => {
  hasil.hidden = true;
  form.hidden = false;
  window.scrollTo(0, 0);
});