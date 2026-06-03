//uvažanje knjižnice nodemailer
const nodemailer = require('nodemailer');
//konfiguracija za lasten mail -> prek katerega se pošiljajo obvestila drugim
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'masa.fras1@gmail.com',
    //geslo
    pass: 'uptvckpbuvlzqfbb'
  }
});

const express = require("express");
const router = express.Router();

const pool = require("../db");
const { preveriToken } = require("../middleware/authMiddleware");

// aktivnosti, na katere je uporabnik prijavljen
router.get("/moje/aktivnosti", preveriToken, async function (req, res) {
  try {
    const uporabnikId = req.uporabnik.id;

    const result = await pool.query(
      `
      SELECT 
        Termin.id_Termin,
        Termin.naziv,
        Termin.datum,
        Termin.stevilomest,
        Termin.opis,
        Termin.zahtevnost,
        Termin.starostnaskupina,
        Termin.spol,
        Sport.naziv AS sport,
        Prizorisce.naziv AS prizorisce,
        Prizorisce.mesto,
        Uporabnik.ime AS organizatorime,
        Uporabnik.priimek AS organizatorpriimek
      FROM Uporabnik_Termin
      JOIN Termin
        ON Uporabnik_Termin.Terminid_Termin = Termin.id_Termin
      JOIN Sport
        ON Termin.Sportid_Sport = Sport.id_Sport
      JOIN Prizorisce
        ON Termin.Prizorisceid_Prizorisce = Prizorisce.id_Prizorisce
      JOIN Uporabnik
        ON Termin.Uporabnikid_Organizator = Uporabnik.id_Uporabnik
      WHERE Uporabnik_Termin.Uporabnikid_Uporabnik = $1
      ORDER BY Termin.datum ASC
      `,
      [uporabnikId]
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({
      napaka: "Napaka pri nalaganju prijavljenih aktivnosti."
    });
  }
});

// prijava na termin
router.post("/:terminId", preveriToken, async function (req, res) {
  const client = await pool.connect();

  try {
    const uporabnikId = req.uporabnik.id;
    const terminId = req.params.terminId;

    await client.query("BEGIN");

    const termin = await client.query(
      `
      SELECT stevilomest
      FROM Termin
      WHERE id_Termin = $1
      FOR UPDATE
      `,
      [terminId]
    );

    if (termin.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        napaka: "Aktivnost ne obstaja."
      });
    }

    if (termin.rows[0].stevilomest <= 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        napaka: "Na tej aktivnosti ni več prostih mest."
      });
    }

    await client.query(
      `
      INSERT INTO Uporabnik_Termin
      (Uporabnikid_Uporabnik, Terminid_Termin)
      VALUES ($1, $2)
      `,
      [uporabnikId, terminId]
    );

    await client.query(
      `
      UPDATE Termin
      SET stevilomest = stevilomest - 1
      WHERE id_Termin = $1
      `,
      [terminId]
    );

    await client.query("COMMIT");

    //pridobivanje podatkov za mail iz baze in pošiljanje obvestil
    try {
      const podatkiZaMail = await client.query(
        `
        SELECT 
          u.Email, 
          t.Naziv AS termin_naziv, 
          t.Datum, 
          p.Naziv AS prizorisce_naziv, 
          p.Mesto, 
          s.Naziv AS sport_naziv
        FROM Uporabnik u
        CROSS JOIN Termin t
        LEFT JOIN Prizorisce p ON t.Prizorisceid_Prizorisce = p.id_Prizorisce
        LEFT JOIN Sport s ON t.Sportid_Sport = s.id_Sport
        WHERE u.id_Uporabnik = $1 AND t.id_Termin = $2
        `,
        [uporabnikId, terminId]

      );
      // Preverimo, če smo dobili podatke 
      if (podatkiZaMail.rows.length > 0) {
        const info = podatkiZaMail.rows[0];

        //lepši zapis datuma in ure 
        const dogodekDatum = new Date(info.datum).toLocaleDateString("sl-SI");
        const dogodekUra = new Date(info.datum).toLocaleTimeString("sl-SI", { hour: "2-digit", minute: "2-digit" });

        //vsebina e-maila
        const mailOptions = {
          from: '"ŠportniPartner.si" <masa.fras1@gmail.com>', 
          to: info.email, // email uporabnika, ki se je prijavil
          subject: `Potrditev prijave: ${info.termin_naziv || 'Športni termin'} ⚽`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 8px;">
              <h2 style="color: #2c3e50; text-align: center;">Uspešna prijava na aktivnost!</h2>
              <p>Živijo,</p>
              <p>potrjujemo tvojo prijavo na termin za <strong>${info.sport_naziv || 'šport'}</strong>.</p>
              <hr style="border: 0; border-top: 1px solid #eee;">
              <h4 style="margin-bottom: 5px;">Podrobnosti termina:</h4>
              <p style="margin: 5px 0;">🎯 <strong>Aktivnost:</strong> ${info.termin_naziv}</p>
              <p style="margin: 5px 0;">🗓️ <strong>Datum in ura:</strong> ${dogodekDatum} ob ${dogodekUra}</p>
              <p style="margin: 5px 0;">📍 <strong>Lokacija:</strong> ${info.prizorisce_naziv || 'Ni določeno'}, ${info.mesto || ''}</p>
              <hr style="border: 0; border-top: 1px solid #eee;">
              <p style="font-size: 0.9em; color: #555;">Če se termina ne moreš udeležiti, se pravočasno odjavi na spletni strani.</p>
              <p style="margin-top: 20px;">Se vidimo na igrišču!<br><strong>Ekipa ŠportniPartner.si</strong></p>
            </div>
          `
        };
        //pošiljanje maila
        transporter.sendMail(mailOptions, (error, infoOMailu) => {
          if (error) {
            console.error("Nodemailer napaka:", error);
          } else {
            console.log("Email uspešno poslan na: " + info.email);
          }
        });
      }
    } catch (mailErr) {
      // če pride do napake pri pošiljanju, se ne sesuje ampak je up, še vedno prijavljen
      console.error("Napaka pri pripravi maila:", mailErr);
    }

    res.json({
      sporocilo: "Uspešno si se prijavil/a na aktivnost."
    });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);

    if (err.code === "23505") {
      return res.status(400).json({
        napaka: "Na to aktivnost si že prijavljen/a."
      });
    }

    res.status(500).json({
      napaka: "Napaka pri prijavi na aktivnost."
    });

  } finally {
    client.release();
  }
});


// odjava s termina
router.delete("/:terminId", preveriToken, async function (req, res) {
  const client = await pool.connect();

  try {
    const uporabnikId = req.uporabnik.id;
    const terminId = req.params.terminId;

    await client.query("BEGIN");

    const prijava = await client.query(
      `
      DELETE FROM Uporabnik_Termin
      WHERE Uporabnikid_Uporabnik = $1
      AND Terminid_Termin = $2
      RETURNING *
      `,
      [uporabnikId, terminId]
    );

    if (prijava.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        napaka: "Na to aktivnost nisi prijavljen/a."
      });
    }

    await client.query(
      `
      UPDATE Termin
      SET stevilomest = stevilomest + 1
      WHERE id_Termin = $1
      `,
      [terminId]
    );

    await client.query("COMMIT");

    res.json({
      sporocilo: "Uspešno si se odjavil/a z aktivnosti."
    });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);

    res.status(500).json({
      napaka: "Napaka pri odjavi z aktivnosti."
    });

  } finally {
    client.release();
  }
});



module.exports = router;