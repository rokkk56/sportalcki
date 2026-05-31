const express = require("express");
const router = express.Router();

const pool = require("../db");

router.get("/", async (req, res) => {
    try{
        const result = await pool.query(`
            SELECT DISTINCT ON (Termin.id_Termin)
                Termin.id_Termin, 
                Termin.Naziv, 
                Termin.Datum, 
                Termin.SteviloMest, 
                Termin.Opis, 
                Termin.Zahtevnost,
                Termin.StarostnaSkupina,
                Termin.Spol,
                Termin.Uporabnikid_Organizator AS organizator_id,
                Sport.Naziv AS Sport,
                Prizorisce.Naziv AS Prizorisce,
                Prizorisce.mesto,
                Uporabnik.Ime AS OrganizatorIme,
                Uporabnik.Priimek AS OrganizatorPriimek,
                Komentar.Komentar AS KomentarTekst,
                Komentator.Ime AS KomentatorIme,
                Komentator.priimek AS KomentatorPriimek,
                Komentar.Slika AS KomentarSlika
            FROM Termin
            JOIN Sport
            ON Termin.Sportid_Sport = Sport.id_Sport
            JOIN Prizorisce
            ON Termin.Prizorisceid_Prizorisce = Prizorisce.id_Prizorisce
            JOIN Uporabnik
            ON Termin.Uporabnikid_Organizator = Uporabnik.id_Uporabnik
            LEFT JOIN Komentar 
            ON Termin.id_Termin = Komentar.Terminid_Termin
            LEFT JOIN Uporabnik AS Komentator
            ON Komentar.Uporabnikid_Uporabnik = Komentator.id_Uporabnik
            WHERE Termin.RedniTermin = TRUE
            ORDER BY Termin.id_Termin, Komentar.id_Komentar DESC;
            `);

            res.json(result.rows);
    } catch (err) {
        res.status(500).json({
            napaka: err.message
        });
    }
});

module.exports = router;