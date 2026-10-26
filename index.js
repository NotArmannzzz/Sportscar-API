const express = require("express");
const app = express();
const PORT = 3000;

// ===================================================
// MIDDLEWARE
// Mengizinkan server membaca JSON dari request body
// Mengizinkan semua domain mengakses API ini (CORS)
// ===================================================
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// ===================================================
// DATA (pengganti database)
// Dimulai dari kosong agar bisa ditambah dari awal
// ===================================================
let cars = [];
let nextId = 1; // ID otomatis bertambah setiap ada mobil baru

// ===================================================
// ROUTE: CEK SERVER HIDUP
// GET /
// ===================================================
app.get("/", (req, res) => {
  res.json({ message: "Server Arman SportCar berjalan!" });
});

// ===================================================
// ROUTE: AMBIL SEMUA MOBIL
// GET /api/cars
// ===================================================
app.get("/api/cars", (req, res) => {
  res.json({
    message: "Data mobil berhasil diambil.",
    data: cars,
  });
});

// ===================================================
// ROUTE: AMBIL DETAIL 1 MOBIL
// GET /api/cars/:id
// ===================================================
app.get("/api/cars/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const mobil = cars.find((c) => c.id === id);

  if (!mobil) {
    return res.status(404).json({ message: "Mobil tidak ditemukan." });
  }

  res.json({
    message: "Detail mobil berhasil diambil.",
    data: mobil,
  });
});

// ===================================================
// ROUTE: TAMBAH MOBIL BARU
// POST /api/cars
// Body: { nama, merek, tahun, harga, spek, gambar }
// ===================================================
app.post("/api/cars", (req, res) => {
  const { nama, merek, tahun, harga, spek, gambar } = req.body;

  // Validasi field wajib
  if (!nama || !merek || !tahun || !harga) {
    return res.status(400).json({
      message: "Field nama, merek, tahun, dan harga wajib diisi.",
    });
  }

  // Buat objek mobil baru
  const mobilBaru = {
    id: nextId++,
    nama,
    merek,
    tahun,
    harga,
    spek: spek || "",
    gambar: gambar || "",
  };

  // Tambahkan ke array
  cars.push(mobilBaru);

  res.status(201).json({
    message: "Mobil berhasil ditambahkan.",
    data: mobilBaru,
  });
});

// ===================================================
// ROUTE: EDIT / UPDATE MOBIL
// PUT /api/cars/:id
// Body: field yang ingin diubah
// ===================================================
app.put("/api/cars/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = cars.findIndex((c) => c.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "Mobil tidak ditemukan." });
  }

  const { nama, merek, tahun, harga, spek, gambar } = req.body;

  // Update hanya field yang dikirim
  if (nama !== undefined) cars[index].nama = nama;
  if (merek !== undefined) cars[index].merek = merek;
  if (tahun !== undefined) cars[index].tahun = tahun;
  if (harga !== undefined) cars[index].harga = harga;
  if (spek !== undefined) cars[index].spek = spek;
  if (gambar !== undefined) cars[index].gambar = gambar;

  res.json({
    message: "Data mobil berhasil diperbarui.",
    data: cars[index],
  });
});

// ===================================================
// ROUTE: HAPUS MOBIL
// DELETE /api/cars/:id
// ===================================================
app.delete("/api/cars/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = cars.findIndex((c) => c.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "Mobil tidak ditemukan." });
  }

  // Hapus dari array
  const mobilDihapus = cars.splice(index, 1)[0];

  res.json({
    message: "Mobil berhasil dihapus.",
    data: mobilDihapus,
  });
});

// ===================================================
// JALANKAN SERVER
// ===================================================
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
