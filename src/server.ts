import express from "express";
import { engine } from "express-handlebars";
import * as path from "node:path";

import { connect, initFromSqlFiles } from "./repositories/database";
import { baseMiddleware } from "./middleware/baseMiddleware";
import { flashMiddleware } from "./middleware/flashMiddleware";
import { requireAuth } from "./middleware/requireAuth";
import { redirectWE1 } from "./utils/redirect";

import * as auth from "./controllers/authController";
import * as rooms from "./controllers/roomController";
import * as chat from "./controllers/chatController";
import * as profile from "./controllers/profileController";

const app = express();
const port = 8080;

app.set("trust proxy", true);

// Paths
const rootDir = process.cwd();
const viewsPath = path.join(rootDir, "views");
const layoutsPath = path.join(viewsPath, "layouts");
const partialsPath = path.join(viewsPath, "partials");
const staticPath = path.join(rootDir, "static");
const createSqlPath = path.join(rootDir, "data", "create.sql");
const populateSqlPath = path.join(rootDir, "data", "populate.sql");

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(baseMiddleware);
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

// Flash
app.use(flashMiddleware);

// DB init
connect("data/chat.db");
initFromSqlFiles(createSqlPath, populateSqlPath);

// Public routes
app.get("/health", (_req, res) => res.status(200).type("text/plain").send("The server is up and running."));
app.get("/", (req, res) => redirectWE1(req, res, "/login"));

app.get("/login", auth.getLogin);
app.post("/login", auth.postLogin);

app.get("/register", auth.getRegister);
app.post("/register", auth.postRegister);

// Logout 
app.get("/logout", auth.logout);

// Protected routes
app.use(requireAuth);

app.get("/dashboard", (req: any, res) => {
  res.render("dashboard", {
    title: "Chat-App Dashboard",
    user: req.user
  });
});


app.get("/rooms", rooms.listRooms);
app.post("/rooms", rooms.postRoom);

app.get("/room/:id/edit", rooms.getRoomEdit);
app.post("/room/:id/edit", rooms.postRoomEdit);

app.get("/chat", chat.getChat);
app.post("/chat/message", chat.postMessage);

app.get("/message/:id/edit", chat.getMessageEdit);
app.post("/message/:id/edit", chat.postMessageEdit);

app.get("/message/:id/delete", chat.getMessageDelete);

app.get("/profile", profile.getProfile);

// 404
app.use((_req, res) => res.status(404).type("text/plain").send("404 – Not Found"));

app.listen(port, () => console.log(`Server läuft auf http://localhost:${port}`));
