const express = require("express");
const router = express.Router();

const pool = require("../db");

router.get("/", async (req, res) => {
    try{
        const result = await pool.query(`
            SELECT Termin.id_Termin, 
                Termin.Naziv, 
                Termin.Datum, 
                Termin.SteviloMest, 
                Termin.Opis, 
                Sport.Naziv AS Sport,
                Prizorisce.Naziv AS Prizorisce,
                Prizorisce.mesto
            FROM Termin
            JOIN Sport
            On Sportid_Sport = id_Sport
            JOIN Prizorisce
            ON Prizorisceid_Prizorisce = id_Prizorisce
            `);

            res.json(result.rows);
    } catch (err) {
        res.status(500).json({
            napaka: err.message
        });
    }
});

module.exports = router;