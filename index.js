const express = require("express");
const mysql = require("mysql2/promise");

const app = express();
const PORT = 3000;

// ===================================================
// KONEKSI DATABASE MYSQL
// ===================================================
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "arman_sportcar",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// ===================================================
// MIDDLEWARE
// ===================================================
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

// ===================================================
// ROUTE: CEK SERVER HIDUP
// GET /
// ===================================================
app.get("/", (req, res) => {
  res.json({
    message: "Server Arman SportCar berjalan!",
  });
});

// ===================================================
// ROUTE: AMBIL SEMUA MOBIL
// GET /api/cars
// ===================================================
app.get("/api/cars", async (req, res) => {
  try {
    const [cars] = await db.query("SELECT * FROM cars ORDER BY id ASC");

    res.json({
      message: "Data mobil berhasil diambil.",
      data: cars,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Gagal mengambil data mobil.",
    });
  }
});

// ===================================================
// ROUTE: AMBIL DETAIL 1 MOBIL
// GET /api/cars/:id
// ===================================================
app.get("/api/cars/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({
        message: "ID mobil tidak valid.",
      });
    }

    const [cars] = await db.query("SELECT * FROM cars WHERE id = ?", [id]);

    if (cars.length === 0) {
      return res.status(404).json({
        message: "Mobil tidak ditemukan.",
      });
    }

    res.json({
      message: "Detail mobil berhasil diambil.",
      data: cars[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Gagal mengambil detail mobil.",
    });
  }
});

// ===================================================
// ROUTE: TAMBAH MOBIL BARU
// POST /api/cars
// ===================================================
app.post("/api/cars", async (req, res) => {
  try {
    const { nama, merek, deskripsi } = req.body;

    if (typeof nama !== "string" || !nama.trim() || typeof merek !== "string" || !merek.trim()) {
      return res.status(400).json({
        message: "Field nama dan merek wajib diisi.",
      });
    }

    const [hasil] = await db.query("INSERT INTO cars (nama, merek, deskripsi) VALUES (?, ?, ?)", [nama.trim(), merek.trim(), deskripsi || ""]);

    const [cars] = await db.query("SELECT * FROM cars WHERE id = ?", [hasil.insertId]);

    res.status(201).json({
      message: "Mobil berhasil ditambahkan.",
      data: cars[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Gagal menambahkan mobil.",
    });
  }
});

// ===================================================
// ROUTE: EDIT / UPDATE MOBIL
// PUT /api/cars/:id
// ===================================================
app.put("/api/cars/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({
        message: "ID mobil tidak valid.",
      });
    }

    const [mobilAda] = await db.query("SELECT * FROM cars WHERE id = ?", [id]);

    if (mobilAda.length === 0) {
      return res.status(404).json({
        message: "Mobil tidak ditemukan.",
      });
    }

    const { nama, merek, deskripsi } = req.body;

    if (nama !== undefined && (typeof nama !== "string" || !nama.trim())) {
      return res.status(400).json({
        message: "Nama mobil tidak boleh kosong.",
      });
    }

    if (merek !== undefined && (typeof merek !== "string" || !merek.trim())) {
      return res.status(400).json({
        message: "Merek mobil tidak boleh kosong.",
      });
    }

    const perubahan = [];
    const nilai = [];

    if (nama !== undefined) {
      perubahan.push("nama = ?");
      nilai.push(nama.trim());
    }

    if (merek !== undefined) {
      perubahan.push("merek = ?");
      nilai.push(merek.trim());
    }

    if (deskripsi !== undefined) {
      perubahan.push("deskripsi = ?");
      nilai.push(deskripsi);
    }

    if (perubahan.length > 0) {
      nilai.push(id);
      await db.query(`UPDATE cars SET ${perubahan.join(", ")} WHERE id = ?`, nilai);
    }

    const [cars] = await db.query("SELECT * FROM cars WHERE id = ?", [id]);

    res.json({
      message: "Data mobil berhasil diperbarui.",
      data: cars[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Gagal memperbarui data mobil.",
    });
  }
});

// ===================================================
// ROUTE: HAPUS MOBIL
// DELETE /api/cars/:id
// ===================================================
app.delete("/api/cars/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({
        message: "ID mobil tidak valid.",
      });
    }

    const [cars] = await db.query("SELECT * FROM cars WHERE id = ?", [id]);

    if (cars.length === 0) {
      return res.status(404).json({
        message: "Mobil tidak ditemukan.",
      });
    }

    await db.query("DELETE FROM cars WHERE id = ?", [id]);

    res.json({
      message: "Mobil berhasil dihapus.",
      data: cars[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Gagal menghapus mobil.",
    });
  }
});

// ===================================================
// JALANKAN SERVER
// ===================================================
async function mulaiServer() {
  try {
    const koneksi = await db.getConnection();
    console.log("Berhasil terhubung ke database MySQL.");
    koneksi.release();

    app.listen(PORT, () => {
      console.log(`Server berjalan di http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Gagal terhubung ke MySQL:", error.message);
    console.error("Periksa apakah MySQL aktif dan konfigurasi database sudah benar.");
  }
}

mulaiServer();
