import { getDb } from "./database";

export type User = {
  id: number;
  username: string;
  email: string;
  password_hash?: string;
};

export function getUserById(id: number): User | null {
  const db = getDb();
  const row = db.query("SELECT id, username, email FROM user WHERE id = ?").get(id) as
    | User
    | undefined;
  return row ?? null;
}

export function getUserByUsername(username: string): User | null {
  const db = getDb();
  const row = db
    .query("SELECT id, username, email, password_hash FROM user WHERE username = ?")
    .get(username) as User | undefined;
  return row ?? null;
}

export function getUserByEmail(email: string): User | null {
  const db = getDb();
  const row = db
    .query("SELECT id, username, email, password_hash FROM user WHERE email = ?")
    .get(email) as User | undefined;
  return row ?? null;
}

export function createUser(username: string, email: string, passwordHash: string) {
  const db = getDb();
  db.query(
    `INSERT INTO user (username, email, password_hash, status, created_at)
     VALUES (?, ?, ?, 'offline', datetime())`
  ).run(username.trim(), email.trim(), passwordHash);
}
