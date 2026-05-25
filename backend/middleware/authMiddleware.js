const jwt = require("jsonwebtoken");

const JWT_SECRET = "sportni_partner_skrivnost";

function preveriToken(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            napaka: "Manjka token."
        });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            napaka: "Token ni pravilen."
        });
    }

    try {
        const podatki = jwt.verify(token, JWT_SECRET);
        req.uporabnik = podatki;
        next();
    } catch (err) {
        return res.status(403).json({
            napaka: "Token ni veljaven."
        });
    }
}

function preveriAdmina(req, res, next) {
    if (req.uporabnik.tip !== "Administrator") {
        return res.status(403).json({
            napaka: "Dostop dovoljen samo administratorju."
        });
    }

    next();
}

module.exports = {
    preveriToken,
    preveriAdmina,
    JWT_SECRET
};