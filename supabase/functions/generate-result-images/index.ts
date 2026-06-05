import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";
import { render } from "jsr:@nick/resvg@0.1.0-rc.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RequestPayload {
  score: number;
  finalLevel: number;
  calculatedLevel: number;
  alerts: string[];
  leadId: string;
  responseId: string;
}

interface LevelInfo {
  name: string;
  description: string;
  recommendations: string[];
}

const levelDescriptions: Record<number, LevelInfo> = {
  1: {
    name: "Control Basico",
    description:
      "Tu empresa esta en la etapa inicial de organizacion financiera. Es momento de establecer las bases: ordenar la contabilidad, implementar controles basicos y comenzar a documentar los procesos financieros.",
    recommendations: [
      "Organizar y actualizar registros contables",
      "Implementar conciliaciones bancarias periodicas",
      "Establecer un flujo de caja basico",
    ],
  },
  2: {
    name: "Planeacion y Presupuesto",
    description:
      "Ya tienes los fundamentos. Ahora es clave crear presupuestos formales, establecer metas financieras claras y comenzar a comparar resultados contra lo planeado de forma sistematica.",
    recommendations: [
      "Crear presupuesto anual detallado",
      "Implementar revision mensual de resultados",
      "Definir KPIs financieros basicos",
    ],
  },
  3: {
    name: "Analisis Estrategico",
    description:
      "Tu gestion financiera ya genera valor. Estas analizando rentabilidad, usando dashboards y tomando decisiones basadas en datos. El siguiente paso es integrar estas herramientas de forma mas sofisticada.",
    recommendations: [
      "Profundizar analisis de rentabilidad por segmento",
      "Automatizar reportes clave",
      "Vincular finanzas con estrategia comercial",
    ],
  },
  4: {
    name: "Direccion Financiera Agil",
    description:
      "Tu area financiera actua como socio estrategico del negocio. Manejas pronosticos dinamicos, escenarios y herramientas avanzadas. Estas listo para dar el salto hacia la excelencia operativa.",
    recommendations: [
      "Implementar gobierno corporativo financiero",
      "Desarrollar modelos predictivos",
      "Optimizar estructura de capital",
    ],
  },
  5: {
    name: "Excelencia y Escalabilidad",
    description:
      "Tu empresa opera con madurez financiera de clase mundial. Tienes gobierno corporativo, analisis predictivo y la capacidad de escalar de forma sostenible. Eres referente en gestion financiera.",
    recommendations: [
      "Mantener mejora continua de procesos",
      "Explorar oportunidades de expansion",
      "Compartir mejores practicas con el ecosistema",
    ],
  },
};

function getScoreColor(score: number): string {
  if (score <= 20) return "#ef4444";
  if (score <= 40) return "#f97316";
  if (score <= 60) return "#A6CC38";
  if (score <= 80) return "#0077B6";
  return "#42C7F5";
}

function generateSpeedometerSVG(score: number): string {
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * 0.75;
  const percentage = score / 100;
  const strokeDashoffset = arcLength - arcLength * percentage;
  const color = getScoreColor(score);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  <text x="200" y="50" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="600" fill="#6B7280">Tu Puntaje Global</text>
  <g transform="translate(200, 220)">
    <g transform="rotate(-135)">
      <circle cx="0" cy="0" r="${radius}" fill="none" stroke="#E5E7EB" stroke-width="12" stroke-linecap="round" stroke-dasharray="${arcLength} ${circumference}"/>
      <circle cx="0" cy="0" r="${radius}" fill="none" stroke="${color}" stroke-width="12" stroke-linecap="round" stroke-dasharray="${arcLength} ${circumference}" stroke-dashoffset="${strokeDashoffset}"/>
    </g>
    <text x="0" y="-10" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="64" font-weight="800" fill="${color}">${score}</text>
    <text x="0" y="20" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="500" fill="#6B7280">de 100 puntos</text>
  </g>
</svg>`;
}

function generatePyramidSVG(activeLevel: number): string {
  const levels = [
    { level: 5, name: "Excelencia", color: "#42C7F5" },
    { level: 4, name: "Direccion Agil", color: "#0077B6" },
    { level: 3, name: "Analisis", color: "#A6CC38" },
    { level: 2, name: "Planeacion", color: "#BDD745" },
    { level: 1, name: "Control", color: "#999999" },
  ];

  const viewW = 560;
  const pyramidBaseWidth = 300;
  const pyramidHeight = 300;
  const totalLevels = levels.length;
  const levelGap = 5;
  const centerX = 210;
  const startY = 55;

  let polygons = "";

  for (let index = 0; index < levels.length; index++) {
    const { level, name, color } = levels[index];
    const isActive = level === activeLevel;
    const isBelow = level < activeLevel;

    const levelHeight =
      (pyramidHeight - (totalLevels - 1) * levelGap) / totalLevels;
    const yTop = startY + index * (levelHeight + levelGap);
    const yBottom = yTop + levelHeight;

    const progressTop = (yTop - startY) / pyramidHeight;
    const progressBottom = (yBottom - startY) / pyramidHeight;

    const widthTop = pyramidBaseWidth * progressTop;
    const widthBottom = pyramidBaseWidth * progressBottom;

    const topLeftX = centerX - widthTop / 2;
    const topRightX = centerX + widthTop / 2;
    const bottomLeftX = centerX - widthBottom / 2;
    const bottomRightX = centerX + widthBottom / 2;

    let points: string;
    if (index === 0) {
      points = `${centerX},${yTop} ${bottomLeftX},${yBottom} ${bottomRightX},${yBottom}`;
    } else {
      points = `${topLeftX},${yTop} ${topRightX},${yTop} ${bottomRightX},${yBottom} ${bottomLeftX},${yBottom}`;
    }

    const fillColor = isActive || isBelow ? color : "#E5E7EB";
    const opacity = isActive || isBelow ? 1 : 0.35;
    const textColor = isActive || isBelow ? "#1F2937" : "#9CA3AF";
    const fontWeight = isActive ? "700" : "400";

    const bandMidY =
      index === 0 ? yTop + levelHeight * 0.62 : yTop + levelHeight / 2;
    const labelX = bottomRightX + 14;

    polygons += `<polygon points="${points}" fill="${fillColor}" opacity="${opacity}"/>`;
    polygons += `<text x="${labelX}" y="${bandMidY}" text-anchor="start" dominant-baseline="middle" fill="${textColor}" font-size="15" font-weight="${fontWeight}" font-family="system-ui, -apple-system, sans-serif">N${level} - ${name}</text>`;

    if (isActive) {
      polygons += `<circle cx="${labelX - 8}" cy="${bandMidY}" r="3" fill="${color}"/>`;
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${viewW}" height="400" viewBox="0 0 ${viewW} 400">
  <text x="${viewW / 2}" y="35" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="600" fill="#6B7280">The FINTEL Way</text>
  ${polygons}
</svg>`;
}

function buildAnalysisText(
  score: number,
  finalLevel: number,
  calculatedLevel: number,
  alerts: string[]
): {
  current_level: number;
  level_name: string;
  level_description: string;
  analysis_text: string;
  next_steps: string[];
  alerts: string[];
} {
  const levelInfo = levelDescriptions[finalLevel] || levelDescriptions[1];
  const hasOverride = finalLevel !== calculatedLevel;

  let analysisText = `Resultado del FINTEL Score: ${score}/100 puntos. `;
  analysisText += `Nivel alcanzado: ${finalLevel} - ${levelInfo.name}. `;
  analysisText += levelInfo.description;

  if (hasOverride) {
    analysisText += ` Nota: El nivel calculado originalmente fue ${calculatedLevel}, pero fue ajustado a ${finalLevel} debido a reglas de anclaje que indican areas fundamentales por fortalecer.`;
  }

  return {
    current_level: finalLevel,
    level_name: levelInfo.name,
    level_description: levelInfo.description,
    analysis_text: analysisText,
    next_steps: levelInfo.recommendations,
    alerts,
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const payload: RequestPayload = await req.json();
    const { score, finalLevel, calculatedLevel, alerts, leadId, responseId } =
      payload;

    if (score === undefined || !finalLevel || !leadId || !responseId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const scoreSvg = generateSpeedometerSVG(score);
    const pyramidSvg = generatePyramidSVG(finalLevel);

    const scorePng = render(scoreSvg);
    const pyramidPng = render(pyramidSvg);

    const timestamp = Date.now();
    const scoreFileName = `score_${responseId}_${timestamp}.png`;
    const pyramidFileName = `pyramid_${responseId}_${timestamp}.png`;

    const { error: scoreUploadError } = await supabase.storage
      .from("result-images")
      .upload(scoreFileName, scorePng, {
        contentType: "image/png",
        cacheControl: "31536000",
        upsert: false,
      });

    if (scoreUploadError) {
      throw new Error(`Score upload failed: ${scoreUploadError.message}`);
    }

    const { error: pyramidUploadError } = await supabase.storage
      .from("result-images")
      .upload(pyramidFileName, pyramidPng, {
        contentType: "image/png",
        cacheControl: "31536000",
        upsert: false,
      });

    if (pyramidUploadError) {
      throw new Error(`Pyramid upload failed: ${pyramidUploadError.message}`);
    }

    const { data: scoreUrlData } = supabase.storage
      .from("result-images")
      .getPublicUrl(scoreFileName);

    const { data: pyramidUrlData } = supabase.storage
      .from("result-images")
      .getPublicUrl(pyramidFileName);

    const analysis = buildAnalysisText(
      score,
      finalLevel,
      calculatedLevel,
      alerts
    );

    return new Response(
      JSON.stringify({
        score_image_url: scoreUrlData.publicUrl,
        pyramid_image_url: pyramidUrlData.publicUrl,
        analysis,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
