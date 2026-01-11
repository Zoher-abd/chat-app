export function redirectWE1(req: any, res: any, to: string) {
  const ref = String(req.headers.referer ?? "");
  const refMatch = ref.match(/\/service\/we1\/[^/]+/);
  const urlMatch = String(req.originalUrl ?? "").match(/^\/service\/we1\/[^/]+/);

  const prefix = (refMatch?.[0] ?? urlMatch?.[0] ?? "");
  return res.redirect(prefix + to);
}
