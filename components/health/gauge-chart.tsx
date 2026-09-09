import type { HealthStatus } from "@/lib/health";

const gaugeConfig = {
  green: { rotation: -58, label: "Óptimo", color: "#7FA82E" },
  amber: { rotation: 0, label: "Atención", color: "#F2BA13" },
  red: { rotation: 58, label: "Prioritario", color: "#D44F4F" },
} as const;

type GaugeChartProps = {
  status: HealthStatus;
  score: number;
};

export function GaugeChart({ status, score }: GaugeChartProps) {
  const config = gaugeConfig[status];

  return (
    <div className="relative mx-auto w-full max-w-[22rem]" aria-label={`Estado general: ${config.label}`} role="img">
      <svg viewBox="0 0 320 205" className="h-auto w-full overflow-visible" aria-hidden="true">
        <defs>
          <filter id="needle-shadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#123247" floodOpacity="0.22" />
          </filter>
        </defs>
        <path d="M 39 160 A 121 121 0 0 1 105 52" fill="none" stroke="#7FA82E" strokeLinecap="round" strokeWidth="25" />
        <path d="M 111 49 A 121 121 0 0 1 209 49" fill="none" stroke="#F2BA13" strokeLinecap="round" strokeWidth="25" />
        <path d="M 215 52 A 121 121 0 0 1 281 160" fill="none" stroke="#D44F4F" strokeLinecap="round" strokeWidth="25" />
        <path d="M 48 160 A 112 112 0 0 1 272 160" fill="none" stroke="white" strokeOpacity="0.28" strokeLinecap="round" strokeWidth="2" />

        <g
          className="gauge-needle"
          style={{ transform: `rotate(${config.rotation}deg)`, transformOrigin: "160px 160px" }}
          filter="url(#needle-shadow)"
        >
          <path d="M154 160 L160 69 L166 160 Z" fill="#17384D" />
          <circle cx="160" cy="160" r="16" fill="#17384D" />
          <circle cx="160" cy="160" r="7" fill="white" />
        </g>
        <text x="160" y="198" textAnchor="middle" className="fill-slate-400 text-[11px] font-bold uppercase tracking-[0.18em]">
          Índice preventivo {score}/100
        </text>
      </svg>
      <div className="absolute inset-x-0 bottom-8 text-center">
        <span
          className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1.5 text-sm font-bold shadow-sm"
          style={{ color: config.color, borderColor: `${config.color}38` }}
        >
          <span className="size-2 rounded-full" style={{ backgroundColor: config.color }} />
          {config.label}
        </span>
      </div>
    </div>
  );
}
