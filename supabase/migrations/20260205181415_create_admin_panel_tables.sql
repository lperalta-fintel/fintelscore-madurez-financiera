/*
  # Admin Panel Database Schema

  1. New Tables
    - `admins`
      - `id` (uuid, primary key) - Unique identifier
      - `username` (text, unique) - Login username
      - `password_hash` (text) - Hashed password
      - `name` (text) - Display name
      - `created_at` (timestamptz) - Creation timestamp

    - `clients`
      - `id` (uuid, primary key) - Unique identifier
      - `name` (text) - Client name
      - `company` (text) - Company name
      - `email` (text) - Contact email
      - `phone` (text) - Phone number
      - `notes` (text) - Additional notes
      - `created_at` (timestamptz) - Creation timestamp

    - `questions_config`
      - `id` (uuid, primary key) - Unique identifier
      - `question_text` (text) - Question text
      - `category` (text) - Category name
      - `options` (jsonb) - Array of 3 options
      - `order_num` (integer) - Display order
      - `is_active` (boolean) - Whether question is active
      - `created_at` (timestamptz) - Creation timestamp

    - `anchor_rules`
      - `id` (uuid, primary key) - Unique identifier
      - `name` (text) - Rule name
      - `description` (text) - Rule description
      - `config` (jsonb) - Rule configuration (question_id, trigger_value, max_level, alert_message)
      - `is_active` (boolean) - Whether rule is active
      - `created_at` (timestamptz) - Creation timestamp

  2. Modifications
    - Add `client_id` foreign key to `quiz_leads` for linking assessments to clients

  3. Security
    - Enable RLS on all new tables
    - Policies allow anon to read questions/rules for quiz
    - Service role has full access for admin operations

  4. Initial Data
    - Default admin user (admin / admin1234)
    - Default questions from existing quiz
    - Default anchor rules from existing scoring logic
*/

CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  name text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  company text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS questions_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_text text NOT NULL,
  category text NOT NULL,
  options jsonb NOT NULL DEFAULT '[]',
  order_num integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS anchor_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  config jsonb NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quiz_leads' AND column_name = 'client_id'
  ) THEN
    ALTER TABLE quiz_leads ADD COLUMN client_id uuid REFERENCES clients(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(name);
CREATE INDEX IF NOT EXISTS idx_clients_company ON clients(company);
CREATE INDEX IF NOT EXISTS idx_questions_config_order ON questions_config(order_num);
CREATE INDEX IF NOT EXISTS idx_quiz_leads_client_id ON quiz_leads(client_id);

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE anchor_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon to read active questions"
  ON questions_config
  FOR SELECT
  TO anon
  USING (is_active = true);

CREATE POLICY "Allow anon to read active rules"
  ON anchor_rules
  FOR SELECT
  TO anon
  USING (is_active = true);

CREATE POLICY "Allow service role full access to admins"
  ON admins
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow service role full access to clients"
  ON clients
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow service role full access to questions_config"
  ON questions_config
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow service role full access to anchor_rules"
  ON anchor_rules
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow service role full access to quiz_leads"
  ON quiz_leads
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow service role full access to quiz_responses"
  ON quiz_responses
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

INSERT INTO admins (username, password_hash, name)
VALUES ('admin', 'admin1234', 'Administrador')
ON CONFLICT (username) DO NOTHING;

INSERT INTO questions_config (question_text, category, options, order_num, is_active) VALUES
  ('Como esta hoy tu contabilidad y control administrativo?', 'Contabilidad', '["Basico o desordenado; cierres y conciliaciones no siempre estan al dia.", "Ordenado, con controles claros y analisis basicos de margenes.", "Integrado, con procesos financieros dinamicos y reportes para decision."]', 1, true),
  ('Como planificas financieramente el ano?', 'Presupuesto', '["No hay presupuesto formal; se maneja el dia a dia.", "Hay presupuesto, proyeccion de flujo y seguimiento basico.", "Se usan forecasts dinamicos, escenarios y planes de crecimiento."]', 2, true),
  ('Que tan claro tienes que te deja dinero y que no?', 'Rentabilidad', '["No esta claro o es solo una percepcion general.", "Se mide por producto/cliente con indicadores y dashboards.", "Es una herramienta clave para estrategia y ventaja competitiva."]', 3, true),
  ('Que rol juega la tecnologia en tus finanzas?', 'Tecnologia', '["Procesos manuales o Excel basico.", "Dashboards y reportes parcialmente automatizados.", "BI / ERP integrados para decisiones estrategicas."]', 4, true),
  ('Como participa Finanzas en las decisiones del negocio?', 'Rol Financiero', '["Cumple funciones operativas y fiscales.", "Apoya con analisis y control del desempeno.", "Actua como copiloto estrategico o gobierno corporativo."]', 5, true),
  ('Que tan controlado y predecible es tu flujo de caja?', 'Flujo de Efectivo', '["Reactivo; se revisa cuando hay problemas.", "Proyectado a corto plazo y con control basico.", "Gestionado estrategicamente para inversion y crecimiento."]', 6, true),
  ('Como mides el desempeno financiero?', 'KPIs', '["No hay KPIs claros o se revisan de forma informal.", "KPIs basicos con seguimiento periodico.", "KPIs estrategicos integrados a decisiones y gobierno."]', 7, true),
  ('Como se toman las decisiones importantes?', 'Decisiones', '["Principalmente por intuicion o urgencia.", "Apoyadas en reportes financieros.", "Basadas en analisis de escenarios financieros."]', 8, true),
  ('Que tan preparada esta tu empresa para crecer sin perder control?', 'Escalabilidad', '["No hay estructura clara para escalar.", "Hay procesos definidos, pero no totalmente integrados.", "Existe estructura financiera solida y escalable."]', 9, true),
  ('Como ves el rol de las finanzas en el futuro de tu empresa?', 'Vision', '["Como un area de soporte y cumplimiento.", "Como una herramienta de control y optimizacion.", "Como motor estrategico de crecimiento y valor."]', 10, true)
ON CONFLICT DO NOTHING;

INSERT INTO anchor_rules (name, description, config, is_active) VALUES
  ('Regla de Contabilidad Basica', 'Si la contabilidad es basica (Q1=opcion 0) y el nivel calculado es 4+, limita a nivel 3', '{"question_id": 1, "trigger_value": 0, "min_calculated_level": 4, "max_level": 3, "alert_message": "Tu vision estrategica es alta, pero la base contable limita tu nivel real. Es fundamental fortalecer los cimientos antes de avanzar."}', true),
  ('Regla de Rol Financiero', 'Si el rol financiero no es estrategico (Q5 != opcion 2) y nivel calculado es 5, limita a nivel 4', '{"question_id": 5, "trigger_value_not": 2, "min_calculated_level": 5, "max_level": 4, "alert_message": "Para alcanzar el Nivel 5, la direccion financiera debe ser parte activa del gobierno corporativo."}', true),
  ('Regla de Escalabilidad', 'Si escalabilidad no es solida (Q9 != opcion 2) y nivel calculado es 5, limita a nivel 4', '{"question_id": 9, "trigger_value_not": 2, "min_calculated_level": 5, "max_level": 4, "alert_message": "Para alcanzar el Nivel 5, tu empresa necesita una estructura financiera solida y escalable."}', true)
ON CONFLICT DO NOTHING;