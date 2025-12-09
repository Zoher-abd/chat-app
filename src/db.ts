
import { Database } from "bun:sqlite";

export type User = {
  id: number;
  username: string;
  email: string;
  created_at: string; 
};

export type Room = {
  id: number;
  name: string;
  
};

export type Message = {
  id: number;
  text: string;
  room_id: number;
  user_id: number;
  author: string;
  
};

const db = new Database("data/chat.db");
db.exec("PRAGMA foreign_keys = ON;");


export function getAllUsers(): User[] {
  const stmt = db.prepare(
    "select id, username, email, '' as created_at from user order by id"
  );
  return stmt.all() as User[];
}

export function getAllRooms(): Room[] {
  const stmt = db.prepare(
    "select id, name from room order by id"
  );
  return stmt.all() as Room[];
}

export function getMessagesForRoom(roomId: number): Message[] {
  const stmt = db.prepare(
    `select
       m.id,
       m.text,
       m.room_id,
       m.user_id,
       u.username as author
     from message m
     join user u on u.id = m.user_id
     where m.room_id = ?
     order by m.id`
  );
  return stmt.all(roomId) as Message[];
}

export function insertMessage(roomId: number, userId: number, text: string) {

  const stmt = db.prepare(
    "insert into message (text, room_id, user_id) values (?, ?, ?)"
  );
  stmt.run(text, roomId, userId);
}
