const express = require("express");
const router = express.Router();

const pool = require("../db");

router.get("/", async (req, res) => {
    try{
        const result = await pool.query(`
            SELECT id_Uporabnik, Ime, Priimek, Username, Email 
            FROM Uporabnik
            JOIN TipUporabnika
            ON TipUporabnikaid_TipUporabnika=id_TipUporabnika
            LEFT JOIN Ocena
            ON id_Uporabnik = Uporabnikid_Organizator
            WHERE naziv = 'Organizator'
            GROUP BY id_Uporabnik, Ime, Priimek, Username, Email

            `);

            res.json(result.rows);
    } catch (err) {
        res.status(500).json({
            napaka: err.message
        });
    }
});

module.exports = router;