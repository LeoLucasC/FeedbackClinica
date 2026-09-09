"use client";

import { useEffect, useRef, useState, type ComponentType, type SVGProps } from "react";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Gauge,
  Heart,
  Info,
  Lock,
  RefreshCw,
  Ruler,
  ShieldCheck,
  Thermometer,
  Weight,
  Wind,
  Zap,
} from "lucide-react";

import { GaugeChart } from "@/components/health/gauge-chart";
import { ReviewModule } from "@/components/health/review-module";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  evaluateVitals,
  inputLimits,
  validateVitals,
  type HealthResult,
  type HealthStatus,
  type VitalsInput,
  type VitalResult,
} from "@/lib/health";

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

const fieldConfigs: Array<{
  name: keyof VitalsInput;
  label: string;
  shortLabel: string;
  unit: string;
  placeholder: string;
  step: string;
  icon: Icon;
}> = [
  { name: "height", label: "Talla", shortLabel: "Talla", unit: "cm", placeholder: "170", step: "0.1", icon: Ruler },
  { name: "weight", label: "Peso", shortLabel: "Peso", unit: "kg", placeholder: "68", step: "0.1", icon: Weight },
  { name: "systolic", label: "Presión sistólica", shortLabel: "Sistólica", unit: "mmHg", placeholder: "120", step: "1", icon: Gauge },
  { name: "diastolic", label: "Presión diastólica", shortLabel: "Diastólica", unit: "mmHg", placeholder: "80", step: "1", icon: Gauge },
  { name: "heartRate", label: "Frecuencia cardiaca", shortLabel: "F. cardiaca", unit: "lpm", placeholder: "72", step: "1", icon: Heart },
  { name: "oxygen", label: "Saturación de oxígeno", shortLabel: "SatO₂", unit: "%", placeholder: "98", step: "0.1", icon: Activity },
  { name: "temperature", label: "Temperatura", shortLabel: "Temperatura", unit: "°C", placeholder: "36.5", step: "0.1", icon: Thermometer },
  { name: "respiratoryRate", label: "Frecuencia respiratoria", shortLabel: "F. respiratoria", unit: "rpm", placeholder: "16", step: "1", icon: Wind },
];

const vitalIcons: Record<VitalResult["id"], Icon> = {
  bmi: Weight,
  bloodPressure: Gauge,
  heartRate: Heart,
  oxygen: Activity,
  temperature: Thermometer,
  respiratoryRate: Wind,
};

const statusStyles: Record<HealthStatus, { label: string; text: string; badge: string; surface: string }> = {
  green: {
    label: "Óptimo",
    text: "text-[#668b21]",
    badge: "border-green-200 bg-green-50 text-[#668b21]",
    surface: "border-green-100 bg-green-50/55",
  },
  amber: {
    label: "Atención",
    text: "text-[#a97800]",
    badge: "border-yellow-200 bg-yellow-50 text-[#926a00]",
    surface: "border-yellow-100 bg-yellow-50/55",
  },
  red: {
    label: "Prioritario",
    text: "text-[#b83f3f]",
    badge: "border-red-200 bg-red-50 text-[#b83f3f]",
    surface: "border-red-100 bg-red-50/55",
  },
};

function valuesFromRecord(record: Record<string, unknown>): VitalsInput {
  return {
    height: Number(record.height),
    weight: Number(record.weight),
    systolic: Number(record.systolic),
    diastolic: Number(record.diastolic),
    heartRate: Number(record.heartRate),
    oxygen: Number(record.oxygen),
    temperature: Number(record.temperature),
    respiratoryRate: Number(record.respiratoryRate),
  };
}

function VitalCard({ vital }: { vital: VitalResult }) {
  const Icon = vitalIcons[vital.id];
  const style = statusStyles[vital.status];

  return (
    <article className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_30px_rgba(31,65,88,0.05)] transition-transform hover:-translate-y-0.5 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${style.surface} ${style.text}`}>
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${style.badge}`}>{style.label}</span>
      </div>
      <p className="mt-4 font-poppins text-sm font-semibold text-slate-500">{vital.label}</p>
      <p className="mt-1 flex items-baseline gap-1.5 font-poppins text-2xl font-bold tracking-tight text-slate-950">
        {vital.value}
        <span className="text-sm font-semibold text-slate-400">{vital.unit}</span>
      </p>
      <p className="mt-2 text-xs leading-5 text-slate-400">{vital.detail}</p>
    </article>
  );
}

function AnalyzingScreen() {
  return (
    <section
      className="mx-auto flex max-w-6xl flex-col items-center justify-center bg-transparent px-5 py-16 sm:px-8 sm:py-20"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="relative mx-auto flex w-full max-w-sm flex-col items-center">
        {/* Halo pulsante */}
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 flex justify-center">
          <div className="analyzing-halo size-72 rounded-full bg-[radial-gradient(circle,rgba(91,143,185,0.18)_0%,rgba(127,168,46,0.08)_45%,transparent_70%)]" />
        </div>

        <div className="relative size-72">
          <svg viewBox="0 0 200 200" className="h-full w-full overflow-visible" aria-hidden="true">
            {/* Anillo exterior giratorio */}
            <g className="analyzing-ring">
              <path d="M 100 46 a 58 58 0 0 1 50 14" fill="none" stroke="#5B8FB9" strokeWidth="4" strokeLinecap="round" />
            </g>

            {/* Zonas de color arco del velocímetro (centro 100,135 · radio 62) */}
            <path d="M 38 135 A 62 62 0 0 1 69 81" fill="none" stroke="#7FA82E" strokeWidth="16" strokeLinecap="round" />
            <path d="M 69 81 A 62 62 0 0 1 131 81" fill="none" stroke="#F2BA13" strokeWidth="16" strokeLinecap="round" />
            <path d="M 131 81 A 62 62 0 0 1 162 135" fill="none" stroke="#D44F4F" strokeWidth="16" strokeLinecap="round" />

            {/* Marca decorativa interior */}
            <path d="M 50 135 A 50 50 0 0 1 150 135" fill="none" stroke="white" strokeOpacity="0.35" strokeWidth="2" />

            {/* Aguja del acelerómetro */}
            <g className="analyzing-needle drop-shadow-[0_3px_4px_rgba(23,56,77,0.35)]">
              <path d="M 96 134 L 100 76 L 104 134 Z" fill="#17384D" stroke="#0f2737" strokeWidth="0.5" />
              <circle cx="100" cy="135" r="8" fill="#17384D" />
              <circle cx="100" cy="135" r="3.5" fill="white" />
            </g>

            {/* Partículas de luz */}
            <circle cx="58" cy="150" r="3" className="analyzing-particle" fill="#5B8FB9" />
            <circle cx="140" cy="60" r="3" className="analyzing-particle" fill="#7FA82E" style={{ animationDelay: "0.4s" }} />
            <circle cx="156" cy="150" r="3" className="analyzing-particle" fill="#F2BA13" style={{ animationDelay: "0.8s" }} />
          </svg>
        </div>
      </div>

      <div className="mx-auto mt-2 w-full max-w-sm text-center">
        <div className="flex items-center justify-center gap-1 font-semibold">
          <AnimatedDots label="Analizando" className="font-poppins text-bolivar-blue" />
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Calculando tu IMC y revisando tus signos vitales…
        </p>
        <div className="mx-auto mt-5 h-2 w-56 overflow-hidden rounded-full bg-slate-100">
          <div className="analyzing-progress h-full rounded-full bg-gradient-to-r from-bolivar-blue via-[#3fa9c9] to-bolivar-green" />
        </div>
        <p className="mt-3 text-xs font-medium capitalize text-slate-400">Preparando tu semáforo preventivo</p>
      </div>
    </section>
  );
}

function AnimatedDots({ label, className }: { label: string; className?: string }) {
  return (
    <span className={`inline-flex items-baseline text-base ${className ?? ""}`}>
      {label}
      <span className="analyzing-dots">
        <span>.</span>
        <span>.</span>
        <span>.</span>
      </span>
    </span>
  );
}

export function HealthChecker() {
  const [result, setResult] = useState<HealthResult | null>(null);
  const [error, setError] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const resultRef = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const analyzeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (analyzeTimer.current) clearTimeout(analyzeTimer.current);
  }, []);

  useEffect(() => {
    if (result) resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [result]);

  useEffect(() => {
    type WebMcpContext = {
      registerTool: (
        tool: {
          name: string;
          title: string;
          description: string;
          inputSchema: Record<string, unknown>;
          annotations: { readOnlyHint: boolean; untrustedContentHint: boolean };
          execute: (input: unknown) => unknown;
        },
        options?: { signal?: AbortSignal },
      ) => void | Promise<void>;
    };

    const modelContext = (document as Document & { modelContext?: WebMcpContext }).modelContext;
    if (!modelContext?.registerTool) return;

    const lifecycle = new AbortController();
    try {
      void Promise.resolve(
        modelContext.registerTool(
          {
            name: "evaluate_preventive_health",
            title: "Evaluar signos vitales",
            description: "Calcula el IMC y muestra el semáforo preventivo usando las ocho mediciones proporcionadas.",
            inputSchema: {
              type: "object",
              properties: Object.fromEntries(
                fieldConfigs.map((field) => [
                  field.name,
                  { type: "number", minimum: inputLimits[field.name].min, maximum: inputLimits[field.name].max },
                ]),
              ),
              required: fieldConfigs.map((field) => field.name),
              additionalProperties: false,
            },
            annotations: { readOnlyHint: false, untrustedContentHint: false },
            execute(input) {
              if (!input || typeof input !== "object") throw new Error("Las mediciones son obligatorias.");
              const vitals = valuesFromRecord(input as Record<string, unknown>);
              if (!validateVitals(vitals)) throw new Error("Una o más mediciones están fuera de los límites admitidos.");
              setError("");
              setAnalyzing(true);
              setResult(null);
              const nextResult = evaluateVitals(vitals);
              analyzeTimer.current = setTimeout(() => {
                setAnalyzing(false);
                setResult(nextResult);
              }, 2100);
              return { status: nextResult.status, score: nextResult.score, bmi: nextResult.bmi };
            },
          },
          { signal: lifecycle.signal },
        ),
      ).catch(() => undefined);
    } catch {
      return;
    }

    return () => lifecycle.abort();
  }, []);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    const vitals = valuesFromRecord(data);

    if (!validateVitals(vitals)) {
      setError("Revisa los valores. Todas las mediciones deben estar completas y dentro de un rango válido.");
      return;
    }

    setError("");
    const nextResult = evaluateVitals(vitals);
    setAnalyzing(true);
    setResult(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
    analyzeTimer.current = setTimeout(() => {
      setAnalyzing(false);
      setResult(nextResult);
    }, 2100);
  }

  function resetCheck() {
    if (analyzeTimer.current) clearTimeout(analyzeTimer.current);
    setAnalyzing(false);
    setResult(null);
    setError("");
    formRef.current?.reset();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#f7fbfd_0%,#ffffff_52%,#f5f8ee_100%)] text-slate-950">
      <header className="border-b border-sky-100/80 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <a href="#inicio" className="flex items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bolivar-blue">
            <img
              src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/logo.png`}
              alt="Clínica Bolívar"
              className="h-10 w-auto sm:h-12"
              width={326}
              height={62}
            />
          </a>
          <span className="hidden items-center gap-2 text-sm font-medium text-slate-500 sm:flex">
            <ShieldCheck className="size-4 text-bolivar-green" aria-hidden="true" />
            Tus datos no salen de este dispositivo
          </span>
        </div>
      </header>

      {analyzing ? (
        <AnalyzingScreen />
      ) : !result ? (
        <div id="inicio" className="mx-auto grid max-w-6xl gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[0.78fr_1.22fr] lg:gap-12 lg:py-14">
          <section className="flex flex-col justify-center">
            <span className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-sky-100 bg-white px-3 py-1.5 font-poppins text-sm font-semibold text-bolivar-blue shadow-sm">
              <Activity className="size-4" aria-hidden="true" />
              TU SEMAFORO DE CHECKEO RAPIDO EN SEGUNDOS
            </span>
            <h1 className="max-w-xl font-poppins text-4xl font-bold leading-[1.08] tracking-[-0.04em] sm:text-5xl lg:text-6xl">
              <span className="text-bolivar-blue [text-shadow:0_1px_2px_rgba(23,56,77,0.18)]">
                Semáforo de Salud{" "}
              </span>
              <span className="text-bolivar-yellow [text-shadow:0_1px_2px_rgba(154,106,0,0.25)]">
                Preventivo
              </span>
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-8 text-slate-600">
              Ingresa tus mediciones y recibe una lectura visual para saber si todo marcha bien o si conviene solicitar atención.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-3 text-center">
              {[
                { label: "Privado", icon: Lock, tint: "bg-bolivar-blue", soft: "bg-bolivar-blue/10", ring: "ring-bolivar-blue/20", text: "text-bolivar-blue" },
                { label: "Rápido", icon: Zap, tint: "bg-bolivar-yellow", soft: "bg-bolivar-yellow/15", ring: "ring-bolivar-yellow/30", text: "text-[#a97800]" },
                { label: "Preventivo", icon: ShieldCheck, tint: "bg-bolivar-green", soft: "bg-bolivar-green/12", ring: "ring-bolivar-green/25", text: "text-bolivar-green" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className={`rounded-2xl border border-white bg-white/80 px-2 py-4 shadow-[0_10px_30px_rgba(91,143,185,0.08)] ring-1 ${item.ring} transition-transform hover:-translate-y-0.5`}
                  >
                    <span className={`mx-auto grid size-11 place-items-center rounded-xl ${item.soft} text-white transition-transform`}>
                      <Icon className={`size-5 ${item.text}`} aria-hidden="true" />
                    </span>
                    <p className="mt-2.5 font-poppins text-sm font-bold text-slate-700">{item.label}</p>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 flex items-start gap-2 text-sm leading-6 text-slate-500">
              <Info className="mt-0.5 size-4 shrink-0 text-bolivar-blue" aria-hidden="true" />
              Usa mediciones recientes y tomadas en reposo para una orientación más útil.
            </div>
          </section>

          <Card className="gap-0 overflow-hidden rounded-[1.75rem] border-sky-100 bg-white py-0 shadow-[0_24px_70px_rgba(31,65,88,0.12)]">
            <CardHeader className="gap-2 border-b border-sky-50 bg-sky-50/60 px-5 py-6 sm:px-7">
              <div className="flex items-center justify-between">
                <span className="font-poppins text-sm font-bold uppercase tracking-[0.12em] text-bolivar-blue">Paso 1 de 2</span>
                <span className="font-poppins text-sm font-medium text-slate-500">Signos vitales</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-sky-100">
                <div className="h-full w-1/2 rounded-full bg-bolivar-blue" />
              </div>
            </CardHeader>
            <CardContent className="px-5 py-6 sm:px-7">
              <form ref={formRef} className="grid gap-x-4 gap-y-5 sm:grid-cols-2" onSubmit={handleSubmit}>
                {fieldConfigs.map((field) => {
                  const Icon = field.icon;
                  const limits = inputLimits[field.name];
                  return (
                    <label key={field.name} className="grid gap-2 font-poppins text-sm font-semibold text-slate-700">
                      <span className="flex items-center gap-2">
                        <Icon className="size-4 text-bolivar-blue" aria-hidden="true" />
                        <span className="sm:hidden">{field.shortLabel}</span>
                        <span className="hidden sm:inline">{field.label}</span>
                      </span>
                      <span className="relative">
                        <Input
                          name={field.name}
                          type="number"
                          inputMode="decimal"
                          step={field.step}
                          min={limits.min}
                          max={limits.max}
                          placeholder={field.placeholder}
                          required
                          className="h-12 rounded-xl border-slate-200 bg-white pr-16 text-base font-normal shadow-none focus-visible:border-bolivar-blue focus-visible:ring-bolivar-blue/15"
                        />
                        <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm font-medium text-slate-400">{field.unit}</span>
                      </span>
                    </label>
                  );
                })}
                {error && (
                  <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700 sm:col-span-2" role="alert">
                    {error}
                  </p>
                )}
                <Button type="submit" className="mt-2 h-13 rounded-xl bg-bolivar-green text-base font-bold text-white shadow-[0_10px_24px_rgba(127,168,46,0.22)] hover:bg-[#719629] sm:col-span-2">
                  Analizar mi salud
                  <ArrowRight className="size-5" aria-hidden="true" />
                </Button>
              </form>
              <p className="mt-4 text-center text-sm leading-6 text-slate-500">
                Esta herramienta ofrece orientación preventiva y no reemplaza una consulta médica.
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <section ref={resultRef} className="mx-auto max-w-6xl scroll-mt-5 px-5 py-7 sm:px-8 sm:py-10" aria-live="polite">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <Button type="button" variant="ghost" onClick={resetCheck} className="-ml-3 h-10 rounded-xl text-slate-600 hover:bg-white hover:text-bolivar-blue">
              <ArrowLeft className="size-4" aria-hidden="true" />
              Volver a las mediciones
            </Button>
            <span className="font-poppins text-sm font-bold uppercase tracking-[0.12em] text-bolivar-blue">Paso 2 de 2 · Resultado</span>
          </div>

          <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
            <Card className="gap-0 overflow-hidden rounded-[1.75rem] border-sky-100 bg-white py-0 shadow-[0_24px_70px_rgba(31,65,88,0.1)]">
              <CardContent className="flex h-full flex-col px-5 py-7 sm:px-8 sm:py-9">
                <div className="flex items-center justify-between">
                  <span className="font-poppins text-sm font-bold uppercase tracking-[0.13em] text-slate-400">Estado general</span>
                  <ShieldCheck className="size-5 text-bolivar-blue" aria-hidden="true" />
                </div>
                <GaugeChart status={result.status} score={result.score} />
                <div className="mt-auto text-center">
                  <h1 className="font-poppins text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{result.title}</h1>
                  <p className="mx-auto mt-3 max-w-md text-base leading-7 text-slate-600">{result.message}</p>
                  <div className={`mx-auto mt-5 max-w-lg rounded-2xl border p-4 text-left text-sm leading-6 ${statusStyles[result.status].surface}`}>
                    <span className={`font-bold ${statusStyles[result.status].text}`}>Siguiente paso: </span>
                    <span className="text-slate-700">{result.recommendation}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div>
              <div className="mb-4 flex items-end justify-between">
                <div>
                  <p className="font-poppins text-sm font-bold uppercase tracking-[0.12em] text-bolivar-blue">Tus mediciones</p>
                  <h2 className="mt-1 font-poppins text-2xl font-bold tracking-tight text-slate-950">Desglose preventivo</h2>
                </div>
                <span className="hidden text-sm text-slate-400 sm:block">6 indicadores</span>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {result.vitals.map((vital) => <VitalCard key={vital.id} vital={vital} />)}
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
            <ReviewModule />
            <section className="flex flex-col justify-between rounded-[1.5rem] bg-[#17384D] p-6 text-white shadow-[0_18px_50px_rgba(23,56,77,0.18)] sm:p-7">
              <div>
                <p className="font-poppins text-sm font-bold uppercase tracking-[0.12em] text-sky-200">Tu bienestar continúa</p>
                <h2 className="mt-2 font-poppins text-2xl font-bold tracking-tight">Vuelve a medir cuando lo necesites.</h2>
                <p className="mt-3 text-sm leading-6 text-sky-50/75">Puedes repetir el chequeo con nuevas mediciones. No almacenamos el resultado ni tus datos.</p>
              </div>
              <Button type="button" onClick={resetCheck} className="mt-6 h-11 w-full rounded-xl bg-white font-bold text-[#17384D] hover:bg-sky-50 sm:w-auto">
                <RefreshCw className="size-4" aria-hidden="true" />
                Hacer otro chequeo
              </Button>
            </section>
          </div>

          <p className="mx-auto mt-8 max-w-3xl text-center text-xs leading-5 text-slate-400">
            Los rangos utilizados son orientativos para adultos y no constituyen un diagnóstico. Ante síntomas o dudas, consulta a un profesional de salud.
          </p>
        </section>
      )}
    </main>
  );
}
