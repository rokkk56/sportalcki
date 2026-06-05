const express = require("express");
const router = express.Router();

const pool = require("../db");
const { preveriToken } = require("../middleware/authMiddleware")

router.get("/", async (req, res) => {
    try{
        const result = await pool.query(`
            SELECT id_Komentar, Komentar, Ime, Priimek, Naziv AS Termin
            FROM Komentar
            JOIN Uporabnik
            ON Uporabnikid_Uporabnik=id_Uporabnik
            LEFT JOIN Termin
            ON Terminid_Termin = id_Termin
            ORDER BY id_Komentar DESC
            `);

            res.json(result.rows);
    } catch (err) {
        res.status(500).json({
            napaka: err.message
        });
    }
});

router.post("/", preveriToken, async (req, res) => {
    try {
        const uporabnikId = req.uporabnik.id;
        
        const { komentar, terminId, slika } = req.body;

        const result = await pool.query(`
            INSERT INTO Komentar
            (Uporabnikid_Uporabnik, Komentar, Terminid_Termin, Slika)
            VALUES ($1, $2, $3, $4)
            RETURNING * `,
        [ uporabnikId, komentar, terminId || null, slika || null ]);

        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({napaka: err.message});
    }
});

router.get("/moji", preveriToken, async(req,res) => {
    try{
        const uporabnikId = req.uporabnik.id;

        const result = await pool.query(`
            SELECT id_Komentar, Komentar, Naziv AS Termin
            FROM Komentar
            LEFT JOIN Termin
            ON Terminid_Termin = id_Termin
            WHERE Komentar.Uporabnikid_Uporabnik = $1
            ORDER BY id_Komentar DESC
            `,
        [uporabnikId]);

        res.json(result.rows)
    }catch (err){
        res.status(500).json({napaka: err.message});
    }
});

// Pridobi vse komentarje za en redni termin. za stran ene aktivnosti
router.get("/termin/:terminId", async function (req, res) {
  try {
    const terminId = req.params.terminId;

    const result = await pool.query(
      `
      SELECT
        Komentar.id_Komentar,
        Komentar.komentar,
        Komentar.slika,
        Uporabnik.ime,
        Uporabnik.priimek,
        Uporabnik.username
      FROM Komentar
      JOIN Uporabnik
        ON Komentar.Uporabnikid_Uporabnik = Uporabnik.id_Uporabnik
      WHERE Komentar.Terminid_Termin = $1
      ORDER BY Komentar.id_Komentar DESC
      `,
      [terminId]
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({
      napaka: "Napaka pri nalaganju komentarjev."
    });
  }
});

module.exports = router;