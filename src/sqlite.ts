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

// Optional (falls du später Nachrichten senden willst)
export function insertMessage(roomId: number, userId: number, text: string) {
  db.query(
    "INSERT INTO message (user_id, room_id, text, sent_at) VALUES (?, ?, ?, datetime())"
  ).run(userId, roomId, text);
}
