import Database from "bun:sqlite";
import fs from "node:fs";
import path from "node:path";
import type { Request } from "express";
import { parseCookies } from "./cookies";

let db: Database;

// TYPES
export type User = {
  id: number;
  username: string;
  email: string;
  password_hash?: string;
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
export function connect(dbPath = "data/chat.db") {
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  db = new Database(dbPath);
  db.exec("PRAGMA foreign_keys = ON;");
}

// DB INIT
export function initFromSqlFiles(createSqlPath: string, populateSqlPath: string) {
  const createSql = fs.readFileSync(createSqlPath, "utf8");
  const populateSql = fs.readFileSync(populateSqlPath, "utf8");

  db.exec(createSql);
  db.exec(populateSql);
}

// USERS
export function getAllUsers(): User[] {
  return db.query("SELECT id, username, email FROM user ORDER BY id").all() as User[];
}

export function getUserById(id: number): User | null {
  const row = db
    .query("SELECT id, username, email FROM user WHERE id = ?")
    .get(id) as User | undefined;
  return row ?? null;
}

export function getUserByUsername(username: string): User | null {
  const row = db
    .query("SELECT id, username, email, password_hash FROM user WHERE username = ?")
    .get(username) as User | undefined;
  return row ?? null;
}

export function getUserByEmail(email: string): User | null {
  const row = db
    .query("SELECT id, username, email, password_hash FROM user WHERE email = ?")
    .get(email) as User | undefined;
  return row ?? null;
}

export function createUser(username: string, email: string, passwordHash: string) {
  db.query(
    `INSERT INTO user (username, email, password_hash, status, created_at)
     VALUES (?, ?, ?, 'offline', datetime())`
  ).run(username.trim(), email.trim(), passwordHash);
}


 // Login username  email
export function checkCredentials(loginOrEmail: string, password: string): User | null {
  const key = loginOrEmail.trim();
  if (!key) return null;

  const user = getUserByUsername(key) ?? getUserByEmail(key);
  if (!user || !user.password_hash) return null;

  const ok = Bun.password.verifySync(password, user.password_hash);
  if (!ok) return null;

  return { id: user.id, username: user.username, email: user.email };
}

export function authenticateUser(req: Request): User | null {
  const cookies = parseCookies(req.header("Cookie"));
  const rawId = cookies["user_id"];
  if (!rawId) return null;

  const id = Number(rawId);
  if (!Number.isFinite(id)) return null;

  return getUserById(id);
}

// ROOMS / MESSAGES
export function getAllRooms(): Room[] {
  return db.query("SELECT id, name FROM room ORDER BY id").all() as Room[];
}

export function getRoomById(id: number) {
  return db.query("SELECT id, name FROM room WHERE id = ?").get(id) as
    | { id: number; name: string }
    | undefined;
}

export function createRoom(name: string) {
  const trimmed = name.trim();
  db.query(
    "INSERT INTO room (name, is_public, created_at) VALUES (?, 1, datetime())"
  ).run(trimmed);
}

export function updateRoomName(id: number, name: string) {
  const trimmed = name.trim();
  db.query("UPDATE room SET name = ? WHERE id = ?").run(trimmed, id);
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
