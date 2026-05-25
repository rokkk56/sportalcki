const express = require("express");
const router = express.Router();

const pool = require("../db");
const {preveriToken} = require("../middleware/authMiddleware")

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

router.get("/vseckani", preveriToken, async(req,res) => {
    try{
        const uporabnikId = req.uporabnik.id;

        const result = await pool.query(`
            SELECT Uporabnik.id_Uporabnik,
                Uporabnik.Ime,
                Uporabnik.Priimek,
                Uporabnik.Username,
                Termin.id_Termin,
                Termin.Naziv AS TerminNaziv,
                Termin.Datum,
                Termin.SteviloMest
            FROM VseckaniOrganizator v
            JOIN Uporabnik
                ON v.Organizatorid_Uporabnik = Uporabnik.id_Uporabnik
            LEFT JOIN Termin
                ON Termin.Uporabnikid_Organizator = Uporabnik.id_Uporabnik
            WHERE v.Uporabnikid_Uporabnik = $1
            ORDER BY Uporabnik.Ime,Uporabnik.Priimek,Termin.Datum`,
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