DROP TABLE IF EXISTS guests;

CREATE TABLE IF NOT EXISTS guests (
  guest_id INTEGER PRIMARY KEY,
  guest_name TEXT NOT NULL,
  is_attending INTEGER NOT NULL,
  guest_meal TEXT NOT NULL,
  guest_diet TEXT,
  group_id TEXT NOT NULL,
  group_email TEXT,
  response_date TEXT,
  user_location TEXT,
  user_agent TEXT
);
