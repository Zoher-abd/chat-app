import express from "express";

const app = express();
const port = 8080;

// middleware: serves all files below the `static` dir
app.use(express.static("static"));

// route: always answers with 200 OK if healthy
app.get("/health", (_req, res) => {
  res.status(204).send();
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

// we may (and will) be running behind a reverse proxy
app.set("trust proxy", true);
