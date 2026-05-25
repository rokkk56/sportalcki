const express = require("express");
const router = express.Router();

const pool = require("../db");
const { preveriToken, preveriAdmina } = require("../middleware/authMiddleware");

router.get("/oglasi", preveriToken, preveriAdmina, async (req, res) => {
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
        p.mesto,
        u.ime AS organizatorime,
        u.priimek AS organizatorpriimek
      FROM termin t
      JOIN sport s ON t.sportid_sport = s.id_sport
      JOIN prizorisce p ON t.prizorisceid_prizorisce = p.id_prizorisce
      JOIN uporabnik u ON t.uporabnikid_organizator = u.id_uporabnik
      ORDER BY t.datum DESC
    `);

        res.json(result.rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({
            napaka: "Napaka pri nalaganju oglasov."
        });
    }
});

router.delete("/oglasi/:id", preveriToken, preveriAdmina, async (req, res) => {
    try {
        await pool.query(
            "DELETE FROM termin WHERE id_termin = $1",
            [req.params.id]
        );

        res.json({
            sporocilo: "Oglas je bil izbrisan."
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            napaka: "Napaka pri brisanju oglasa."
        });
    }
});

router.put("/oglasi/:id", preveriToken, preveriAdmina, async (req, res) => {
    const { naziv, opis, steviloMest, zahtevnost } = req.body;

    try {
        await pool.query(`
      UPDATE termin
      SET 
        naziv = $1,
        opis = $2,
        stevilomest = $3,
        zahtevnost = $4
      WHERE id_termin = $5
    `, [naziv, opis, steviloMest, zahtevnost, req.params.id]);

        res.json({
            sporocilo: "Oglas je bil posodobljen."
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            napaka: "Napaka pri urejanju oglasa."
        });
    }
});

router.get("/komentarji", preveriToken, preveriAdmina, async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT 
        k.id_komentar,
        k.vsebina,
        k.datum,
        u.username,
        u.ime,
        u.priimek,
        t.naziv AS termin
      FROM komentar k
      JOIN uporabnik u ON k.uporabnikid_uporabnik = u.id_uporabnik
      JOIN termin t ON k.terminid_termin = t.id_termin
      ORDER BY k.datum DESC
    `);

        res.json(result.rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({
            napaka: "Napaka pri nalaganju komentarjev."
        });
    }
});

router.delete("/komentarji/:id", preveriToken, preveriAdmina, async (req, res) => {
    try {
        await pool.query(
            "DELETE FROM komentar WHERE id_komentar = $1",
            [req.params.id]
        );

        res.json({
            sporocilo: "Komentar je bil izbrisan."
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            napaka: "Napaka pri brisanju komentarja."
        });
    }
});

module.exports = router;