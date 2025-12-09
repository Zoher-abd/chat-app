import express from "express";
import { engine } from "express-handlebars";
import path from "path";

import * as db from "./sqlite";
import type { Room } from "./sqlite";

const app = express();
const port = 8080;

const rootDir = process.cwd();
const viewsPath = path.join(rootDir, "views");
const layoutsPath = path.join(viewsPath, "layouts");
const partialsPath = path.join(viewsPath, "partials");
const staticPath = path.join(rootDir, "static");


app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(staticPath));


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


app.get("/health", (_req, res) => {
  res.status(200).type("text/plain").send("The server is up and running.");
});

app.set("trust proxy", true);
await db.connect();


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

  const currentUser = users[0];

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
  const roomId = Number(req.query.roomId ?? 2); // Standard: Raum 2

  const rooms = db.getAllRooms();
  if (!rooms || rooms.length === 0) {
    res.status(500).send("Keine Räume in der Datenbank.");
    return;
  }

  const room = rooms.find((r) => r.id === roomId) ?? rooms[0];
  if (!room) {
    res.status(500).send("Konnte keinen Raum bestimmen.");
    return;
  }

  const messagesRaw = db.getMessagesForRoom(room.id);

  const users = db.getAllUsers();
  if (!users || users.length === 0) {
    res.status(500).send("Keine Benutzer vorhanden.");
    return;
  }

  const currentUser = users[0]!;

  const messages = messagesRaw.map((m) => ({
    author: m.author,
    text: m.text,
    mine: m.user_id === currentUser.id,
  }));

  const context = {
    layout: "main",
    title: `Chat – ${room.name}`,
    activeRoom: room,
    user: currentUser,
    messages,
    typingUser: "Anna",
  };

  res.render("chat", context);
});


// PROFILE
app.get("/profile", (_req, res) => {
  const users = db.getAllUsers();
  const currentUser = users[0];

  res.render("profile", {
    title: "Profil / Einstellungen",
    user: currentUser,
  });
});

app.listen(port, () =>
  console.log(`🚀 Server läuft auf http://localhost:${port}`)
);
