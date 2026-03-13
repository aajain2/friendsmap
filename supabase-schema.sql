-- Run this in your Supabase SQL Editor to set up the database

-- Create the users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  node_color TEXT NOT NULL,
  summer_city TEXT NOT NULL,
  summer_lat FLOAT8 NOT NULL,
  summer_lng FLOAT8 NOT NULL,
  summer_activity TEXT,
  year1_city TEXT NOT NULL,
  year1_lat FLOAT8 NOT NULL,
  year1_lng FLOAT8 NOT NULL,
  year1_activity TEXT,
  year2_city TEXT NOT NULL,
  year2_lat FLOAT8 NOT NULL,
  year2_lng FLOAT8 NOT NULL,
  year2_activity TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read
CREATE POLICY "Anyone can read users" ON users
  FOR SELECT USING (true);

-- Allow anyone to insert
CREATE POLICY "Anyone can insert users" ON users
  FOR INSERT WITH CHECK (true);
