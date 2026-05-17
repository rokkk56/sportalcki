const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();

const pool = require("../db");
const { JWT_SECRET } = require("../middleware/authMiddleware");

router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        const result = await pool.query(`
    SELECT 
        Uporabnik.id_Uporabnik,
        Uporabnik.Ime,
        Uporabnik.Priimek,
        Uporabnik.Username,
        Uporabnik.Email,
        Uporabnik.Password,
        TipUporabnika.Naziv AS tip
    FROM Uporabnik
    JOIN TipUporabnika
    ON Uporabnik.TipUporabnikaid_TipUporabnika = TipUporabnika.id_TipUporabnika
    WHERE Uporabnik.Username = $1
`, [username]);

        if (result.rows.length === 0) {
            return res.status(401).json({
                napaka: "Napačno uporabniško ime ali geslo."
            });
        }

        const uporabnik = result.rows[0];

        if (password !== uporabnik.password) {
            return res.status(401).json({
                napaka: "Napačno uporabniško ime ali geslo."
            });
        }

        const token = jwt.sign(
            {
                id: uporabnik.id_uporabnik,
                username: uporabnik.username,
                ime: uporabnik.ime,
                priimek: uporabnik.priimek,
                email: uporabnik.email,
                tip: uporabnik.tip
            },
            JWT_SECRET,
            { expiresIn: "2h" }
        );

        res.json({
            sporocilo: "Prijava uspešna.",
            token: token,
            uporabnik: {
                id: uporabnik.id_uporabnik,
                username: uporabnik.username,
                ime: uporabnik.ime,
                priimek: uporabnik.priimek,
                email: uporabnik.email,
                tip: uporabnik.tip

            }
        });

    } catch (err) {
        res.status(500).json({
            napaka: err.message
        });
    }
});

module.exports = router;