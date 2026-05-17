const express = require("express");
const router = express.Router();

const pool = require("../db");

router.get("/", async (req, res) => {
    try{
        const result = await pool.query(`
            SELECT id_Komentar, Komentar, Ime, Priimek, Naziv AS Termin
            FROM Komentar
            JOIN Uporabnik
            ON Uporabnikid_Uporabnik=id_Uporabnik
            LEFT JOIN Termin
            ON Terminid_Termin = id_Termin
            `);

            res.json(result.rows);
    } catch (err) {
        res.status(500).json({
            napaka: err.message
        });
    }
});

module.exports = router;