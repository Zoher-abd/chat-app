import express from "express";
import { engine } from "express-handlebars";
import path from "path";

const app = express();
const port = 8080;

app.set("trust proxy", true);

// Basis-Pfade
const rootDir = process.cwd();
const viewsPath = path.join(rootDir, "views");
const layoutsPath = path.join(viewsPath, "layouts");
const partialsPath = path.join(viewsPath, "partials");
const staticPath = path.join(rootDir, "static");

// Statische Dateien (z.B. /a03/style.css)
app.use(express.static(staticPath));

// Handlebars konfigurieren
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

// Health-Check
app.get("/health", (_req, res) => {
  res.status(200).type("text/plain").send("The server is up and running.");
});

// Startseite -> Login
app.get("/", (_req, res) => {
  res.redirect("/login");
});

/**
 * LOGIN-SCREEN
 */
app.get("/login", (_req, res) => {
  const context = {
    layout: "main",
    title: "Login",
    subtitle: "Melde dich bei der Chat-App an",
    hint: "Noch kein Account? Jetzt registrieren!",
  };

  res.render("login", context);
});

/**
 * REGISTER-SCREEN
 */
app.get("/register", (_req, res) => {
  const context = {
    layout: "main",
    title: "Registrieren",
    subtitle: "Erstelle deinen Account",
    benefits: [
      "Chatte mit anderen Nutzer:innen in Echtzeit",
      "Erstelle dein persönliches Profil",
      "Tritt verschiedenen Räumen bei",
    ],
  };

  res.render("register", context);
});

/**
 * DASHBOARD-SCREEN
 */
app.get("/dashboard", (_req, res) => {
  const context = {
    layout: "main",
    title: "Dashboard",
    user: {
      name: "Benutzer",
    },
    stats: {
      roomsJoined: 3,
      messagesSent: 42,
      onlineSince: "10 Minuten",
    },
    todos: [
      { title: "Profil vervollständigen", done: false },
      { title: "Einem neuen Raum beitreten", done: false },
      { title: "Willkommensnachricht im Chat schreiben", done: true },
    ],
  };

  res.render("dashboard", context);
});

/**
 * ROOMS-SCREEN
 */
app.get("/rooms", (_req, res) => {
  const context = {
    layout: "main",
    title: "Rooms",
    user: {
      name: "Benutzer",
    },
    rooms: [
      { name: "Raum 1", status: "⚪ Offline" },
      { name: "Raum 2", status: "🟢 Online" },
      { name: "Raum 3", status: "⚪ Offline" },
    ],
    onlineCount: 12,
  };

  res.render("rooms", context);
});

/**
 * CHAT-SCREEN
 */
app.get("/chat", (_req, res) => {
  const context = {
    layout: "main",
    title: "Chat",
    activeRoom: {
      name: "Raum 2",
    },
    user: {
      name: "Benutzer",
    },
    messages: [
      { author: "Alice", text: "Hey, alles klar?", time: "20:15", own: false },
      { author: "Benutzer", text: "Ja, alles gut!", time: "20:16", own: true },
      { author: "Bob", text: "Wer ist heute noch online?", time: "20:17", own: false },
    ],
  };

  res.render("chat", context);
});

/**
 * PROFILE-SCREEN
 */
app.get("/profile", (_req, res) => {
  const context = {
    layout: "main",
    title: "Profil",
    user: {
      name: "Benutzer",
      email: "user@example.com",
      status: "Online",
      joined: "01.01.2025",
      bio: "Ich nutze diese Chat-App, um mit Freunden in Kontakt zu bleiben.",
    },
    interests: ["Programmieren", "Gaming", "Musik", "Reisen"],
  };

  res.render("profile", context);
});

app.listen(port, () => {
  console.log(`🚀 Server läuft auf http://localhost:${port}`);
});
