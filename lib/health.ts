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

export type HealthResult = {
  status: HealthStatus;
  score: number;
  bmi: number;
  title: string;
  message: string;
  recommendation: string;
  vitals: VitalResult[];
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
    message: "Detectamos al menos una medición que requiere valoración profesional.",
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
  if (systolic < 90 || systolic >= 130 || diastolic < 60 || diastolic >= 85) return "amber";
  return "green";
}

function statusForHeartRate(value: number): HealthStatus {
  if (value < 40 || value > 130) return "red";
  if (value < 60 || value > 100) return "amber";
  return "green";
}

function statusForOxygen(value: number): HealthStatus {
  if (value < 92) return "red";
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
  const score = Math.max(18, 100 - redCount * 24 - amberCount * 9);

  return {
    status,
    score,
    bmi,
    ...statusCopy[status],
    vitals: vitalsWithDetails,
  };
}
