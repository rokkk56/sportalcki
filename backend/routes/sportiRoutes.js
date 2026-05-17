const express = require("express");
const router = express.Router();

const pool = require("../db");

router.get("/", async (req, res) => {
    try{
        const result = await pool.query(`
            SELECT id_Sport, Naziv 
            FROM Sport
            ORDER BY Naziv
            `);

            res.json(result.rows);
    } catch (err) {
        res.status(500).json({
            napaka: err.message
        });
    }
});

module.exports = router;