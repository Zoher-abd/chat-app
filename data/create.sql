-- USER: registrierte Benutzer der Chat-App
create table if not exists user (
  id            integer primary key,
  username      text    not null unique,
  email         text    not null unique,
  password_hash text    not null,
  status        text    not null default 'offline',
  created_at    text    not null
);

-- ROOM: Chat-Räume
create table if not exists room (
  id         integer primary key,
  name       text    not null unique,
  is_public  integer not null default 1,   -- 1 = öffentlich, 0 = privat
  created_at text    not null
);

-- ROOM_MEMBER: Zuordnung User <-> Room (Mitgliedschaft)
create table if not exists room_member (
  id         integer primary key,
  user_id    integer not null,
  room_id    integer not null,
  role       text    not null default 'member',  -- z.B. member / admin
  joined_at  text    not null,

  foreign key (user_id) references user(id),
  foreign key (room_id) references room(id),

  -- Ein User soll pro Raum nur einmal vorkommen
  unique (user_id, room_id)
);

-- MESSAGE: Nachrichten in einem Raum
create table if not exists message (
  id         integer primary key,
  user_id    integer not null,
  room_id    integer not null,
  text       text    not null,
  sent_at    text    not null,

  foreign key (user_id) references user(id),
  foreign key (room_id) references room(id)
);
