import Database from "bun:sqlite";

let db: Database;

// TYPES
export type User = {
  id: number;
  username: string;
  email: string;
  status?: string;
  created_at?: string;
};

export type Room = {
  id: number;
  name: string;
  is_public?: number;
  created_at?: string;
};

export type Message = {
  id: number;
  text: string;
  user_id: number;
  room_id: number;
  sent_at?: string;
  author: string;
};

// CONNECT
export function connect() {
  db = new Database("data/chat.db");
  db.exec("PRAGMA foreign_keys = ON;");
}

// QUERIES
export function getAllUsers(): User[] {
  return db.query("SELECT id, username, email FROM user ORDER BY id").all() as User[];
}

export function getAllRooms(): Room[] {
  return db.query("SELECT id, name FROM room ORDER BY id").all() as Room[];
}

export function getMessagesForRoom(roomId: number): Message[] {
  return db
    .query(
      `SELECT
         m.id,
         m.text,
         m.user_id,
         m.room_id,
         m.sent_at,
         u.username AS author
       FROM message m
       JOIN user u ON u.id = m.user_id
       WHERE m.room_id = ?
       ORDER BY m.id`
    )
    .all(roomId) as Message[];
}

export function insertMessage(roomId: number, userId: number, text: string) {
  db.query(
    "INSERT INTO message (user_id, room_id, text, sent_at) VALUES (?, ?, ?, datetime())"
  ).run(userId, roomId, text);
}

export function deleteMessage(messageId: number) {
  db.query("DELETE FROM message WHERE id = ?").run(messageId);
}

export function getMessageById(id: number) {
  return db
    .query(
      `SELECT m.id, m.text, m.user_id, m.room_id, m.sent_at,
              u.username AS author
       FROM message m
       JOIN user u ON u.id = m.user_id
       WHERE m.id = ?`
    )
    .get(id) as any;
}

export function updateMessageText(id: number, newText: string) {
  db.query("UPDATE message SET text = ? WHERE id = ?").run(newText, id);
}

export function createRoom(name: string) {
  const trimmed = name.trim();
  db.query(
    "INSERT INTO room (name, is_public, created_at) VALUES (?, 1, datetime())"
  ).run(trimmed);
}

export function getRoomById(id: number) {
  return db.query("SELECT id, name FROM room WHERE id = ?").get(id) as
    | { id: number; name: string }
    | undefined;
}

export function updateRoomName(id: number, name: string) {
  const trimmed = name.trim();
  db.query("UPDATE room SET name = ? WHERE id = ?").run(trimmed, id);
}

