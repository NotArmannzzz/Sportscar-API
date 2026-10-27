# Arman SportCar – Backend API

REST API sederhana untuk mengelola data mobil sport (CRUD), dibuat dengan **Node.js + Express + MySQL**.
Dikonsumsi oleh aplikasi **Ionic React** (menggunakan JSX biasa, tanpa komponen Ionic) lewat `fetch`.

Atribut data mobil: **`nama`**, **`merek`**, **`deskripsi`**.

---

## Daftar Isi

1. [Teknologi](#teknologi)
2. [Cara Menjalankan Backend](#cara-menjalankan-backend)
3. [Daftar Endpoint](#daftar-endpoint)
4. [Format Response](#format-response)
5. [Setup di Frontend (Ionic React)](#setup-di-frontend-ionic-react)
6. [Tutorial Pemanggilan API dengan fetch](#tutorial-pemanggilan-api-dengan-fetch)
   - [1. Cek server](#1-cek-server--get-)
   - [2. Ambil semua mobil](#2-ambil-semua-mobil--get-apicars)
   - [3. Ambil detail mobil](#3-ambil-detail-mobil--get-apicarsid)
   - [4. Tambah mobil](#4-tambah-mobil--post-apicars)
   - [5. Edit mobil](#5-edit-mobil--put-apicarsid)
   - [6. Hapus mobil](#6-hapus-mobil--delete-apicarsid)
7. [Contoh Halaman Lengkap](#contoh-halaman-lengkap)
8. [Troubleshooting](#troubleshooting)

---

## Teknologi

| Bagian   | Teknologi                   |
| -------- | --------------------------- |
| Backend  | Node.js, Express 5, mysql2  |
| Database | MySQL (`arman_sportcar`)    |
| Frontend | Ionic React + JSX + `fetch` |

---

## Cara Menjalankan Backend

### 1. Siapkan database

Buka MySQL (XAMPP / phpMyAdmin / terminal), lalu jalankan:

```sql
CREATE DATABASE IF NOT EXISTS arman_sportcar;
USE arman_sportcar;

CREATE TABLE IF NOT EXISTS cars (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  nama      VARCHAR(150) NOT NULL,
  merek     VARCHAR(100) NOT NULL,
  deskripsi TEXT
);
```

> Jika tabel `cars` lama masih punya kolom `tahun`, `harga`, `spek`, `gambar`, hapus tabel lama
> (`DROP TABLE cars;`) lalu buat ulang dengan SQL di atas, atau ubah lewat:
>
> ```sql
> ALTER TABLE cars
>   DROP COLUMN tahun,
>   DROP COLUMN harga,
>   DROP COLUMN gambar,
>   CHANGE COLUMN spek deskripsi TEXT;
> ```

### 2. Atur koneksi (jika perlu)

Di `index.js`:

```js
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "arman_sportcar",
});
```

### 3. Install & jalankan

```bash
npm install
npm start
```

Jika berhasil, terminal menampilkan:

```
Berhasil terhubung ke database MySQL.
Server berjalan di http://localhost:3000
```

---

## Daftar Endpoint

Base URL: `http://localhost:3000`

| Method   | Endpoint        | Fungsi               | Body (JSON)                                                  |
| -------- | --------------- | -------------------- | ------------------------------------------------------------ |
| `GET`    | `/`             | Cek server hidup     | –                                                            |
| `GET`    | `/api/cars`     | Ambil semua mobil    | –                                                            |
| `GET`    | `/api/cars/:id` | Ambil detail 1 mobil | –                                                            |
| `POST`   | `/api/cars`     | Tambah mobil baru    | `nama`, `merek` (wajib); `deskripsi` (opsional)              |
| `PUT`    | `/api/cars/:id` | Edit mobil           | Salah satu / beberapa field: `nama`, `merek`, `deskripsi`    |
| `DELETE` | `/api/cars/:id` | Hapus mobil          | –                                                            |

### Aturan validasi

- `nama` & `merek`: string, tidak boleh kosong.
- `deskripsi`: bebas, boleh kosong.
- `id` di URL: bilangan bulat, minimal **1**.
- `PUT` bersifat **parsial**: hanya field yang dikirim yang diubah.

### Status code

| Code  | Arti                         |
| ----- | ---------------------------- |
| `200` | Berhasil (GET, PUT, DELETE)  |
| `201` | Berhasil dibuat (POST)       |
| `400` | Data / ID tidak valid        |
| `404` | Mobil tidak ditemukan        |
| `500` | Error di server / database   |

---

## Format Response

Semua response berbentuk JSON.

**Berhasil:**

```json
{
  "message": "Data mobil berhasil diambil.",
  "data": [
    {
      "id": 1,
      "nama": "911 GT3",
      "merek": "Porsche",
      "deskripsi": "Mobil sport bermesin 4.0L Flat-6 dengan tenaga 510 HP."
    }
  ]
}
```

> `data` berupa **array** untuk `GET /api/cars`, dan berupa **objek** untuk endpoint lainnya.

**Gagal:**

```json
{
  "message": "Mobil tidak ditemukan."
}
```

---

## Setup di Frontend (Ionic React)

### 1. Buat file konfigurasi API

Buat file `src/api.js` agar URL tidak ditulis berulang-ulang:

```js
// src/api.js

// Pilih salah satu sesuai tempat aplikasi dijalankan:
//  - Browser di PC yang sama       -> http://localhost:3000
//  - Emulator Android Studio       -> http://10.0.2.2:3000
//  - HP asli (satu WiFi dengan PC) -> http://IP_LAN_PC:3000  (contoh: http://192.168.1.10:3000)
export const BASE_URL = "http://localhost:3000";
```

### 2. Pola umum fetch yang dipakai

```jsx
try {
  const response = await fetch(url, options);
  const result = await response.json();

  // fetch TIDAK melempar error untuk status 400/404/500,
  // jadi wajib cek response.ok sendiri
  if (!response.ok) {
    throw new Error(result.message);
  }

  // pakai result.data
} catch (error) {
  // tampilkan error.message ke layar
}
```

> **Penting:** `fetch` hanya masuk ke `catch` jika koneksi gagal (server mati, salah URL, dll).
> Jika server membalas `400`, `404`, atau `500`, `fetch` tetap dianggap berhasil, makanya `response.ok` harus dicek manual.

---

## Tutorial Pemanggilan API dengan fetch

### 1. Cek server – `GET /`

```jsx
import { useState } from "react";
import { BASE_URL } from "./api";

function CekServer() {
  const [pesan, setPesan] = useState("");

  const cek = async () => {
    try {
      const response = await fetch(`${BASE_URL}/`);
      const result = await response.json();
      setPesan(result.message);
    } catch (error) {
      setPesan("Server tidak dapat dijangkau.");
    }
  };

  return (
    <div>
      <button onClick={cek}>Cek Server</button>
      <p>{pesan}</p>
    </div>
  );
}

export default CekServer;
```

**Response:**

```json
{ "message": "Server Arman SportCar berjalan!" }
```

---

### 2. Ambil semua mobil – `GET /api/cars`

Dipanggil otomatis saat halaman dibuka memakai `useEffect`.

```jsx
import { useEffect, useState } from "react";
import { BASE_URL } from "./api";

function DaftarMobil() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const ambilData = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/cars`);
        const result = await response.json();

        if (!response.ok) throw new Error(result.message);

        setCars(result.data); // result.data = array mobil
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    ambilData();
  }, []); // [] = hanya jalan sekali saat komponen pertama tampil

  if (loading) return <p>Memuat data...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (cars.length === 0) return <p>Belum ada data mobil.</p>;

  return (
    <div>
      {cars.map((car) => (
        <div key={car.id}>
          <h3>{car.nama}</h3>
          <p>Merek: {car.merek}</p>
          <p>{car.deskripsi}</p>
        </div>
      ))}
    </div>
  );
}

export default DaftarMobil;
```

> `key={car.id}` wajib ada saat memakai `.map()` di JSX.

---

### 3. Ambil detail mobil – `GET /api/cars/:id`

Kirim `id` lewat URL. Pada contoh ini `id` diterima lewat props.

```jsx
import { useEffect, useState } from "react";
import { BASE_URL } from "./api";

function DetailMobil({ id }) {
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const ambilDetail = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${BASE_URL}/api/cars/${id}`);
        const result = await response.json();

        if (!response.ok) throw new Error(result.message);

        setCar(result.data); // result.data = 1 objek mobil
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    ambilDetail();
  }, [id]); // jalan ulang jika id berubah

  if (loading) return <p>Memuat...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h2>{car.nama}</h2>
      <p>Merek: {car.merek}</p>
      <p>Deskripsi: {car.deskripsi}</p>
    </div>
  );
}

export default DetailMobil;
```

Pemakaian: `<DetailMobil id={1} />`

> Jika pakai React Router, ambil id dari URL dengan `const { id } = useParams();`

**Error yang mungkin muncul:**

| Kondisi             | Status | message                  |
| ------------------- | ------ | ------------------------ |
| ID bukan angka / <1 | 400    | `ID mobil tidak valid.`  |
| ID tidak ada di DB  | 404    | `Mobil tidak ditemukan.` |

---

### 4. Tambah mobil – `POST /api/cars`

Perlu tiga hal tambahan dibanding GET: `method`, `headers`, dan `body`.

```jsx
import { useState } from "react";
import { BASE_URL } from "./api";

function FormTambahMobil({ onSukses }) {
  const [form, setForm] = useState({ nama: "", merek: "", deskripsi: "" });
  const [pesan, setPesan] = useState("");
  const [loading, setLoading] = useState(false);

  // satu handler untuk semua input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // cegah halaman reload
    setLoading(true);
    setPesan("");

    try {
      const response = await fetch(`${BASE_URL}/api/cars`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // WAJIB, kalau tidak body tidak terbaca
        },
        body: JSON.stringify(form), // objek JS -> string JSON
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.message);

      setPesan(result.message); // "Mobil berhasil ditambahkan."
      setForm({ nama: "", merek: "", deskripsi: "" });

      if (onSukses) onSukses(result.data); // result.data = mobil baru (sudah ada id)
    } catch (err) {
      setPesan(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="nama" placeholder="Nama mobil" value={form.nama} onChange={handleChange} />
      <input name="merek" placeholder="Merek" value={form.merek} onChange={handleChange} />
      <textarea name="deskripsi" placeholder="Deskripsi" value={form.deskripsi} onChange={handleChange} />

      <button type="submit" disabled={loading}>
        {loading ? "Menyimpan..." : "Tambah Mobil"}
      </button>

      <p>{pesan}</p>
    </form>
  );
}

export default FormTambahMobil;
```

**Body yang dikirim:**

```json
{
  "nama": "911 GT3",
  "merek": "Porsche",
  "deskripsi": "Mobil sport bermesin 4.0L Flat-6 dengan tenaga 510 HP."
}
```

**Response sukses (`201`):**

```json
{
  "message": "Mobil berhasil ditambahkan.",
  "data": {
    "id": 5,
    "nama": "911 GT3",
    "merek": "Porsche",
    "deskripsi": "Mobil sport bermesin 4.0L Flat-6 dengan tenaga 510 HP."
  }
}
```

**Error yang mungkin muncul:**

| Kondisi                | Status | message                                |
| ---------------------- | ------ | -------------------------------------- |
| `nama` / `merek` kosong | 400    | `Field nama dan merek wajib diisi.`    |

---

### 5. Edit mobil – `PUT /api/cars/:id`

Cukup kirim field yang ingin diubah (parsial). Biasanya data lama diambil dulu (GET detail) untuk mengisi form.

```jsx
import { useEffect, useState } from "react";
import { BASE_URL } from "./api";

function FormEditMobil({ id, onSukses }) {
  const [form, setForm] = useState({ nama: "", merek: "", deskripsi: "" });
  const [pesan, setPesan] = useState("");
  const [loading, setLoading] = useState(true);

  // 1) Ambil data lama untuk mengisi form
  useEffect(() => {
    const ambilData = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/cars/${id}`);
        const result = await response.json();

        if (!response.ok) throw new Error(result.message);

        setForm({
          nama: result.data.nama,
          merek: result.data.merek,
          deskripsi: result.data.deskripsi || "",
        });
      } catch (err) {
        setPesan(err.message);
      } finally {
        setLoading(false);
      }
    };

    ambilData();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 2) Kirim perubahan
  const handleSubmit = async (e) => {
    e.preventDefault();
    setPesan("");

    try {
      const response = await fetch(`${BASE_URL}/api/cars/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.message);

      setPesan(result.message); // "Data mobil berhasil diperbarui."
      if (onSukses) onSukses(result.data);
    } catch (err) {
      setPesan(err.message);
    }
  };

  if (loading) return <p>Memuat...</p>;

  return (
    <form onSubmit={handleSubmit}>
      <input name="nama" value={form.nama} onChange={handleChange} />
      <input name="merek" value={form.merek} onChange={handleChange} />
      <textarea name="deskripsi" value={form.deskripsi} onChange={handleChange} />

      <button type="submit">Simpan Perubahan</button>
      <p>{pesan}</p>
    </form>
  );
}

export default FormEditMobil;
```

**Contoh update parsial (hanya deskripsi):**

```js
await fetch(`${BASE_URL}/api/cars/1`, {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ deskripsi: "Deskripsi yang sudah diperbarui." }),
});
```

**Error yang mungkin muncul:**

| Kondisi                | Status | message                           |
| ---------------------- | ------ | --------------------------------- |
| ID tidak valid         | 400    | `ID mobil tidak valid.`           |
| ID tidak ada           | 404    | `Mobil tidak ditemukan.`          |
| `nama` dikirim kosong  | 400    | `Nama mobil tidak boleh kosong.`  |
| `merek` dikirim kosong | 400    | `Merek mobil tidak boleh kosong.` |

---

### 6. Hapus mobil – `DELETE /api/cars/:id`

Tidak perlu `body`. Sebaiknya minta konfirmasi dulu sebelum menghapus.

```jsx
import { BASE_URL } from "./api";

function TombolHapus({ id, onSukses }) {
  const hapus = async () => {
    const yakin = window.confirm("Yakin ingin menghapus mobil ini?");
    if (!yakin) return;

    try {
      const response = await fetch(`${BASE_URL}/api/cars/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.message);

      alert(result.message); // "Mobil berhasil dihapus."
      if (onSukses) onSukses(result.data); // result.data = data mobil yang baru dihapus
    } catch (err) {
      alert(err.message);
    }
  };

  return <button onClick={hapus}>Hapus</button>;
}

export default TombolHapus;
```

**Response sukses:**

```json
{
  "message": "Mobil berhasil dihapus.",
  "data": { "id": 5, "nama": "911 GT3", "merek": "Porsche", "deskripsi": "..." }
}
```

---

## Contoh Halaman Lengkap

Gabungan fitur dalam satu halaman: tampil daftar, tambah, dan hapus, dengan data diperbarui tanpa reload.
Memakai komponen dari tutorial di atas (`FormTambahMobil`, `TombolHapus`).

```jsx
import { useEffect, useState } from "react";
import { BASE_URL } from "./api";
import FormTambahMobil from "./FormTambahMobil";
import TombolHapus from "./TombolHapus";

function HalamanMobil() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const ambilData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/api/cars`);
      const result = await response.json();

      if (!response.ok) throw new Error(result.message);

      setCars(result.data);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    ambilData();
  }, []);

  return (
    <div>
      <h1>Arman SportCar</h1>

      {/* Tambah: setelah sukses, ambil ulang daftar */}
      <FormTambahMobil onSukses={ambilData} />

      <hr />

      {loading && <p>Memuat data...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {cars.map((car) => (
        <div key={car.id}>
          <h3>{car.nama}</h3>
          <p>Merek: {car.merek}</p>
          <p>{car.deskripsi}</p>

          {/* Hapus: setelah sukses, ambil ulang daftar */}
          <TombolHapus id={car.id} onSukses={ambilData} />
        </div>
      ))}
    </div>
  );
}

export default HalamanMobil;
```

---

## Troubleshooting

| Masalah | Penyebab & Solusi |
| ------- | ----------------- |
| `Cannot find module 'mysql2/promise'` | Dependency belum terpasang. Jalankan `npm install` (atau `npm install mysql2`). |
| `Failed to fetch` / `Network Error` | Backend belum jalan, atau URL salah. Pastikan `npm start` aktif dan `BASE_URL` sesuai. |
| Di emulator Android tidak bisa konek | `localhost` di emulator menunjuk ke emulator itu sendiri. Pakai `http://10.0.2.2:3000`. |
| Di HP asli tidak bisa konek | HP dan PC harus satu WiFi, pakai IP LAN PC (cek dengan `ipconfig`), dan izinkan port 3000 di firewall. |
| `Gagal terhubung ke MySQL` | MySQL/XAMPP belum aktif, atau nama database / user / password di `index.js` tidak cocok. |
| `Unknown column 'deskripsi'` | Tabel `cars` masih struktur lama. Ubah/buat ulang tabel sesuai SQL di bagian [Siapkan database](#1-siapkan-database). |
| POST/PUT selalu `400` padahal data terisi | Header `"Content-Type": "application/json"` belum dipasang, atau body lupa di-`JSON.stringify`. |
| `result.data` undefined | Cek `response.ok` dan lihat `result.message`. Kemungkinan server membalas error. |
| Halaman blank saat `.map()` | `cars` harus berupa array. Beri nilai awal `useState([])`, bukan `useState(null)`. |
| Data tidak berubah setelah tambah/hapus | Panggil ulang fungsi ambil data (`ambilData()`) setelah aksi sukses. |
