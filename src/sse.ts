import type { Request, Response } from "express";

type Client = Response;

class SSE {
  private clients = new Set<Client>();

  init = (req: Request, res: Response) => {
    res.status(200);
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();

    this.clients.add(res);

    // ping damit Verbindung offen bleibt
    const ping = setInterval(() => {
      try {
        res.write(`data: ${JSON.stringify({ op: "ping" })}\n\n`);
      } catch {}
    }, 15000);

    req.on("close", () => {
      clearInterval(ping);
      this.clients.delete(res);
    });
  };

  send(payload: any) {
    const msg = `data: ${JSON.stringify(payload)}\n\n`;
    for (const c of this.clients) {
      try {
        c.write(msg);
      } catch {
        this.clients.delete(c);
      }
    }
  }
}

export const sse = new SSE();
