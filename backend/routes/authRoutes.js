const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();

const pool = require("../db");
const { JWT_SECRET, preveriToken } = require("../middleware/authMiddleware");

router.post("/login", async (req, res) => {
    const { username, password } = req.body;
 if (!username || !password)   {
     return res.status(400).json({
         napaka: "Vnesi uporabniško ime in geslo."
     });
 }

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

//dodajanje registriranega uporabnika v bazo
router.post("/register", async(req,res) => {
    try{
        const {
            ime,
            priimek,
            username,
            email,
            password,
            datumRojstva,
            spol
        } = req.body;

        if(!ime || !priimek || !username || !email || !password) {
            return res.status(400).json({
                napaka: "Izpolni vsa obvezna polja."
            })
        }

        if(password.length < 8 || !/[0-9!@#$%^&*]/.test(password)){
            return res.status(400).json({
                napaka : "Geslo mora imeti vsaj 8 znakov in vsebovati številko ali posebni znak."
            });
        }

        const result = await pool.query(`
            INSERT INTO Uporabnik
            (Ime, Priimek, Username, Password, Email, DatumRojstva, Spol, TipUporabnikaid_TipUporabnika)
            VALUES ($1, $2, $3, $4, $5, $6, $7, 1)
                    RETURNING id_Uporabnik, Ime, Priimek, Username, Email
                    `, [ime, priimek, username, password, email, datumRojstva || null, spol || null]);

                    res.status(201).json({
                        sporocilo: "Registracija uspešna.",
                        uporabnik: result.rows[0]
                    });   
    } catch (err) {
        res.status(500).json({
            napaka: err.message
        });
    }
});

//za prikazovanje podatkov na profil.html
router.get("/me", preveriToken, async (req,res) =>{
    try{
        const uporabnikId = req.uporabnik.id;

        const result = await pool.query(`
            SELECT 
                id_Uporabnik,
                Ime,
                Priimek,
                Username,
                Email,
                DatumRojstva,
                Spol,
                ProfilnaSlika
            FROM Uporabnik
            WHERE id_Uporabnik = $1
            `, [uporabnikId]);

            res.json(result.rows[0]);

    } catch (err) {
        res.status(500).json({napaka:err.message});
    }
});

//za spreminjanje podatkov na profil.html
router.put("/me", preveriToken, async (req,res) =>{
    try{
        const uporabnikId = req.uporabnik.id;

        const {
            ime,
            priimek,
            email,
            password
        } = req.body;

        if (!ime || !priimek || !email){
            return res.status(400).json({
                napaka: "Izpolni vsa obvezna polja."
            });
        }

        if (password && (password.length < 8 || !/[0-9!@#$%^&*]/.test(password))){
            return res.status(400).json({
                napaka:"Geslo mora imeti vsaj 8 znakov in številko ali posebni znak."
            });
        }

        if(password) {
            await pool.query(`
            UPDATE Uporabnik
            SET
                Ime = $1,
                Priimek = $2,
                Email = $3,
                Password = $4
            WHERE id_Uporabnik = $5
            `, [ime,priimek,email,password,uporabnikId]);
        } else {
            await pool.query(`
            UPDATE Uporabnik
            SET
                Ime = $1,
                Priimek = $2,
                Email = $3
            WHERE id_Uporabnik = $4
            `, [ime,priimek,email,uporabnikId]);
        }
        res.json({sporocilo:"Profil uspešno posodobljen"});

    } catch (err) {
        res.status(500).json({napaka:err.message});
    }
});

//za dodajanje profilne slike v tabeli Uporabnik
router.put("/profilna-slika", preveriToken, async(req,res) => {
    try{
        const uporabnikId = req.uporabnik.id;
        const {profilnaSlika} = req.body;

        await pool.query(`
            UPDATE Uporabnik
            SET ProfilnaSlika = $1
            WHERE id_Uporabnik = $2
            `, [profilnaSlika,uporabnikId]);

        res.json({ sporocilo: "Profilna slika shranjena."});
    }catch (err) {
        res.status(500).json({napaka:err.message});
    }
});

module.exports = router;