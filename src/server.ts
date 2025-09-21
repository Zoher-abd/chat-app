import express from "express";

const app = express();
const port = 8080;

// middleware: serves all files below the `static` dir
app.use(express.static("static"));

// route: serves the root path `/`
app.get("/", (_req, res) => {
  let _html = `
  `;
  res.send(`
    Web Engineering 1
    - Musterprojekt
    - siehe https://tramberend.bht-berlin.de/material/ws25/bmi-we1/
  `);
});

// starts the listener
app.listen(port, () => {
  console.log(`Point your browser to: http://localhost:${port}`);
});

// allows ^C to stop the server and handle the exit
process.on("SIGINT", function () {
  console.log("Caught interrupt signal, exiting.");
  process.exit();
});

// we may be running behind a reverse proxy
app.set('trust proxy', true);

