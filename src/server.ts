import express from "express";
import { engine } from "express-handlebars";
import * as path from "node:path";
import * as db from "./sqlite";
import * as utils from "./utils";

const app = express();
const port = 8080;

app.set("trust proxy", true);

// -------------------------------
// Pfade
// -------------------------------
const rootDir = process.cwd();
const viewsPath = path.join(rootDir, "views");
const layoutsPath = path.join(viewsPath, "layouts");
const partialsPath = path.join(viewsPath, "partials");
const staticPath = path.join(rootDir, "static");

const createSqlPath = path.join(rootDir, "data", "create.sql");
const populateSqlPath = path.join(rootDir, "data", "populate.sql");

// -------------------------------
// Middleware
// -------------------------------
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// base
app.use((req, res, next) => {
  res.locals.base = path.relative(path.dirname(req.path), "/") || ".";
  next();
});

// Redirect helper 
function redirectWE1(req: any, res: any, to: string) {
  const ref = String(req.headers.referer ?? "");
  const refMatch = ref.match(/\/service\/we1\/[^/]+/);
  const urlMatch = String(req.originalUrl ?? "").match(/^\/service\/we1\/[^/]+/);

  const prefix = refMatch?.[0] ?? urlMatch?.[0] ?? "";
  return res.redirect(prefix + to);
}

// Static
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

// Flash middleware
app.use((req, res, next) => {
  res.locals.flash = utils.getFlash(req, res);
  next();
});


// DB init
db.connect("data/chat.db");
db.initFromSqlFiles(createSqlPath, populateSqlPath);
// middleware
function requireAuth(req: any, res: any, next: any) {
  const user = db.authenticateUser(req);
  if (!user) return redirectWE1(req, res, "/login");

  req.user = user;
  res.locals.user = user;
  next();
}

// Routes
app.get("/health", (_req, res) => {
  res.status(200).type("text/plain").send("The server is up and running.");
});

app.get("/", (req, res) => {
  const user = db.authenticateUser(req);
  if (user) return redirectWE1(req, res, "/dashboard");
  return redirectWE1(req, res, "/login");
});

// LOGIN (GET)
app.get("/login", (_req, res) => {
  res.render("login", { title: "Login" });
});

// LOGIN (POST)
app.post("/login", (req, res) => {
  const loginOrEmail = String(req.body.username ?? "").trim();
  const password = String(req.body.password ?? "");

  const user = db.checkCredentials(loginOrEmail, password);
  if (!user) {
    utils.setFlash(res, "Anmeldung fehlgeschlagen");
    return redirectWE1(req, res, "/login");
  }

  res.cookie("user_id", String(user.id), {
    httpOnly: true,
    sameSite: "lax",
  });

  return redirectWE1(req, res, "/dashboard");
});

// REGISTER (GET)
app.get("/register", (_req, res) => {
  res.render("register", { title: "Registrieren" });
});

// REGISTER (POST)
app.post("/register", (req, res) => {
  const username = String(req.body.username ?? "").trim();
  const email = String(req.body.email ?? "").trim();
  const password = String(req.body.password ?? "");
  const password2 = String(req.body.password2 ?? "");

  if (!username || !email || !password || !password2) {
    utils.setFlash(res, "Bitte alle Felder ausfüllen.");
    return redirectWE1(req, res, "/register");
  }

  if (password.length < 8) {
    utils.setFlash(res, "Passwort muss mindestens 8 Zeichen lang sein.");
    return redirectWE1(req, res, "/register");
  }

  if (password !== password2) {
    utils.setFlash(res, "Passwörter stimmen nicht überein.");
    return redirectWE1(req, res, "/register");
  }

  // Username 
  if (db.getUserByUsername(username)) {
    utils.setFlash(res, "Username ist bereits vergeben.");
    return redirectWE1(req, res, "/register");
  }

  // Email (fehler)
  if (db.getUserByEmail(email)) {
    utils.setFlash(res, "E-Mail ist bereits vergeben.");
    return redirectWE1(req, res, "/register");
  }

  const passwordHash = Bun.password.hashSync(password);

  try {
    db.createUser(username, email, passwordHash);
  } catch {
    utils.setFlash(res, "Registrierung fehlgeschlagen.");
    return redirectWE1(req, res, "/register");
  }

  return redirectWE1(req, res, "/login");
});

// LOGOUT
app.get("/logout", (req, res) => {
  res.clearCookie("user_id");
  return redirectWE1(req, res, "/login");
});

app.use(requireAuth);

// DASHBOARD
app.get("/dashboard", (req: any, res) => {
  const rooms = db.getAllRooms();
  const currentUser = req.user;

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

// ROOMS (Liste)
app.get("/rooms", (req, res) => {
  const rooms = db.getAllRooms();
  const errorRoomExists = req.query.error === "room-exists";

  res.render("rooms", {
    title: "Rooms",
    rooms,
    onlineCount: 12,
    errorRoomExists,
  });
});

// ROOMS (create)
app.post("/rooms", (req, res) => {
  const name = String(req.body.name ?? "").trim();
  if (name.length === 0) return redirectWE1(req, res, "/rooms");

  try {
    db.createRoom(name);
    return redirectWE1(req, res, "/rooms");
  } catch {
    return redirectWE1(req, res, "/rooms?error=room-exists");
  }
});

// ROOM EDIT (Form)
app.get("/room/:id/edit", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).send("Ungültige room id");

  const room = db.getRoomById(id);
  if (!room) return res.status(404).send("Room nicht gefunden");

  res.render("room-edit", { title: "Room bearbeiten", room });
});

// ROOM EDIT (save)
app.post("/room/:id/edit", (req, res) => {
  const id = Number(req.params.id);
  const name = String(req.body.name ?? "").trim();

  if (!Number.isFinite(id)) return res.status(400).send("Ungültige room id");
  if (name.length === 0) return redirectWE1(req, res, `/room/${id}/edit?error=empty`);

  try {
    db.updateRoomName(id, name);
    return redirectWE1(req, res, "/rooms");
  } catch {
    return redirectWE1(req, res, `/room/${id}/edit?error=exists`);
  }
});

// CHAT
app.get("/chat", (req: any, res) => {
  const roomId = Number(req.query.roomId ?? 2);

  const rooms = db.getAllRooms();
  if (rooms.length === 0) return res.status(500).send("Keine Räume in der Datenbank.");

  const room = rooms.find((rr) => rr.id === roomId) ?? rooms[0];
  if (!room) return res.status(500).send("Konnte keinen Raum bestimmen.");

  const currentUser = req.user;

  const messagesRaw = db.getMessagesForRoom(room.id);
  const messages = messagesRaw.map((m) => ({
    id: m.id,
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
app.get("/profile", (req: any, res) => {
  const currentUser = req.user;

  res.render("profile", {
    title: "Profil / Einstellungen",
    user: currentUser,
  });
});

// MESSAGE EDIT (Form)
app.get("/message/:id/edit", (req, res) => {
  const id = Number(req.params.id);
  const roomId = Number(req.query.roomId);

  if (!Number.isFinite(id)) return res.status(400).send("Ungültige message id");

  const msg = db.getMessageById(id);
  if (!msg) return res.status(404).send("Nachricht nicht gefunden");

  res.render("message-edit", {
    title: "Nachricht bearbeiten",
    message: msg,
    roomId: Number.isFinite(roomId) && roomId > 0 ? roomId : msg.room_id,
  });
});

// MESSAGE EDIT (save)
app.post("/message/:id/edit", (req, res) => {
  const id = Number(req.params.id);
  const roomId = Number(req.body.roomId);
  const text = String(req.body.text ?? "").trim();

  if (!Number.isFinite(id)) return res.status(400).send("Ungültige message id");
  if (text.length === 0) return res.redirect("back");

  db.updateMessageText(id, text);

  if (Number.isFinite(roomId) && roomId > 0) {
    return redirectWE1(req, res, `/chat?roomId=${roomId}`);
  }
  return redirectWE1(req, res, "/rooms");
});

// MESSAGE DELETE
app.get("/message/:id/delete", (req, res) => {
  const id = Number(req.params.id);
  const roomId = Number(req.query.roomId);

  if (!Number.isFinite(id)) return res.status(400).send("Ungültige message id");

  db.deleteMessage(id);

  if (Number.isFinite(roomId) && roomId > 0) {
    return redirectWE1(req, res, `/chat?roomId=${roomId}`);
  }
  return redirectWE1(req, res, "/rooms");
});

// MESSAGE SEND
app.post("/chat/message", (req: any, res) => {
  const roomId = Number(req.body.roomId);
  const text = String(req.body.text ?? "").trim();

  if (!Number.isFinite(roomId) || roomId <= 0 || text.length === 0) {
    return res.redirect("back");
  }

  const currentUser = req.user;
  db.insertMessage(roomId, currentUser.id, text);

  return redirectWE1(req, res, `/chat?roomId=${roomId}`);
});

// 404
app.use((_req, res) => {
  res.status(404).type("text/plain").send("404 – Not Found");
});

app.listen(port, () => {
  console.log(`Server läuft auf http://localhost:${port}`);
});
