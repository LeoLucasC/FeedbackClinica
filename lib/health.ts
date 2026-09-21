export type HealthStatus = "green" | "amber" | "red";

export type VitalsInput = {
  height: number;
  weight: number;
  systolic: number;
  diastolic: number;
  heartRate: number;
  oxygen: number;
  temperature: number;
  respiratoryRate: number;
};

export type VitalResult = {
  id: "bmi" | "bloodPressure" | "heartRate" | "oxygen" | "temperature" | "respiratoryRate";
  label: string;
  value: string;
  unit: string;
  status: HealthStatus;
  detail: string;
};

export type CareAreaId = "generalMedicine" | "cardiology" | "pulmonology" | "nutrition";

export type CareArea = {
  id: CareAreaId;
  name: string;
  reason: string;
};

export type CareGuidance = {
  level: "routine" | "scheduled" | "priority";
  service: string;
  timeframe: string;
  summary: string;
  areas: CareArea[];
  actions: string[];
};

export type HealthResult = {
  status: HealthStatus;
  bmi: number;
  title: string;
  message: string;
  recommendation: string;
  vitals: VitalResult[];
  care: CareGuidance;
};

export const inputLimits: Record<keyof VitalsInput, { min: number; max: number }> = {
  height: { min: 80, max: 230 },
  weight: { min: 20, max: 300 },
  systolic: { min: 60, max: 260 },
  diastolic: { min: 30, max: 160 },
  heartRate: { min: 30, max: 220 },
  oxygen: { min: 50, max: 100 },
  temperature: { min: 30, max: 45 },
  respiratoryRate: { min: 4, max: 60 },
};

const statusCopy: Record<HealthStatus, Pick<HealthResult, "title" | "message" | "recommendation">> = {
  green: {
    title: "Tus indicadores se ven estables",
    message: "Las mediciones ingresadas están dentro de rangos preventivos esperados.",
    recommendation: "Mantén tus hábitos saludables y realiza controles periódicos.",
  },
  amber: {
    title: "Hay indicadores para observar",
    message: "Una o más mediciones están fuera del rango preventivo habitual.",
    recommendation: "Repite las mediciones en reposo y agenda una evaluación si se mantienen.",
  },
  red: {
    title: "Recomendamos atención oportuna",
    message: "Al menos una medición ingresada requiere valoración profesional.",
    recommendation: "Contacta a un profesional de salud. Si tienes síntomas intensos, busca atención de urgencia.",
  },
};

function statusForBmi(value: number): HealthStatus {
  if (value < 16 || value >= 35) return "red";
  if (value < 18.5 || value >= 25) return "amber";
  return "green";
}

function statusForBloodPressure(systolic: number, diastolic: number): HealthStatus {
  if (systolic < 80 || systolic >= 180 || diastolic < 50 || diastolic >= 120) return "red";
  if (systolic < 90 || systolic >= 130 || diastolic < 60 || diastolic >= 80) return "amber";
  return "green";
}

function statusForHeartRate(value: number): HealthStatus {
  if (value < 40 || value > 130) return "red";
  if (value < 60 || value > 100) return "amber";
  return "green";
}

function statusForOxygen(value: number): HealthStatus {
  if (value <= 92) return "red";
  if (value < 95) return "amber";
  return "green";
}

function statusForTemperature(value: number): HealthStatus {
  if (value < 35 || value >= 39) return "red";
  if (value < 36 || value >= 37.6) return "amber";
  return "green";
}

function statusForRespiratoryRate(value: number): HealthStatus {
  if (value < 8 || value > 30) return "red";
  if (value < 12 || value > 20) return "amber";
  return "green";
}

const detailByStatus: Record<HealthStatus, string> = {
  green: "Dentro del rango preventivo",
  amber: "Conviene repetir y observar",
  red: "Requiere valoración profesional",
};

export function validateVitals(vitals: VitalsInput) {
  return (Object.keys(inputLimits) as (keyof VitalsInput)[]).every((key) => {
    const value = vitals[key];
    const limits = inputLimits[key];
    return Number.isFinite(value) && value >= limits.min && value <= limits.max;
  });
}

const careAreaCopy: Record<CareAreaId, { name: string; vitalIds: VitalResult["id"][] }> = {
  generalMedicine: { name: "Medicina General", vitalIds: ["temperature"] },
  cardiology: { name: "Cardiología", vitalIds: ["bloodPressure", "heartRate"] },
  pulmonology: { name: "Neumología", vitalIds: ["oxygen", "respiratoryRate"] },
  nutrition: { name: "Nutrición Clínica", vitalIds: ["bmi"] },
};

function buildCareGuidance(vitals: VitalResult[], status: HealthStatus): CareGuidance {
  const altered = vitals.filter((vital) => vital.status !== "green");
  const hasAcuteRedFlag = vitals.some(
    (vital) => vital.status === "red" && vital.id !== "bmi",
  );
  const areas = (Object.entries(careAreaCopy) as Array<[CareAreaId, (typeof careAreaCopy)[CareAreaId]]>)
    .map(([id, area]) => {
      const relatedVitals = altered.filter((vital) => area.vitalIds.includes(vital.id));
      if (relatedVitals.length === 0) return null;

      return {
        id,
        name: area.name,
        reason: relatedVitals.map((vital) => vital.label).join(" y "),
      } satisfies CareArea;
    })
    .filter((area): area is CareArea => area !== null);

  if (status === "green") {
    return {
      level: "routine",
      service: "Medicina General",
      timeframe: "Control preventivo de rutina",
      summary: "Es el servicio indicado para integrar tus antecedentes, síntomas y mediciones en un control preventivo.",
      areas: [
        {
          id: "generalMedicine",
          name: "Medicina General",
          reason: "Revisión integral y seguimiento preventivo",
        },
      ],
      actions: [
        "Mantén tus controles periódicos según tu edad y antecedentes.",
        "Repite las mediciones si aparecen síntomas o notas cambios persistentes.",
      ],
    };
  }

  if (status === "red" && hasAcuteRedFlag) {
    return {
      level: "priority",
      service: "Atención prioritaria",
      timeframe: "Solicita valoración hoy",
      summary: "Primero se debe confirmar la medición y descartar una urgencia antes de una consulta por especialidad.",
      areas,
      actions: [
        "Repite la medición en reposo y verifica que el equipo esté bien colocado.",
        "Si el valor se confirma, busca valoración presencial el mismo día.",
        "Si presentas dolor de pecho, falta de aire, confusión, desmayo o debilidad súbita, acude a Emergencias.",
      ],
    };
  }

  if (status === "red") {
    return {
      level: "priority",
      service: "Medicina General",
      timeframe: "Agenda una consulta prioritaria",
      summary: "El IMC es una medida de detección, no un diagnóstico. Medicina General puede interpretarlo junto con tus antecedentes y coordinar apoyo nutricional.",
      areas,
      actions: [
        "Agenda una valoración para revisar el resultado en contexto.",
        "Evita iniciar dietas o tratamientos intensivos sin una evaluación profesional.",
      ],
    };
  }

  const directArea = areas.length === 1 ? areas[0] : null;
  return {
    level: "scheduled",
    service: directArea?.name ?? "Medicina General",
    timeframe: "Agenda una consulta",
    summary: directArea
      ? `La orientación inicial corresponde a ${directArea.name}; el profesional confirmará si necesitas estudios o derivación.`
      : "Medicina General puede integrar los hallazgos y coordinar una derivación si fuera necesaria.",
    areas,
    actions: [
      "Repite las mediciones en reposo y registra fecha y hora.",
      "Lleva el registro a la consulta, especialmente si el resultado se mantiene.",
    ],
  };
}

export function evaluateVitals(vitals: VitalsInput): HealthResult {
  const heightMeters = vitals.height / 100;
  const bmi = Number((vitals.weight / heightMeters ** 2).toFixed(1));

  const vitalData: Omit<VitalResult, "detail">[] = [
    { id: "bmi", label: "Índice de masa corporal", value: bmi.toFixed(1), unit: "IMC", status: statusForBmi(bmi) },
    {
      id: "bloodPressure",
      label: "Presión arterial",
      value: `${vitals.systolic}/${vitals.diastolic}`,
      unit: "mmHg",
      status: statusForBloodPressure(vitals.systolic, vitals.diastolic),
    },
    { id: "heartRate", label: "Frecuencia cardiaca", value: String(vitals.heartRate), unit: "lpm", status: statusForHeartRate(vitals.heartRate) },
    { id: "oxygen", label: "Saturación de oxígeno", value: String(vitals.oxygen), unit: "%", status: statusForOxygen(vitals.oxygen) },
    { id: "temperature", label: "Temperatura", value: vitals.temperature.toFixed(1), unit: "°C", status: statusForTemperature(vitals.temperature) },
    {
      id: "respiratoryRate",
      label: "Frecuencia respiratoria",
      value: String(vitals.respiratoryRate),
      unit: "rpm",
      status: statusForRespiratoryRate(vitals.respiratoryRate),
    },
  ];

  const vitalsWithDetails = vitalData.map((vital) => ({ ...vital, detail: detailByStatus[vital.status] }));
  const redCount = vitalsWithDetails.filter((vital) => vital.status === "red").length;
  const amberCount = vitalsWithDetails.filter((vital) => vital.status === "amber").length;
  const status: HealthStatus = redCount > 0 ? "red" : amberCount > 0 ? "amber" : "green";

  return {
    status,
    bmi,
    ...statusCopy[status],
    vitals: vitalsWithDetails,
    care: buildCareGuidance(vitalsWithDetails, status),
  };
}
