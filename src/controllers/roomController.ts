import type { Request, Response } from "express";
import { createRoom, getAllRooms, getRoomById, updateRoomName } from "../repositories/roomRepo";
import { redirectWE1 } from "../utils/redirect";

export function listRooms(req: Request, res: Response) {
  const rooms = getAllRooms();
  const errorRoomExists = req.query.error === "room-exists";

  res.render("rooms", {
    title: "Rooms",
    rooms,
    onlineCount: 12,
    errorRoomExists,
  });
}

export function postRoom(req: Request, res: Response) {
  const name = String(req.body.name ?? "").trim();
  if (!name) return redirectWE1(req, res, "/rooms");

  try {
    createRoom(name);
    return redirectWE1(req, res, "/rooms");
  } catch {
    return redirectWE1(req, res, "/rooms?error=room-exists");
  }
}

export function getRoomEdit(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).send("Ungültige room id");

  const room = getRoomById(id);
  if (!room) return res.status(404).send("Room nicht gefunden");

  res.render("room-edit", { title: "Room bearbeiten", room });
}

export function postRoomEdit(req: Request, res: Response) {
  const id = Number(req.params.id);
  const name = String(req.body.name ?? "").trim();

  if (!Number.isFinite(id)) return res.status(400).send("Ungültige room id");
  if (!name) return redirectWE1(req, res, `/room/${id}/edit?error=empty`);

  try {
    updateRoomName(id, name);
    return redirectWE1(req, res, "/rooms");
  } catch {
    return redirectWE1(req, res, `/room/${id}/edit?error=exists`);
  }
}

