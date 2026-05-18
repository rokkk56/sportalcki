const express = require("express");
const router = express.Router();

const pool = require("../db");

router.get("/", async (req, res) => {
  try {
    const { search, sport, level, gender, age, available } = req.query;

    let pogoji = ["Termin.RedniTermin = FALSE"];
    let vrednosti = [];

    if (search) {
      vrednosti.push(`%${search}%`);
      pogoji.push(`(
        LOWER(Termin.Naziv) LIKE LOWER($${vrednosti.length}) OR
        LOWER(Sport.Naziv) LIKE LOWER($${vrednosti.length}) OR
        LOWER(Prizorisce.Mesto) LIKE LOWER($${vrednosti.length}) OR
        LOWER(Prizorisce.Naziv) LIKE LOWER($${vrednosti.length})
      )`);
    }

    if (sport) {
      vrednosti.push(sport);
      pogoji.push(`Sport.Naziv = $${vrednosti.length}`);
    }

    if (level) {
      vrednosti.push(level);
      pogoji.push(`Termin.Zahtevnost = $${vrednosti.length}`);
    }

    if (gender) {
      vrednosti.push(gender);
      pogoji.push(`Termin.Spol = $${vrednosti.length}`);
    }

    if (age) {
      vrednosti.push(age);
      pogoji.push(`Termin.StarostnaSkupina = $${vrednosti.length}`);
    }

    if (available === "true") {
      pogoji.push(`Termin.SteviloMest > 0`);
    }

    const result = await pool.query(`
      SELECT 
        Termin.id_Termin,
        Termin.Naziv, 
        Termin.Datum, 
        Termin.SteviloMest, 
        Termin.Opis, 
        Termin.Zahtevnost,
        Termin.StarostnaSkupina,
        Termin.Spol,
        Sport.Naziv AS Sport,
        Prizorisce.Naziv AS Prizorisce,
        Prizorisce.Mesto,
        Uporabnik.Ime AS OrganizatorIme,
        Uporabnik.Priimek AS OrganizatorPriimek
      FROM Termin
      JOIN Sport
        ON Termin.Sportid_Sport = Sport.id_Sport
      JOIN Prizorisce
        ON Termin.Prizorisceid_Prizorisce = Prizorisce.id_Prizorisce
      JOIN Uporabnik
        ON Termin.Uporabnikid_Organizator = Uporabnik.id_Uporabnik
      WHERE ${pogoji.join(" AND ")}
      ORDER BY Termin.Datum ASC
    `, vrednosti);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({
      napaka: err.message
    });
  }
});

module.exports = router;