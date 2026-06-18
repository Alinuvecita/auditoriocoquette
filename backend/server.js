require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const authRoutes = require("./routes/auth");
const eventRoutes = require("./routes/events");
const ticketRoutes = require("./routes/tickets");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.json({
    ok: true,
    app: "Auditorio Coquette API",
    message: "API funcionando correctamente 🎀"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/tickets", ticketRoutes);

app.use((req, res) => {
  res.status(404).json({ ok: false, message: "Ruta no encontrada" });
});

app.use((err, req, res, next) => {
  console.error("Error general:", err);
  res.status(500).json({ ok: false, message: "Error interno del servidor" });
});

app.listen(PORT, () => {
  console.log(`API Auditorio Coquette corriendo en http://localhost:${PORT}`);
});
