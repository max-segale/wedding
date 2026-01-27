DROP TABLE IF EXISTS guests;

CREATE TABLE IF NOT EXISTS guests (
  guest_id INTEGER PRIMARY KEY,
  group_id TEXT NOT NULL,
  guest_name TEXT NOT NULL,
  is_attending INTEGER NOT NULL,
  guest_meal TEXT,
  guest_note TEXT
);
