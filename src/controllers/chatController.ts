import type { Request, Response } from "express";
import {
  deleteMessage,
  getMessageById,
  getMessagesForRoom,
  insertMessage,
  updateMessageText,
} from "../repositories/messageRepo";
import { getAllRooms } from "../repositories/roomRepo";
import { redirectWE1 } from "../utils/redirect";
import { sse } from "../sse";

export function getChat(req: any, res: Response) {
  const roomId = Number(req.query.roomId ?? 2);

  const rooms = getAllRooms();
  if (rooms.length === 0) return res.status(500).send("Keine Räume in der Datenbank.");

  const room = rooms.find((r) => r.id === roomId) ?? rooms[0];
  if (!room) return res.status(500).send("Konnte keinen Raum bestimmen.");

  const currentUser = req.user;

  const messagesRaw = getMessagesForRoom(room.id);
  const messages = messagesRaw.map((m) => ({
    id: m.id,
    author: m.author,
    text: m.text,
    mine: m.user_id === currentUser.id,
  }));

  res.render("chat", {
    title: `Chat – ${room.name}`,
    activeRoom: room,
    user: currentUser,
    messages,
    typingUser: "Anna",
  });
}

export function postMessage(req: any, res: Response) {
  // ✅ robust gegen undefined body
  const roomId = Number(req.body?.roomId);
  const text = String(req.body?.text ?? "").trim();

  if (!Number.isFinite(roomId) || roomId <= 0 || text.length === 0) {
    return res.status(400).send("Bad Request");
  }

  insertMessage(roomId, req.user.id, text);

  // ✅ live update: alle reloaden
  sse.send({ op: "refresh" });

  // ✅ wichtig: kein redirect für fetch
  return res.status(204).end();
}

export function getMessageEdit(req: Request, res: Response) {
  const id = Number(req.params.id);
  const roomId = Number(req.query.roomId);

  if (!Number.isFinite(id)) return res.status(400).send("Ungültige message id");

  const msg = getMessageById(id);
  if (!msg) return res.status(404).send("Nachricht nicht gefunden");

  res.render("message-edit", {
    title: "Nachricht bearbeiten",
    message: msg,
    roomId: Number.isFinite(roomId) && roomId > 0 ? roomId : msg.room_id,
  });
}

export function postMessageEdit(req: Request, res: Response) {
  const id = Number(req.params.id);
  const roomId = Number(req.body?.roomId);
  const text = String(req.body?.text ?? "").trim();

  if (!Number.isFinite(id)) return res.status(400).send("Ungültige message id");
  if (!text) return res.redirect("back");

  updateMessageText(id, text);

  // reload für alle
  sse.send({ op: "refresh" });

  if (Number.isFinite(roomId) && roomId > 0) return redirectWE1(req, res, `/chat?roomId=${roomId}`);
  return redirectWE1(req, res, "/rooms");
}

export function getMessageDelete(req: Request, res: Response) {
  const id = Number(req.params.id);
  const roomId = Number(req.query.roomId);

  if (!Number.isFinite(id)) return res.status(400).send("Ungültige message id");

  deleteMessage(id);

  // reload für alle
  sse.send({ op: "refresh" });

  if (Number.isFinite(roomId) && roomId > 0) return redirectWE1(req, res, `/chat?roomId=${roomId}`);
  return redirectWE1(req, res, "/rooms");
}
