const express = require("express");
const router = express.Router();

const pool = require("../db");
const { preveriToken, preveriAdmina } = require("../middleware/authMiddleware");

router.get("/", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT Termin.id_Termin, 
                Termin.Naziv, 
                Termin.Datum, 
                Termin.SteviloMest, 
                Termin.Opis, 
                Termin.Zahtevnost,
                Termin.StarostnaSkupina,
                Termin.Spol,
                Sport.Naziv AS Sport,
                Prizorisce.Naziv AS Prizorisce,
                Prizorisce.mesto,
                Uporabnik.Ime AS OrganizatorIme,
                Uporabnik.Priimek AS OrganizatorPriimek
            FROM Termin
            JOIN Sport
            ON Sportid_Sport = id_Sport
            JOIN Prizorisce
            ON Prizorisceid_Prizorisce = id_Prizorisce
            JOIN Uporabnik
            ON Termin.Uporabnikid_Organizator = id_Uporabnik
            WHERE Termin.RedniTermin = FALSE;
        `);

        res.json(result.rows);
    } catch (err) {
        res.status(500).json({
            napaka: err.message
        });
    }
});

router.delete("/:id", preveriToken, preveriAdmina, async (req, res) => {
    const id = req.params.id;

    try {
        await pool.query(
            "DELETE FROM Termin WHERE id_Termin = $1",
            [id]
        );

        res.json({
            sporocilo: "Aktivnost je bila uspešno izbrisana."
        });
    } catch (err) {
        res.status(500).json({
            napaka: err.message
        });
    }
});

router.put("/:id", preveriToken, preveriAdmina, async (req, res) => {
    const id = req.params.id;
    const { naziv, steviloMest, opis, zahtevnost } = req.body;

    try {
        const result = await pool.query(`
            UPDATE Termin
            SET 
                Naziv = $1,
                SteviloMest = $2,
                Opis = $3,
                Zahtevnost = $4
            WHERE id_Termin = $5
            RETURNING *
        `, [naziv, steviloMest, opis, zahtevnost, id]);

        res.json({
            sporocilo: "Aktivnost je bila uspešno posodobljena.",
            aktivnost: result.rows[0]
        });
    } catch (err) {
        res.status(500).json({
            napaka: err.message
        });
    }
});

module.exports = router;