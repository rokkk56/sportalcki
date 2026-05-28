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
                Komentar.slika AS KomentarSlika,
                Komentator.Ime AS KomentatorIme,
                Komentator.priimek AS KomentatorPriimek,
                STRING_AGG(Komentar.Komentar, '|||') AS komentarji_tekst,
        STRING_AGG(COALESCE(Komentar.slika, ''), '|||') AS komentarji_slike,
        STRING_AGG(Komentator.Ime, '|||') AS komentatorji_imena,
        STRING_AGG(Komentator.Priimek, '|||') AS komentatorji_priimki
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
            WHERE Termin.RedniTermin = TRUE,
            GROUP BY 
                Termin.id_Termin, 
                Termin.Naziv, 
                Termin.Datum, 
                Termin.SteviloMest, 
                Termin.Opis, 
                Termin.Zahtevnost,
                Termin.StarostnaSkupina,
                Termin.Spol,
                Termin.Uporabnikid_Organizator, 
                Sport.Naziv, 
                Prizorisce.Naziv, 
                Prizorisce.mesto, 
                Uporabnik.Ime, 
                Uporabnik.Priimek,
                Komentar.Komentar,
                Komentar.slika,
                Komentator.Ime,
                Komentator.priimek;
        `);

            res.json(result.rows);
    } catch (err) {
        res.status(500).json({
            napaka: err.message
        });
    }
});

module.exports = router;