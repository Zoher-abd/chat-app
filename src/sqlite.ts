import Database from "bun:sqlite";

let db: Database;

export async function connect() {
  db = new Database("data/chat.db");
}

// TYPES
export type User = {
  id: number;
  username: string;
  email: string;
};

export type Room = {
  id: number;
  name: string;
};

export type Message = {
  id: number;
  text: string;
  user_id: number;
  room_id: number;
  author: string;
};

// QUERIES
export function getAllUsers(): User[] {
  return db.query("SELECT id, username, email FROM user").all() as User[];
}

export function getAllRooms(): Room[] {
  return db.query("SELECT id, name FROM room").all() as Room[];
}

export function getMessagesForRoom(roomId: number): Message[] {
  return db
    .query(
      `SELECT m.id, m.text, m.user_id, m.room_id,
              u.username AS author
       FROM message m
       JOIN user u ON u.id = m.user_id
       WHERE m.room_id = ?
       ORDER BY m.id`
    )
    .all(roomId) as Message[];
}
