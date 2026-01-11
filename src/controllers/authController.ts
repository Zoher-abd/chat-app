import type { Request, Response } from "express";
import { redirectWE1 } from "../utils/redirect";
import { setFlash } from "../utils/flash";
import { createUser, getUserByEmail, getUserByUsername } from "../repositories/userRepo";

function checkCredentials(loginOrEmail: string, password: string) {
  const key = loginOrEmail.trim();
  if (!key) return null;

  const user = getUserByUsername(key) ?? getUserByEmail(key);
  if (!user || !user.password_hash) return null;

  const ok = Bun.password.verifySync(password, user.password_hash);
  if (!ok) return null;

  return { id: user.id, username: user.username, email: user.email };
}

export function getLogin(_req: Request, res: Response) {
  res.render("login", { title: "Login" });
}

export function postLogin(req: Request, res: Response) {
  const loginOrEmail = String(req.body.username ?? "").trim();
  const password = String(req.body.password ?? "");

  const user = checkCredentials(loginOrEmail, password);
  if (!user) {
    setFlash(res, "Anmeldung fehlgeschlagen");
    return redirectWE1(req, res, "/login");
  }

  res.cookie("user_id", String(user.id), { httpOnly: true, sameSite: "lax" });
  return redirectWE1(req, res, "/dashboard");
}

export function getRegister(_req: Request, res: Response) {
  res.render("register", { title: "Registrieren" });
}

export function postRegister(req: Request, res: Response) {
  const username = String(req.body.username ?? "").trim();
  const email = String(req.body.email ?? "").trim();
  const password = String(req.body.password ?? "");
  const password2 = String(req.body.password2 ?? "");

  if (!username || !email || !password || !password2) {
    setFlash(res, "Bitte alle Felder ausfüllen.");
    return redirectWE1(req, res, "/register");
  }
  if (password.length < 8) {
    setFlash(res, "Passwort muss mindestens 8 Zeichen lang sein.");
    return redirectWE1(req, res, "/register");
  }
  if (password !== password2) {
    setFlash(res, "Passwörter stimmen nicht überein.");
    return redirectWE1(req, res, "/register");
  }
  if (getUserByUsername(username)) {
    setFlash(res, "Username ist bereits vergeben.");
    return redirectWE1(req, res, "/register");
  }
  if (getUserByEmail(email)) {
    setFlash(res, "E-Mail ist bereits vergeben.");
    return redirectWE1(req, res, "/register");
  }

  const passwordHash = Bun.password.hashSync(password);
  try {
    createUser(username, email, passwordHash);
  } catch {
    setFlash(res, "Registrierung fehlgeschlagen.");
    return redirectWE1(req, res, "/register");
  }

  return redirectWE1(req, res, "/login");
}

export function logout(req: Request, res: Response) {
  res.clearCookie("user_id");
  return redirectWE1(req, res, "/login");
}



