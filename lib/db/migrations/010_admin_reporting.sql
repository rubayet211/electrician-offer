CREATE TABLE IF NOT EXISTS maintenance_log (id text PRIMARY KEY, date date NOT NULL, minutes integer NOT NULL CHECK (minutes >= 0), description text NOT NULL);
