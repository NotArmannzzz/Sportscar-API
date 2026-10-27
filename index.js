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
    const { nama, merek, tahun, harga, spek, gambar } = req.body;

    if (typeof nama !== "string" || !nama.trim() || typeof merek !== "string" || !merek.trim() || tahun === undefined || tahun === null || tahun === "" || harga === undefined || harga === null || harga === "") {
      return res.status(400).json({
        message: "Field nama, merek, tahun, dan harga wajib diisi.",
      });
    }

    const tahunAngka = Number(tahun);
    const hargaAngka = Number(harga);

    if (!Number.isInteger(tahunAngka) || tahunAngka < 1886 || !Number.isSafeInteger(hargaAngka) || hargaAngka < 0) {
      return res.status(400).json({
        message: "Tahun atau harga tidak valid.",
      });
    }

    const [hasil] = await db.query(
      `INSERT INTO cars (nama, merek, tahun, harga, spek, gambar)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nama.trim(), merek.trim(), tahunAngka, hargaAngka, spek || "", gambar || ""]
    );

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

    const kolomDiizinkan = ["nama", "merek", "tahun", "harga", "spek", "gambar"];

    const perubahan = [];
    const nilai = [];

    for (const kolom of kolomDiizinkan) {
      if (req.body[kolom] !== undefined) {
        perubahan.push(`${kolom} = ?`);
        nilai.push(req.body[kolom]);
      }
    }

    const [mobilAda] = await db.query("SELECT * FROM cars WHERE id = ?", [id]);

    if (mobilAda.length === 0) {
      return res.status(404).json({
        message: "Mobil tidak ditemukan.",
      });
    }

    if (perubahan.length > 0) {
      if (req.body.nama !== undefined && (typeof req.body.nama !== "string" || !req.body.nama.trim())) {
        return res.status(400).json({
          message: "Nama mobil tidak boleh kosong.",
        });
      }

      if (req.body.merek !== undefined && (typeof req.body.merek !== "string" || !req.body.merek.trim())) {
        return res.status(400).json({
          message: "Merek mobil tidak boleh kosong.",
        });
      }

      if (req.body.tahun !== undefined && (!Number.isInteger(Number(req.body.tahun)) || Number(req.body.tahun) < 1886)) {
        return res.status(400).json({
          message: "Tahun mobil tidak valid.",
        });
      }

      if (req.body.harga !== undefined && (!Number.isSafeInteger(Number(req.body.harga)) || Number(req.body.harga) < 0)) {
        return res.status(400).json({
          message: "Harga mobil tidak valid.",
        });
      }

      if (req.body.nama !== undefined) {
        nilai[kolomDiizinkan.indexOf("nama") === -1 ? 0 : perubahan.findIndex((item) => item.startsWith("nama ="))] = req.body.nama.trim();
      }

      if (req.body.merek !== undefined) {
        const indexMerek = perubahan.findIndex((item) => item.startsWith("merek ="));
        nilai[indexMerek] = req.body.merek.trim();
      }

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
