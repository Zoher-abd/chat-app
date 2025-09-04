import express from "express";

const app = express();
const port = 8080;

app.use(express.static("static"));

app.get("/{*splat}", (req, res) => {
  res.send(`
      <DOCTYPE html>
      <html>
        <body>
        <h1>Web Engineering 1</h1>
        <h2>Musterprojekt</h2>
        <p><a href="/hello.html">Hallo</a></p>
        <p>Requestpfad: ${req.path}</p>
        </body>
      </html>
    `);
});

app.listen(port, () => {
  console.log(`point your browser to: http://localhost:${port}`);
});
