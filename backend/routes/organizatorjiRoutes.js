const express = require("express");
const router = express.Router();

const pool = require("../db");
const {preveriToken} = require("../middleware/authMiddleware")

router.get("/moje-aktivnosti", preveriToken, async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT 
        t.id_termin,
        t.naziv,
        t.datum,
        t.stevilomest,
        t.opis,
        t.zahtevnost,
        s.naziv AS sport,
        p.naziv AS prizorisce,
        p.mesto
      FROM termin t
      JOIN sport s ON t.sportid_sport = s.id_sport
      JOIN prizorisce p ON t.prizorisceid_prizorisce = p.id_prizorisce
      WHERE t.uporabnikid_organizator = $1
      ORDER BY t.datum DESC
    `, [req.uporabnik.id]);

        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ napaka: "Napaka pri nalaganju mojih aktivnosti." });
    }
});

router.get("/moje-aktivnosti/:id/prijave", preveriToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                u.id_Uporabnik AS id_uporabnik,
                u.Ime AS ime,
                u.Priimek AS priimek,
                u.Username AS username,
                u.Email AS email
            FROM Uporabnik_Termin pr
                     JOIN Uporabnik u
                          ON pr.Uporabnikid_Uporabnik = u.id_Uporabnik
            WHERE pr.Terminid_Termin = $1
    `, [req.params.id]);

        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ napaka: "Napaka pri nalaganju prijav." });
    }
});

router.put("/moje-aktivnosti/:id", preveriToken, async (req, res) => {
    const { naziv, opis, steviloMest, zahtevnost } = req.body;

    try {
        await pool.query(`
      UPDATE termin
      SET naziv = $1,
          opis = $2,
          stevilomest = $3,
          zahtevnost = $4
      WHERE id_termin = $5
      AND uporabnikid_organizator = $6
    `, [naziv, opis, steviloMest, zahtevnost, req.params.id, req.uporabnik.id]);

        res.json({ sporocilo: "Aktivnost je bila posodobljena." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ napaka: "Napaka pri urejanju aktivnosti." });
    }
});

router.delete("/moje-aktivnosti/:id", preveriToken, async (req, res) => {
    try {
        await pool.query(`
      DELETE FROM termin
      WHERE id_termin = $1
      AND uporabnikid_organizator = $2
    `, [req.params.id, req.uporabnik.id]);

        res.json({ sporocilo: "Aktivnost je bila izbrisana." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ napaka: "Napaka pri brisanju aktivnosti." });
    }
});
router.get("/vseckani", preveriToken, async(req,res) => {
    try{
        const uporabnikId = req.uporabnik.id;

        const result = await pool.query(`
            SELECT Uporabnik.id_Uporabnik,
                Uporabnik.Ime,
                Uporabnik.Priimek,
                Uporabnik.Username,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'id', Termin.id_Termin,
                            'naziv', Termin.naziv,
                            'datum', Termin.Datum,
                            'redni', Termin.RedniTermin
                        )
                    ) FILTER (WHERE Termin.id_Termin IS NOT NULL),
                    '[]'
                ) AS aktivnosti
            FROM VseckaniOrganizator v
            JOIN Uporabnik
                ON v.Organizatorid_Uporabnik = Uporabnik.id_Uporabnik
            LEFT JOIN Termin
                ON Termin.Uporabnikid_Organizator = Uporabnik.id_Uporabnik
            WHERE v.Uporabnikid_Uporabnik = $1
            GROUP BY Uporabnik.id_Uporabnik, Uporabnik.Ime, Uporabnik.Priimek, Uporabnik.Username
            ORDER BY Uporabnik.Priimek`,
        [uporabnikId]);

        res.json(result.rows);
    } catch (err) {
        res.status(500).json({napaka: err.message});
    }
});

router.post("/vseckani", preveriToken, async (req,res) => {
    try{
        const uporabnikId = req.uporabnik.id;
        const {organizatorId} = req.body;

        const result = await pool.query(`
            INSERT INTO VseckaniOrganizator
            (Uporabnikid_Uporabnik, Organizatorid_Uporabnik)
            VALUES ($1, $2)
            RETURNING * `,
        [uporabnikId, organizatorId]);

        res.json({sporocilo: "Organizator je dodan med všečkane"});
    }catch (err){
        res.status(500).json({napaka: err.message});
    }
});

router.delete("/vseckani/:organizatorId", preveriToken, async (req,res) => {
    try{
        const uporabnikId = req.uporabnik.id;
        const organizatorId = req.params.organizatorId;

        const result = await pool.query(`
            DELETE FROM VseckaniOrganizator
            WHERE Uporabnikid_Uporabnik = $1
            AND Organizatorid_Uporabnik = $2`,
        [uporabnikId, organizatorId]);

        res.json({sporocilo: "Organizator je odstranjen iz všečkanih"});
    }catch (err){
        res.status(500).json({napaka: err.message});
    }
});

module.exports = router;