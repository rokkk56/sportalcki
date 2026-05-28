const prijaveRoutes = require("./routes/prijaveRoutes");
const express = require("express");
const cors = require("cors");
const path = require("path");

const aktivnostRoutes = require("./routes/aktivnostiRoutes");
const organizatorjiRoutes = require("./routes/organizatorjiRoutes");
const komentarjiRoutes = require("./routes/komentarjiRoutes");
const sportiRoutes = require("./routes/sportiRoutes");
const redniTerminiRoutes = require("./routes/redniTerminiRoutes");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json({limit:"10mb"}));

app.use(express.static(path.join(__dirname, "../frontend")));


app.use("/api/auth", authRoutes);
app.use("/api/aktivnosti", aktivnostRoutes);
app.use("/api/organizatorji", organizatorjiRoutes);
app.use("/api/komentarji", komentarjiRoutes);
app.use("/api/sporti", sportiRoutes);
app.use("/api/redniTermini", redniTerminiRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/prijave", prijaveRoutes);
app.use('/api/komentarji', require('./routes/komentarjiRoutes'));
app.use('/uploads', express.static('uploads'));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "index.html"));
});

app.listen(port, () => {
    console.log(`Server deluje na http://localhost:${port}`);
});

