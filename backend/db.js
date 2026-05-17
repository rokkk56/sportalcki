const { Pool } = require("pg");

const pool = new Pool ({
    user: "sportni_user",
    password: "sportni123",
    host: "localhost",
    port: 5432,
    database: "sportnipartner"
});

module.exports = pool;