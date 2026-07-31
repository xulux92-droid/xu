XU MEDIA FACTORY — PHP COMPLETE

LOGIN DEFAULT
User ID : kopihitam12
Password: kopihitam12

CARA PASANG
1. Extract seluruh isi ZIP.
2. Upload ke public_html atau folder domain/subdomain.
3. Pastikan PHP 8.1+.
4. Pastikan folder "storage" dapat ditulis:
   chmod 755 atau 775.
5. Buka login.php.

CATATAN PENTING
- Versi ini memakai storage folder hosting agar langsung bisa dites.
- Tidak butuh Composer, npm, Worker, atau Pages Functions.
- Batas upload juga dipengaruhi php.ini:
  upload_max_filesize
  post_max_size
  max_execution_time
- Untuk file video besar, naikkan nilai tersebut melalui MultiPHP INI Editor/cPanel.
- Face swap AI, render FFmpeg produksi, dan export TTS tetap memerlukan VPS/API eksternal.
- API URL dapat dimasukkan dari halaman Settings.

KEAMANAN
- Ganti user/password di config.php setelah tes.
- Jangan bagikan config.php.
- Folder storage sudah diberi .htaccess agar file PHP tidak dapat dijalankan.
