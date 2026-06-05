export interface Question {
  id: number;
  category: string;
  question: string;
  options: string[];
}

export const questions: Question[] = [
  {
    id: 1,
    category: "Contabilidad",
    question: "¿Cómo está hoy tu contabilidad y control administrativo?",
    options: [
      "Básico o desordenado; cierres y conciliaciones no siempre están al día.",
      "Ordenado, con controles claros y análisis básicos de márgenes.",
      "Integrado, con procesos financieros dinámicos y reportes para decisión."
    ]
  },
  {
    id: 2,
    category: "Presupuesto",
    question: "¿Cómo planificas financieramente el año?",
    options: [
      "No hay presupuesto formal; se maneja el día a día.",
      "Hay presupuesto, proyección de flujo y seguimiento básico.",
      "Se usan forecasts dinámicos, escenarios y planes de crecimiento."
    ]
  },
  {
    id: 3,
    category: "Rentabilidad",
    question: "¿Qué tan claro tienes qué te deja dinero y qué no?",
    options: [
      "No está claro o es solo una percepción general.",
      "Se mide por producto/cliente con indicadores y dashboards.",
      "Es una herramienta clave para estrategia y ventaja competitiva."
    ]
  },
  {
    id: 4,
    category: "Tecnología",
    question: "¿Qué rol juega la tecnología en tus finanzas?",
    options: [
      "Procesos manuales o Excel básico.",
      "Dashboards y reportes parcialmente automatizados.",
      "BI / ERP integrados para decisiones estratégicas."
    ]
  },
  {
    id: 5,
    category: "Rol Financiero",
    question: "¿Cómo participa Finanzas en las decisiones del negocio?",
    options: [
      "Cumple funciones operativas y fiscales.",
      "Apoya con análisis y control del desempeño.",
      "Actúa como copiloto estratégico o gobierno corporativo."
    ]
  },
  {
    id: 6,
    category: "Flujo de Efectivo",
    question: "¿Qué tan controlado y predecible es tu flujo de caja?",
    options: [
      "Reactivo; se revisa cuando hay problemas.",
      "Proyectado a corto plazo y con control básico.",
      "Gestionado estratégicamente para inversión y crecimiento."
    ]
  },
  {
    id: 7,
    category: "KPIs",
    question: "¿Cómo mides el desempeño financiero?",
    options: [
      "No hay KPIs claros o se revisan de forma informal.",
      "KPIs básicos con seguimiento periódico.",
      "KPIs estratégicos integrados a decisiones y gobierno."
    ]
  },
  {
    id: 8,
    category: "Decisiones",
    question: "¿Cómo se toman las decisiones importantes?",
    options: [
      "Principalmente por intuición o urgencia.",
      "Apoyadas en reportes financieros.",
      "Basadas en análisis de escenarios financieros."
    ]
  },
  {
    id: 9,
    category: "Escalabilidad",
    question: "¿Qué tan preparada está tu empresa para crecer sin perder control?",
    options: [
      "No hay estructura clara para escalar.",
      "Hay procesos definidos, pero no totalmente integrados.",
      "Existe estructura financiera sólida y escalable."
    ]
  },
  {
    id: 10,
    category: "Visión",
    question: "¿Cómo ves el rol de las finanzas en el futuro de tu empresa?",
    options: [
      "Como un área de soporte y cumplimiento.",
      "Como una herramienta de control y optimización.",
      "Como motor estratégico de crecimiento y valor."
    ]
  }
];

export const levelDescriptions = {
  1: {
    name: "Control Básico",
    description: "Tu empresa está en la etapa inicial de organización financiera. Es momento de establecer las bases: ordenar la contabilidad, implementar controles básicos y comenzar a documentar los procesos financieros.",
    recommendations: [
      "Organizar y actualizar registros contables",
      "Implementar conciliaciones bancarias periódicas",
      "Establecer un flujo de caja básico"
    ]
  },
  2: {
    name: "Planeación y Presupuesto",
    description: "Ya tienes los fundamentos. Ahora es clave crear presupuestos formales, establecer metas financieras claras y comenzar a comparar resultados contra lo planeado de forma sistemática.",
    recommendations: [
      "Crear presupuesto anual detallado",
      "Implementar revisión mensual de resultados",
      "Definir KPIs financieros básicos"
    ]
  },
  3: {
    name: "Análisis Estratégico",
    description: "Tu gestión financiera ya genera valor. Estás analizando rentabilidad, usando dashboards y tomando decisiones basadas en datos. El siguiente paso es integrar estas herramientas de forma más sofisticada.",
    recommendations: [
      "Profundizar análisis de rentabilidad por segmento",
      "Automatizar reportes clave",
      "Vincular finanzas con estrategia comercial"
    ]
  },
  4: {
    name: "Dirección Financiera Ágil",
    description: "Tu área financiera actúa como socio estratégico del negocio. Manejas pronósticos dinámicos, escenarios y herramientas avanzadas. Estás listo para dar el salto hacia la excelencia operativa.",
    recommendations: [
      "Implementar gobierno corporativo financiero",
      "Desarrollar modelos predictivos",
      "Optimizar estructura de capital"
    ]
  },
  5: {
    name: "Excelencia y Escalabilidad",
    description: "Tu empresa opera con madurez financiera de clase mundial. Tienes gobierno corporativo, análisis predictivo y la capacidad de escalar de forma sostenible. Eres referente en gestión financiera.",
    recommendations: [
      "Mantener mejora continua de procesos",
      "Explorar oportunidades de expansión",
      "Compartir mejores prácticas con el ecosistema"
    ]
  }
};
