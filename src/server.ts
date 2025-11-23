import express from "express";
import { engine } from "express-handlebars";
import path from "path";

const app = express();
const port = 8080;

app.set("trust proxy", true);

const rootDir = process.cwd();
const viewsPath = path.join(rootDir, "views");
const layoutsPath = path.join(viewsPath, "layouts");
const partialsPath = path.join(viewsPath, "partials");
const staticPath = path.join(rootDir, "static");

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

// Healthcheck
app.get("/health", (_req, res) => {
  res.status(200).type("text/plain").send("The server is up and running.");
});

// Startseite -> Login
app.get("/", (_req, res) => {
  res.redirect("/login");
});

/**
 * LOGIN
 */
app.get("/login", (_req, res) => {
  const context = {
    layout: "main",
    title: "Login",
    form: {
      emailLabel: "E-Mail / Username",
      emailPlaceholder: "z. B. zoher@beispiel.de",
      passwordLabel: "Passwort",
      passwordPlaceholder: "••••••••",
      loginTarget: "/rooms",
      loginText: "Login",
    },
    register: {
      text: "Noch kein Account?",
      linkHref: "/register",
      linkText: "Registrieren",
    },
  };

  res.render("login", context);
});

/**
 * REGISTER
 */
app.get("/register", (_req, res) => {
  const context = {
    layout: "main",
    title: "Registrieren",
    form: {
      usernameLabel: "Username",
      usernamePlaceholder: "Dein Name",
      emailLabel: "E-Mail",
      emailPlaceholder: "name@mail.de",
      pw1Label: "Passwort",
      pw1Placeholder: "••••••••",
      pw2Label: "Passwort bestätigen",
      pw2Placeholder: "••••••••",
      submitTarget: "/rooms",
      submitText: "Konto erstellen",
      backHref: "/login",
      backText: "Zurück",
    },
  };

  res.render("register", context);
});

/**
 * DASHBOARD
 */
app.get("/dashboard", (_req, res) => {
  const context = {
    layout: "main",
    title: "Dashboard",
    user: {
      name: "Zoher",
    },
    stats: [
      { label: "Gesendete Nachrichten", value: "42" },
      { label: "Online-Zeit heute", value: "1h 15min" },
      { label: "Aktive Räume", value: "3" },
    ],
    shortcuts: [
      { href: "/chat", text: "➡ Direkt zum Chat", primary: true },
      { href: "/rooms", text: "🗂 Alle Räume", primary: false },
    ],
    news: [
      "🔹 Neue Chatfunktionen in Version 1.2",
      "🔹 Dunkelmodus jetzt verfügbar",
      "🔹 Freunde-Feature wird bald hinzugefügt!",
    ],
  };

  res.render("dashboard", context);
});

/**
 * ROOMS
 */
app.get("/rooms", (_req, res) => {
  const context = {
    layout: "main",
    title: "Rooms",
    user: {
      name: "Benutzer",
    },
    rooms: [
      { name: "Raum 1", status: "⚪" },
      { name: "Raum 2", status: "🟢 Online" },
      { name: "Raum 3", status: "⚪" },
    ],
    onlineCount: 12,
    navLinks: [
      { href: "/chat", label: "Zum Chatroom" },
      { href: "/profile", label: "Zum Profil" },
      { href: "/login", label: "Logout" },
    ],
  };

  res.render("rooms", context);
});

/**
 * CHAT
 */
app.get("/chat", (_req, res) => {
  const context = {
    layout: "main",
    title: "Chat",
    room: {
      name: "Raum 2",
      backHref: "/rooms",
      backText: "Zurück",
    },
    messages: [
      { cssClass: "msg", text: "🙂 <b>Anna:</b> Hallo!" },
      { cssClass: "msg me", text: "Hallo 👋" },
    ],
    typing: "Anna schreibt …",
    inputPlaceholder: "Nachricht eingeben …",
    sendText: "▶",
  };

  res.render("chat", context);
});

/**
 * PROFILE
 */
app.get("/profile", (_req, res) => {
  const context = {
    layout: "main",
    title: "Profil",
    user: {
      name: "Benutzer",
    },
    backHref: "/rooms",
    backText: "Zurück",
    menuItems: [
      "Sprache ändern",
      "Account wechseln",
      "Über uns",
      "Ausloggen",
    ],
  };

  res.render("profile", context);
});

app.listen(port, () => {
  console.log(`🚀 Server läuft auf http://localhost:${port}`);
});
