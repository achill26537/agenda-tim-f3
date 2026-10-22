PAKET HOSTING — AGENDA SEKDA KOTA BOGOR

Isi folder:
- index.html : halaman aplikasi dan desain asli
- app.js     : JavaScript yang sebelumnya berada di dalam HTML

Cara hosting statis:
1. Unggah index.html dan app.js ke folder/root situs yang sama.
2. Pastikan nama file tetap persis: index.html dan app.js.
3. Buka alamat situs HTTPS yang diberikan penyedia hosting.

PENTING — PENYIMPANAN DATA:
Versi sumber yang diberikan menyimpan agenda di localStorage browser (kunci: agendaSekdaData).
Artinya, agenda hanya tersimpan di browser/perangkat yang digunakan dan TIDAK otomatis tersinkron
antar-pengunjung. Hosting file ini saja tidak membuat database bersama.
Fungsi tambah/edit/hapus pada versi ini tidak memerlukan login, sehingga siapa pun yang membuka
aplikasi dapat mengubah data lokal pada browser mereka sendiri. Perubahan mereka tidak terlihat
oleh pengunjung lain.

Jika Anda membutuhkan semua pengunjung tanpa login melihat dan mengubah agenda yang sama,
paket ini perlu diintegrasikan dengan database online (misalnya Supabase) dan aturan akses database
harus ditinjau dengan cermat. Jangan menaruh service_role/secret key di app.js atau HTML publik.
