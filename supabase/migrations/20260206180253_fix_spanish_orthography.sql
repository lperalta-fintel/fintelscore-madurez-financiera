/*
  # Corrección Ortográfica en Español

  Actualiza todos los textos en español para corregir:
  - Acentos y tildes faltantes
  - Signos de interrogación al inicio de preguntas
  - Ortografía general según normas de la RAE

  1. Correcciones en questions_config
    - Agrega signos de interrogación de apertura (¿)
    - Corrige todos los acentos faltantes
    - Corrige tildes en palabras como "Qué", "Cómo", etc.

  2. Correcciones en opciones
    - Corrige acentos en todas las opciones
    - Normaliza vocabulario técnico

  3. Correcciones en anchor_rules
    - Corrige descripciones y mensajes de alerta
    - Normaliza ortografía en configuraciones
*/

-- Actualizar preguntas con ortografía corregida
UPDATE questions_config SET question_text = '¿Cómo está hoy tu contabilidad y control administrativo?' WHERE order_num = 1;
UPDATE questions_config SET question_text = '¿Cómo planificas financieramente el año?' WHERE order_num = 2;
UPDATE questions_config SET question_text = '¿Qué tan claro tienes qué te deja dinero y qué no?' WHERE order_num = 3;
UPDATE questions_config SET question_text = '¿Qué rol juega la tecnología en tus finanzas?' WHERE order_num = 4;
UPDATE questions_config SET question_text = '¿Cómo participa Finanzas en las decisiones del negocio?' WHERE order_num = 5;
UPDATE questions_config SET question_text = '¿Qué tan controlado y predecible es tu flujo de caja?' WHERE order_num = 6;
UPDATE questions_config SET question_text = '¿Cómo mides el desempeño financiero?' WHERE order_num = 7;
UPDATE questions_config SET question_text = '¿Cómo se toman las decisiones importantes?' WHERE order_num = 8;
UPDATE questions_config SET question_text = '¿Qué tan preparada está tu empresa para crecer sin perder control?' WHERE order_num = 9;
UPDATE questions_config SET question_text = '¿Cómo ves el rol de las finanzas en el futuro de tu empresa?' WHERE order_num = 10;

-- Actualizar opciones con ortografía corregida
UPDATE questions_config SET options = '["Básico o desordenado; cierres y conciliaciones no siempre están al día.", "Ordenado, con controles claros y análisis básicos de márgenes.", "Integrado, con procesos financieros dinámicos y reportes para decisión."]'::jsonb WHERE order_num = 1;
UPDATE questions_config SET options = '["No hay presupuesto formal; se maneja el día a día.", "Hay presupuesto, proyección de flujo y seguimiento básico.", "Se usan forecasts dinámicos, escenarios y planes de crecimiento."]'::jsonb WHERE order_num = 2;
UPDATE questions_config SET options = '["No está claro o es solo una percepción general.", "Se mide por producto/cliente con indicadores y dashboards.", "Es una herramienta clave para estrategia y ventaja competitiva."]'::jsonb WHERE order_num = 3;
UPDATE questions_config SET options = '["Procesos manuales o Excel básico.", "Dashboards y reportes parcialmente automatizados.", "BI / ERP integrados para decisiones estratégicas."]'::jsonb WHERE order_num = 4;
UPDATE questions_config SET options = '["Cumple funciones operativas y fiscales.", "Apoya con análisis y control del desempeño.", "Actúa como copiloto estratégico o gobierno corporativo."]'::jsonb WHERE order_num = 5;
UPDATE questions_config SET options = '["Reactivo; se revisa cuando hay problemas.", "Proyectado a corto plazo y con control básico.", "Gestionado estratégicamente para inversión y crecimiento."]'::jsonb WHERE order_num = 6;
UPDATE questions_config SET options = '["No hay KPIs claros o se revisan de forma informal.", "KPIs básicos con seguimiento periódico.", "KPIs estratégicos integrados a decisiones y gobierno."]'::jsonb WHERE order_num = 7;
UPDATE questions_config SET options = '["Principalmente por intuición o urgencia.", "Apoyadas en reportes financieros.", "Basadas en análisis de escenarios financieros."]'::jsonb WHERE order_num = 8;
UPDATE questions_config SET options = '["No hay estructura clara para escalar.", "Hay procesos definidos, pero no totalmente integrados.", "Existe estructura financiera sólida y escalable."]'::jsonb WHERE order_num = 9;
UPDATE questions_config SET options = '["Como un área de soporte y cumplimiento.", "Como una herramienta de control y optimización.", "Como motor estratégico de crecimiento y valor."]'::jsonb WHERE order_num = 10;

-- Actualizar categorías con ortografía corregida
UPDATE questions_config SET category = 'Tecnología' WHERE order_num = 4;

-- Actualizar anchor rules con ortografía corregida
UPDATE anchor_rules 
SET 
  name = 'Regla de Contabilidad Básica',
  description = 'Si la contabilidad es básica (Q1=opción 0) y el nivel calculado es 4+, limita a nivel 3',
  config = '{"question_id": 1, "trigger_value": 0, "min_calculated_level": 4, "max_level": 3, "alert_message": "Tu visión estratégica es alta, pero la base contable limita tu nivel real. Es fundamental fortalecer los cimientos antes de avanzar."}'::jsonb
WHERE config->>'question_id' = '1';

UPDATE anchor_rules 
SET 
  description = 'Si el rol financiero no es estratégico (Q5 != opción 2) y nivel calculado es 5, limita a nivel 4',
  config = '{"question_id": 5, "trigger_value_not": 2, "min_calculated_level": 5, "max_level": 4, "alert_message": "Para alcanzar el Nivel 5, la dirección financiera debe ser parte activa del gobierno corporativo."}'::jsonb
WHERE config->>'question_id' = '5';

UPDATE anchor_rules 
SET 
  description = 'Si escalabilidad no es sólida (Q9 != opción 2) y nivel calculado es 5, limita a nivel 4',
  config = '{"question_id": 9, "trigger_value_not": 2, "min_calculated_level": 5, "max_level": 4, "alert_message": "Para alcanzar el Nivel 5, tu empresa necesita una estructura financiera sólida y escalable."}'::jsonb
WHERE config->>'question_id' = '9';
