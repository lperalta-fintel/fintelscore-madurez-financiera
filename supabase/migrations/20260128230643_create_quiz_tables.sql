/*
  # FINTEL Score Quiz Database Schema

  1. New Tables
    - `quiz_leads`
      - `id` (uuid, primary key) - Unique identifier for each lead
      - `name` (text) - Contact name
      - `position` (text) - Job position/title (Cargo)
      - `company` (text) - Company name
      - `email` (text) - Contact email
      - `whatsapp` (text) - WhatsApp number
      - `created_at` (timestamptz) - When the lead was created

    - `quiz_responses`
      - `id` (uuid, primary key) - Unique identifier for each response
      - `lead_id` (uuid, foreign key) - Reference to the lead who took the quiz
      - `answers` (jsonb) - JSON object storing all 10 question answers
      - `raw_score` (integer) - Total points before anchor rules (0-100)
      - `calculated_level` (integer) - Level based on raw score (1-5)
      - `final_level` (integer) - Level after applying anchor rules (1-5)
      - `alerts` (jsonb) - Array of alert messages from anchor rules
      - `created_at` (timestamptz) - When the quiz was completed

  2. Security
    - Enable RLS on both tables
    - Add policy for public insert (leads can submit without authentication)
    - Add policy for authenticated reads (admin access only)

  3. Notes
    - The answers field stores: { "q1": "A", "q2": "B", ... }
    - The alerts field stores: ["Alert message 1", "Alert message 2", ...]
*/

CREATE TABLE IF NOT EXISTS quiz_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  position text NOT NULL,
  company text NOT NULL,
  email text NOT NULL,
  whatsapp text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS quiz_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES quiz_leads(id) ON DELETE CASCADE,
  answers jsonb NOT NULL DEFAULT '{}',
  raw_score integer NOT NULL DEFAULT 0,
  calculated_level integer NOT NULL DEFAULT 1,
  final_level integer NOT NULL DEFAULT 1,
  alerts jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quiz_responses_lead_id ON quiz_responses(lead_id);
CREATE INDEX IF NOT EXISTS idx_quiz_leads_email ON quiz_leads(email);
CREATE INDEX IF NOT EXISTS idx_quiz_leads_created_at ON quiz_leads(created_at DESC);

ALTER TABLE quiz_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert on quiz_leads"
  ON quiz_leads
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow public insert on quiz_responses"
  ON quiz_responses
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow authenticated select on quiz_leads"
  ON quiz_leads
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated select on quiz_responses"
  ON quiz_responses
  FOR SELECT
  TO authenticated
  USING (true);
