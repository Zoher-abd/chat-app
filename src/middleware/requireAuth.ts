import { parseCookies } from "../utils/cookies";
import { getUserById } from "../repositories/userRepo";
import { redirectWE1 } from "../utils/redirect";

export function requireAuth(req: any, res: any, next: any) {
  const cookies = parseCookies(req.header("Cookie"));
  const rawId = cookies["user_id"];
  if (!rawId) return redirectWE1(req, res, "/login");

  const id = Number(rawId);
  if (!Number.isFinite(id)) return redirectWE1(req, res, "/login");

  const user = getUserById(id);
  if (!user) return redirectWE1(req, res, "/login");

  req.user = user;
  res.locals.user = user;
  next();
}
