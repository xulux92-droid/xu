Xu_Seo Workspace Pro

Deploy target:
https://hamiklanpha.sbs/lampha/workspace/

Susunan upload ke hosting:
/public_html/lampha/workspace/
  index.html
  /.htaccess
  /assets
  /api
  /uploads

Catatan penting:
1. Semua asset dan module sudah disiapkan untuk jalan dari subfolder /lampha/workspace/.
2. Uploader publik butuh hosting yang mendukung PHP.
3. Code Editor memakai Monaco via CDN saat tool dibuka.
4. Folder uploads harus tetap ada dan writable.
5. Kalau uploader gagal, cek permission folder uploads dan limit upload hosting.


CHAT FEATURE
- Chat memakai api/chat.php
- Pastikan file api/chat-data.json bisa ditulis server
- Tidak perlu .htaccess
