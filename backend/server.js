const express = require("express");
const cors = require("cors");
const path = require("path");

const aktivnostRoutes = require("./routes/aktivnostiRoutes");
const organizatorjiRoutes = require("./routes/organizatorjiRoutes");
const komentarjiRoutes = require("./routes/komentarjiRoutes");
const sportiRoutes = require("./routes/sportiRoutes");

const app = express();
app.use(express.static(path.join(__dirname, "../frontend")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "index.html"));
});
const port = 3000;

app.use(cors());
app.use(express.json());

app.use("/api/aktivnosti", aktivnostRoutes);
app.use("/api/organizatorji", organizatorjiRoutes);
app.use("/api/komentarji", komentarjiRoutes);
app.use("/api/sporti", sportiRoutes);


app.listen(port, () => {
    console.log(`Server deluje na http://localhost:${port}`);
});