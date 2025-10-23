import express from "express";

const app = express();
const port = 8080;

// Statische Dateien aus "static" ausliefern (damit / und /a02.html funktionieren)
app.use(express.static("static"));

// Optionaler Health-Check
app.get("/health", (_req, res) => {
  res.status(200).type("text/plain").send("The server is up and running.");
});

// Wir sind evtl. hinter Reverse Proxy
app.set("trust proxy", true);

// Server starten
app.listen(port, () => {
  console.log(`✅ Server läuft: http://localhost:${port}`);
});

// Ctrl+C / Docker sauber beenden
process.on("SIGINT", () => {
  console.log("Caught interrupt signal, exiting.");
  process.exit();
});
process.on("SIGTERM", () => {
  console.log("Caught termination signal, exiting.");
  process.exit();
});
