import path from "node:path";

export function baseMiddleware(req: any, res: any, next: any) {
  res.locals.base = path.relative(path.dirname(req.path), "/") || ".";
  next();
}
