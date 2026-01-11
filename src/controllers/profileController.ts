import type { Response } from "express";

export function getProfile(req: any, res: Response) {
  res.render("profile", { title: "Profil / Einstellungen", user: req.user });
}
