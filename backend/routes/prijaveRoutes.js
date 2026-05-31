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