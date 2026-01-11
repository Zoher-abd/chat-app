import { getFlash } from "../utils/flash";

export function flashMiddleware(req: any, res: any, next: any) {
  res.locals.flash = getFlash(req, res);
  next();
}
