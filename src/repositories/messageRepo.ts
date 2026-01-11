import { getDb } from "./database";

export type Message = {
  id: number;
  text: string;
  user_id: number;
  room_id: number;
  author: string;
};

export function getMessagesForRoom(roomId: number): Message[] {
  const db = getDb();
  return db
    .query(
      `SELECT
         m.id,
         m.text,
         m.user_id,
         m.room_id,
         u.username AS author
       FROM message m
       JOIN user u ON u.id = m.user_id
       WHERE m.room_id = ?
       ORDER BY m.id`
    )
    .all(roomId) as Message[];
}

export function getMessageById(id: number): any {
  const db = getDb();
  return db
    .query(
      `SELECT m.id, m.text, m.user_id, m.room_id,
              u.username AS author
       FROM message m
       JOIN user u ON u.id = m.user_id
       WHERE m.id = ?`
    )
    .get(id);
}

export function insertMessage(roomId: number, userId: number, text: string) {
  const db = getDb();
  db.query("INSERT INTO message (user_id, room_id, text, sent_at) VALUES (?, ?, ?, datetime())").run(
    userId,
    roomId,
    text
  );
}

export function updateMessageText(id: number, newText: string) {
  const db = getDb();
  db.query("UPDATE message SET text = ? WHERE id = ?").run(newText, id);
}

export function deleteMessage(id: number) {
  const db = getDb();
  db.query("DELETE FROM message WHERE id = ?").run(id);
}
