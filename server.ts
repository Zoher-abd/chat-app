import express from "express";

const app = express();
const port = 8080;

app.use(express.static("static"));

app.get("/", (req, res) => {
  res.send("");
});

app.listen(port, () => {
  console.log(`point your browser to: http://localhost:${port}`);
});
