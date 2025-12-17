-- === Testdaten USER ===
insert into user (username, email, password_hash, status, created_at) values
  ('zoher', 'zoher@example.com', 'hash123', 'online',  datetime()),
  ('anna',  'anna@example.com',  'hash234', 'offline', datetime()),
  ('mike',  'mike@example.com',  'hash345', 'online',  datetime()),
  ('sarah', 'sarah@example.com', 'hash456', 'away',    datetime());

-- === Testdaten ROOM ===
insert into room (name, is_public, created_at) values
  ('Allgemein', 1, datetime()),
  ('Raum 2',    1, datetime()),
  ('Gaming',    1, datetime());

-- === Testdaten ROOM_MEMBER ===
insert into room_member (user_id, room_id, role, joined_at) values
  (1, 1, 'admin',  datetime()),
  (2, 1, 'member', datetime()),
  (3, 1, 'member', datetime()),

  (1, 2, 'member', datetime()),
  (2, 2, 'admin',  datetime()),

  (3, 3, 'member', datetime()),
  (4, 3, 'member', datetime());

-- === Testdaten MESSAGE ===
insert into message (user_id, room_id, text, sent_at) values
  (2, 2, 'Hallo zoher! 😊',            datetime()),
  (1, 2, 'Hey Anna 👋',               datetime()),
  (2, 2, 'Wie läuft dein Projekt?',   datetime()),
  (3, 1, 'Willkommen im Allgemein-Chat!', datetime()),
  (4, 3, 'Wer zockt heute Abend?',    datetime());
