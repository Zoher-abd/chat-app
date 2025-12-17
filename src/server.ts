import express from "express";
import { engine } from "express-handlebars";
import path from 'path';

import * as db from "./sqlite";
db.connect();

const app = express();
const port = 8080;

const rootDir = process.cwd();
const viewsPath = path.join(rootDir, "views");
const layoutsPath = path.join(viewsPath, "layouts");
const partialsPath = path.join(viewsPath, "partials");
const staticPath = path.join(rootDir, "static");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.use((req, res, next) => {
  res.locals.base =
    path.relative(path.dirname(req.path), "/") || ".";
  next();
});



app.use(express.static(staticPath));

// Handlebars
app.engine(
  "handlebars",
  engine({
    extname: ".handlebars",
    defaultLayout: "main",
    layoutsDir: layoutsPath,
    partialsDir: partialsPath,
  })
);


app.set("view engine", "handlebars");
app.set("views", viewsPath);

// DB connect
await db.connect();

// Health
app.get("/health", (_req, res) => {
  res.status(200).type("text/plain").send("The server is up and running.");
});

// Start
app.get("/", (_req, res) => res.redirect("/login"));

// LOGIN
app.get("/login", (_req, res) => {
  res.render("login", { title: "Login" });
});

// REGISTER
app.get("/register", (_req, res) => {
  res.render("register", { title: "Registrieren" });
});

// DASHBOARD
app.get("/dashboard", (_req, res) => {
  const users = db.getAllUsers();
  const rooms = db.getAllRooms();

  if (!users.length) return res.status(500).send("Keine Benutzer in der DB.");
  const currentUser = users[0]!;

  res.render("dashboard", {
    title: "Chat-App Dashboard",
    user: currentUser,
    rooms,
    stats: {
      roomsJoined: rooms.length,
      messagesSent: 42,
      onlineSince: "10 Minuten",
    },
  }); 
});

// ROOMS
app.get("/rooms", (_req, res) => {
  const rooms = db.getAllRooms();
  res.render("rooms", {
    title: "Rooms",
    rooms,
    onlineCount: 12,
  });
});

// CHAT
app.get("/chat", (req, res) => {
  const roomId = Number(req.query.roomId ?? 2);

  const rooms = db.getAllRooms();
  if (!rooms.length) return res.status(500).send("Keine Räume in der Datenbank.");

  const room = rooms.find((r) => r.id === roomId) ?? rooms[0]!;
  const messagesRaw = db.getMessagesForRoom(room.id);

  const users = db.getAllUsers();
  if (!users.length) return res.status(500).send("Keine Benutzer vorhanden.");
  const currentUser = users[0]!;

  const messages = messagesRaw.map((m) => ({
    author: m.author,
    text: m.text,
    mine: m.user_id === currentUser.id,
  }));

  res.render("chat", {
    title: `Chat – ${room.name}`,
    activeRoom: room,
    user: currentUser,
    messages,
    typingUser: "Anna",
  });
});

// PROFILE
app.get("/profile", (_req, res) => {
  const users = db.getAllUsers();
  if (!users.length) return res.status(500).send("Keine Benutzer in der DB.");

  const currentUser = users[0]!;
  res.render("profile", {
    title: "Profil / Einstellungen",
    user: currentUser,
  });
});

app.use((_req, res) => {
  res.status(404).type("text/plain").send("404 – Not Found");
});

app.listen(port, () => {
  console.log(`Server läuft auf http://localhost:${port}`);
});
