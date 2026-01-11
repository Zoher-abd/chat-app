import Database from "bun:sqlite";
import fs from "node:fs";
import path from "node:path";

let db: Database;

export function connect(dbPath = "data/chat.db") {
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  db = new Database(dbPath);
  db.exec("PRAGMA foreign_keys = ON;");
}

export function initFromSqlFiles(createSqlPath: string, populateSqlPath: string) {
  const createSql = fs.readFileSync(createSqlPath, "utf8");
  const populateSql = fs.readFileSync(populateSqlPath, "utf8");
  db.exec(createSql);
  db.exec(populateSql);
}

export function getDb() {
  if (!db) throw new Error("DB not connected. Call connect() first.");
  return db;
}

