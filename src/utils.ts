import type { Request, Response } from "express";
import { parseCookies } from "./cookies";

export function setFlash(res: Response, message: string) {
  res.cookie("flash", encodeURIComponent(message), {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 2 * 60 * 1000,
  });
}

export function getFlash(req: Request, res: Response): string | null {
  const cookies = parseCookies(req.header("Cookie"));
  const raw = cookies["flash"];
  if (!raw) return null;

  res.clearCookie("flash");

  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}
