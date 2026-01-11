import { getDb } from "./database";

export type Room = { id: number; name: string };

export function getAllRooms(): Room[] {
  const db = getDb();
  return db.query("SELECT id, name FROM room ORDER BY id").all() as Room[];
}

export function getRoomById(id: number): Room | null {
  const db = getDb();
  const row = db.query("SELECT id, name FROM room WHERE id = ?").get(id) as Room | undefined;
  return row ?? null;
}

export function createRoom(name: string) {
  const db = getDb();
  db.query("INSERT INTO room (name, is_public, created_at) VALUES (?, 1, datetime())").run(
    name.trim()
  );
}

export function updateRoomName(id: number, name: string) {
  const db = getDb();
  db.query("UPDATE room SET name = ? WHERE id = ?").run(name.trim(), id);
}
