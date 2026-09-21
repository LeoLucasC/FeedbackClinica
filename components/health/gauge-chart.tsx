import type { CSSProperties } from "react";

import type { HealthStatus } from "@/lib/health";

const gaugeConfig = {
  green: { rotation: -58, label: "Estable", color: "#7FA82E" },
  amber: { rotation: 0, label: "Por observar", color: "#F2BA13" },
  red: { rotation: 58, label: "Prioritario", color: "#D44F4F" },
} as const;

type GaugeChartProps = {
  status: HealthStatus;
};

export function GaugeChart({ status }: GaugeChartProps) {
  const config = gaugeConfig[status];
  const needleStyle = { "--gauge-target": `${config.rotation}deg` } as CSSProperties;

  return (
    <div className="gauge-result relative mx-auto w-full max-w-[22rem]" aria-label={`Orientación preventiva: ${config.label}`} role="img">
      <svg viewBox="0 0 320 205" className="h-auto w-full overflow-visible" aria-hidden="true">
        <defs>
          <filter id="needle-shadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#123247" floodOpacity="0.22" />
          </filter>
        </defs>
        <g className="gauge-face">
          <path d="M 39 160 A 121 121 0 0 1 281 160" fill="none" stroke="#e8eef2" strokeLinecap="round" strokeWidth="31" />
          <path d="M 39 160 A 121 121 0 0 1 105 52" fill="none" stroke="#7FA82E" strokeLinecap="round" strokeWidth="25" />
          <path d="M 111 49 A 121 121 0 0 1 209 49" fill="none" stroke="#F2BA13" strokeLinecap="round" strokeWidth="25" />
          <path d="M 215 52 A 121 121 0 0 1 281 160" fill="none" stroke="#D44F4F" strokeLinecap="round" strokeWidth="25" />
          <path d="M 48 160 A 112 112 0 0 1 272 160" fill="none" stroke="white" strokeOpacity="0.32" strokeLinecap="round" strokeWidth="2" />
          <text x="61" y="142" textAnchor="middle" className="fill-[#668b21] text-[9px] font-bold uppercase tracking-[0.12em]">Estable</text>
          <text x="160" y="41" textAnchor="middle" className="fill-[#997000] text-[9px] font-bold uppercase tracking-[0.12em]">Observar</text>
          <text x="258" y="142" textAnchor="middle" className="fill-[#b83f3f] text-[9px] font-bold uppercase tracking-[0.12em]">Prioritario</text>
        </g>

        <g
          className="gauge-needle"
          style={needleStyle}
          filter="url(#needle-shadow)"
        >
          <path d="M154 160 L160 69 L166 160 Z" fill="#17384D" />
          <circle cx="160" cy="160" r="16" fill="#17384D" />
          <circle cx="160" cy="160" r="7" fill="white" />
        </g>
        <text x="160" y="198" textAnchor="middle" className="fill-slate-400 text-[11px] font-bold uppercase tracking-[0.18em]">
          Lectura preventiva orientativa
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
