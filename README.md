# PBWeb


Readme · MD
Formulir Pendaftaran Mahasiswa Baru — Validasi Form
Tugas Praktikum Modul 6 — Validasi Form 

Mata Kuliah: Pemrograman Berbasis Web
Nama : Tirza Valencia Santoso
NIM : 255314017

Deskripsi
Program ini adalah formulir pendaftaran mahasiswa baru berbasis web (HTML, CSS, dan JavaScript murni). Fokusnya adalah teknik validasi form agar data yang diisi pengguna benar sebelum diproses. Data hanya disimulasikan dan tidak dikirim ke server.

Setelah semua isian valid dan tombol Kirim Pendaftaran ditekan, form diganti dengan halaman hasil yang berisi nomor pendaftaran dan tabel data yang sudah diisi. Tombol Daftarkan calon mahasiswa lain mengembalikan form dalam keadaan kosong.

Struktur File
File	Fungsi
index.html	Struktur formulir dan atribut validasi HTML5
style.css	Tampilan, status valid/invalid, dan gaya pesan error
script.js	Validasi (Constraint Validation API), validasi kustom, dan halaman hasil
Isi Formulir
Data Pribadi = nama, jenis kelamin, tempat dan tanggal lahir, NIK, agama, email, No. HP, pas foto
Alamat = alamat lengkap, kota, provinsi, kode pos
Data Orang Tua/Wali = nama ayah, nama ibu, pekerjaan, No. HP (opsional)
Asal Sekolah = nama sekolah, NISN, jurusan, tahun lulus, nilai rapor
Pilihan Program Studi = jalur pendaftaran, pilihan 1, pilihan 2 (opsional)
Akun = username, password, konfirmasi password
Persetujuan = checkbox pernyataan data benar
Teknik Validasi yang Digunakan

1. Atribut validasi HTML5 (index.html)
Atribut	Contoh pemakaian
required	Semua isian wajib
minlength / maxlength	Nama (3–60), alamat (10–200), username (4–20), password (min. 8)
pattern	NIK 16 digit, NISN 10 digit, kode pos 5 digit, No. HP, username (huruf, angka, _)
type	email, tel, date, number, password, file
min / max / step	Tahun lulus, nilai rapor 0–100
accept	Pas foto hanya JPG/PNG
Atribut novalidate pada <form> mematikan gelembung pesan bawaan browser, sehingga pesan error ditampilkan sendiri di halaman.

2. Constraint Validation API (script.js)
input.validity (valueMissing, typeMismatch, tooShort, patternMismatch, rangeUnderflow, rangeOverflow, stepMismatch) dipakai untuk menentukan jenis kesalahan dan memilih pesan Bahasa Indonesia yang sesuai (fungsi buatPesan).
setCustomValidity(pesan) menetapkan pesan error pada field. Di awal setiap validasi dipanggil setCustomValidity("") agar error lama tidak menempel.
Validasi dijalankan saat pengguna mengetik/memilih (input, change) dan saat meninggalkan field (blur).
3. Validasi kustom (fungsi cekKustom)
Konfirmasi password harus sama dengan password (dicek ulang saat password berubah).
Password harus mengandung huruf dan angka.
Tanggal lahir tidak boleh di masa depan.
Pilihan 2 prodi tidak boleh sama dengan pilihan 1.
Pas foto maksimal 2 MB.
4. Pesan error di DOM
Setiap field memiliki <span class="pesan-error"> sendiri yang diisi dinamis, tanpa alert(). Saat pengiriman gagal, tampil jumlah isian yang salah dan fokus pindah ke field pertama yang bermasalah. Form hanya diproses jika seluruh field valid.

5. Styling valid/invalid (style.css)
Pseudo-class :valid dan :invalid memberi border hijau atau merah. Kelas .disentuh membuat gaya ini aktif setelah field disentuh, sehingga form tidak langsung merah saat dibuka.

Jawaban Latihan Soal Evaluasi
1. Mengapa validasi client-side tidak boleh menjadi satu-satunya lapisan validasi? Kode di browser bisa dimanipulasi: JavaScript bisa dimatikan, HTML bisa diubah lewat DevTools, dan data bisa dikirim langsung ke server tanpa lewat form (misalnya dengan Postman atau curl). Validasi client-side hanya untuk kenyamanan pengguna. Server tetap harus memvalidasi ulang demi keamanan dan keutuhan data.

2. Tiga atribut validasi bawaan HTML5 dan fungsinya.

required — field wajib diisi sebelum form dikirim.
minlength / maxlength — membatasi panjang teks minimal dan maksimal.
pattern — isi harus cocok dengan regular expression (mis. [0-9]{16} untuk NIK).
(tambahan) type="email" memeriksa format email; min/max membatasi nilai angka atau tanggal.
3. Perbedaan checkValidity() dan reportValidity(). Keduanya mengembalikan true jika valid dan false jika tidak. checkValidity() hanya memeriksa tanpa menampilkan apa pun kepada pengguna. reportValidity() memeriksa dan juga menampilkan pesan error bawaan browser. Program ini memakai checkValidity() karena pesan error ditampilkan sendiri di DOM.

4. Fungsi setCustomValidity("") dan mengapa perlu dipanggil lagi setelah error diperbaiki. setCustomValidity("") menghapus pesan error kustom sehingga field dianggap valid kembali. Jika tidak dikosongkan, field tetap berstatus customError, jadi checkValidity() selalu false dan form tidak bisa dikirim walaupun isiannya sudah benar.

5. Aturan validasi "Tanggal Lahir" tidak boleh di masa depan (pseudocode).

FUNGSI validasiTanggalLahir(input):
    input.setCustomValidity("")              // hapus error lama

    JIKA input.value KOSONG:
        pesan = "Tanggal lahir wajib diisi"
    JIKA TIDAK, JIKA tanggal(input.value) > tanggalHariIni:
        pesan = "Tanggal lahir tidak boleh di masa depan"
    JIKA TIDAK:
        pesan = ""

    input.setCustomValidity(pesan)
    tampilkan pesan di elemen error
    KEMBALIKAN (pesan == "")
Implementasi di script.js (fungsi cekKustom):

javascript
if (input.id === "tgl-lahir") {
  if (new Date(input.value) > new Date()) {
    return "Tanggal lahir tidak boleh di masa depan";
  }
}
