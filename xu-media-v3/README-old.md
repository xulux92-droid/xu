# XU Media Factory — Complete Build

Build ini menggabungkan modul utama dalam satu aplikasi Cloudflare Pages + Pages Functions + R2:

- Login token.
- Media Storage.
- Project Builder.
- Video Composer.
- Voice Studio.
- Render Queue.
- Output Manager.
- Batch CSV.
- Pengaturan API eksternal.
- Browser Preview.
- Browser Quick Render untuk komposisi sederhana.

## Batas penting

Cloudflare Pages dan R2 **tidak menjalankan FFmpeg, AI face swap, atau model TTS berat**. Karena itu build ini menyediakan dua jalur:

1. **Quick Render di browser**
   - Cocok untuk background gambar/video + logo + teks.
   - Menggunakan Canvas, MediaRecorder, dan browser.
   - Bukan face swap AI.
   - Audio hasil akhir bergantung dukungan browser.

2. **External Render API**
   - Dipakai untuk FFmpeg, face swap, online TTS, subtitle burn-in, dan render produksi.
   - URL API serta API key diisi pada Settings.
   - Format payload sudah disiapkan.

Jadi seluruh dashboard dan workflow sudah menyatu. Untuk AI face swap/TTS produksi, hubungkan endpoint GPU/VPS/API pilihan Anda.

## Deploy

### 1. Buat R2 bucket

- `xu-media-storage`
- `xu-media-storage-preview`

### 2. Deploy

```bash
npm install
npx wrangler login
npm run deploy
```

Atau hubungkan folder ini ke GitHub lalu Cloudflare Pages.

Cloudflare Pages configuration:

- Build command: kosong
- Output directory: `public`

### 3. R2 binding

Cloudflare Dashboard:

`Workers & Pages → Project → Settings → Bindings`

- Variable: `MEDIA_BUCKET`
- Bucket: `xu-media-storage`

### 4. Secret

Tambahkan encrypted secret:

- `AUTH_TOKEN`

### 5. External processing API

Buka halaman Settings di aplikasi dan isi:

- Render API URL
- Face Swap API URL
- TTS API URL
- API Key

Konfigurasi disimpan ke R2 sebagai settings JSON. API key pada build ini disimpan melalui backend, tetapi untuk produksi tim lebih aman memakai Cloudflare secret dan adapter khusus.

## Struktur R2

```text
models/
templates/
backgrounds/
backsounds/
logos/
overlays/
voices/
fonts/
outputs/
projects/
jobs/
settings/
```

## External Render API contract

Request:

```json
{
  "project": {},
  "assets": {},
  "options": {
    "faceSwap": false,
    "ttsMode": "offline",
    "subtitles": true
  },
  "callbackUrl": "https://domain.pages.dev/api/jobs/callback"
}
```

Response:

```json
{
  "jobId": "external-job-id",
  "status": "queued"
}
```

## External TTS API contract

```json
{
  "text": "isi suara",
  "voice": "female-id",
  "speed": 1,
  "pitch": 0,
  "format": "mp3"
}
```

## External Face Swap API contract

```json
{
  "sourceImageUrl": "...",
  "targetVideoUrl": "...",
  "callbackUrl": "..."
}
```

## Testing order

1. Login.
2. Upload aset.
3. Buat project.
4. Pilih aset di Composer.
5. Save project.
6. Coba Preview.
7. Coba Quick Render browser.
8. Isi API eksternal.
9. Queue production render.
10. Cek Output Manager.
