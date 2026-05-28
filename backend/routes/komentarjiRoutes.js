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

router.post("/", preveriToken, async (req,res) => {
    try{
        const uporabnikId = req.uporabnik.id;
        const {komentar, terminId} = req.body;

        const result = await pool.query(`
            INSERT INTO Komentar
            (Uporabnikid_Uporabnik, Komentar, Terminid_Termin)
            VALUES ($1, $2, $3)
            RETURNING * `,
        [uporabnikId, komentar, terminId || null]);

        res.status(201).json(result.rows[0])
    }catch (err){
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

module.exports = router;