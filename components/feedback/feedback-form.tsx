"use client";

import { useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Loader2,
  Lock,
  MapPin,
  Megaphone,
  Send,
  Stethoscope,
  UserRound,
} from "lucide-react";

import channelConfig from "@/api/channels.json";
import entryCampaignConfig from "@/api/entry-campaigns.json";
import specialtyConfig from "@/api/specialties.json";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const channels = channelConfig.channels;
const specialties = specialtyConfig.specialties;
const entryCampaigns = entryCampaignConfig.entryCampaigns;
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const inputClassName =
  "h-12 rounded-xl border-slate-200 bg-white text-base shadow-none focus-visible:border-bolivar-blue focus-visible:ring-bolivar-blue/15";

function feedbackEndpoint() {
  if (typeof window === "undefined") return "/api/feedback";
  const pathname = window.location.pathname;
  const marker = pathname.indexOf("/feedback");
  const base = marker >= 0 ? pathname.slice(0, marker) : "";
  return `${base}/api/feedback`;
}

type Status = "idle" | "sending" | "success" | "error";

export function FeedbackForm() {
  const [channel, setChannel] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;

    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") ?? "").trim(),
      origin: String(data.get("origin") ?? "").trim(),
      channel: String(data.get("channel") ?? "").trim(),
      channelOther:
        channel === "otro" ? String(data.get("channelOther") ?? "").trim() : "",
      entryCampaign: String(data.get("entryCampaign") ?? "").trim(),
      campaign: String(data.get("campaign") ?? "").trim(),
    };

    setStatus("sending");
    setError("");

    try {
      const response = await fetch(feedbackEndpoint(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!response.ok) {
        throw new Error(body?.error || "No pudimos enviar tus datos.");
      }

      form.reset();
      setChannel("");
      setStatus("success");
    } catch (cause) {
      setStatus("error");
      setError(
        cause instanceof Error
          ? cause.message
          : "No pudimos enviar tus datos. Revisa tu conexión e intenta nuevamente.",
      );
    }
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#f7fbfd_0%,#ffffff_52%,#f5f8ee_100%)] text-slate-950">
      <header className="border-b border-sky-100/80 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4 sm:px-8">
          <a href="../" className="flex items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bolivar-blue">
            <img
              src={`${basePath}/logo.png`}
              alt="Clínica Bolívar"
              className="h-10 w-auto sm:h-12"
              width={326}
              height={62}
            />
          </a>
          <a
            href="../"
            className="inline-flex h-10 items-center gap-2 rounded-xl text-sm font-semibold text-slate-500 transition hover:text-bolivar-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bolivar-blue"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Volver
          </a>
        </div>
      </header>

      <div className="mx-auto grid max-w-5xl gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-12 lg:py-16">
        <section className="flex flex-col justify-center">
          <span className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-sky-100 bg-white px-3 py-1.5 font-poppins text-sm font-semibold text-bolivar-blue shadow-sm">
            <Megaphone className="size-4" aria-hidden="true" />
            CUÉNTANOS DE TI
          </span>
          <h1 className="max-w-xl font-poppins text-4xl font-bold leading-[1.08] tracking-[-0.04em] sm:text-5xl">
            <span className="text-bolivar-blue [text-shadow:0_1px_2px_rgba(23,56,77,0.18)]">
              Queremos{" "}
            </span>
            <span className="text-bolivar-yellow [text-shadow:0_1px_2px_rgba(154,106,0,0.25)]">
              conocerte
            </span>
            <span className="text-bolivar-blue"> mejor</span>
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-8 text-slate-600">
            Déjanos tus datos y cuéntanos cómo te enteraste de Clínica Bolívar. Nos
            ayuda a acercar la salud preventiva a más personas.
          </p>

          <ul className="mt-8 grid gap-4">
            {[
              { icon: Clock3, text: "Toma menos de un minuto." },
              { icon: Lock, text: "Usamos tus datos solo para conocerte y contactarte." },
              { icon: CheckCircle2, text: "Sin spam ni llamadas no solicitadas." },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.text} className="flex items-start gap-3 text-sm leading-6 text-slate-600">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-bolivar-green/10 text-bolivar-green">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  {item.text}
                </li>
              );
            })}
          </ul>
        </section>

        <Card className="gap-0 overflow-hidden rounded-[1.75rem] border-sky-100 bg-white py-0 shadow-[0_24px_70px_rgba(31,65,88,0.12)]">
          <CardHeader className="gap-2 border-b border-sky-50 bg-sky-50/60 px-5 py-6 sm:px-7">
            <span className="font-poppins text-sm font-bold uppercase tracking-[0.12em] text-bolivar-blue">
              Registro de contacto
            </span>
            <h2 className="font-poppins text-2xl font-bold tracking-tight text-slate-950">
              Tus datos
            </h2>
          </CardHeader>

          <CardContent className="px-5 py-6 sm:px-7">
            {status === "success" ? (
              <div className="flex flex-col items-center py-8 text-center" role="status">
                <span className="grid size-16 place-items-center rounded-full bg-green-50 text-bolivar-green">
                  <CheckCircle2 className="size-8" aria-hidden="true" />
                </span>
                <h3 className="mt-5 font-poppins text-2xl font-bold tracking-tight text-slate-950">
                  ¡Gracias por contarnos!
                </h3>
                <p className="mt-3 max-w-sm text-sm leading-6 text-slate-500">
                  Registramos tus datos correctamente. Nos ayuda a seguir acercando la
                  salud preventiva a más personas.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStatus("idle")}
                  className="mt-6 h-11 rounded-xl border-slate-200 font-semibold text-slate-700"
                >
                  Enviar otra respuesta
                </Button>
              </div>
            ) : (
              <form className="grid gap-5" onSubmit={handleSubmit}>
                <div className="grid gap-2">
                  <label htmlFor="name" className="flex items-center gap-2 font-poppins text-sm font-semibold text-slate-700">
                    <UserRound className="size-4 text-bolivar-blue" aria-hidden="true" />
                    Nombre completo
                  </label>
                  <Input
                    id="name"
                    name="name"
                    required
                    minLength={2}
                    maxLength={120}
                    autoComplete="name"
                    placeholder="Ej. María Fernanda Pérez"
                    className={inputClassName}
                  />
                </div>

                <div className="grid gap-2">
                  <label htmlFor="origin" className="flex items-center gap-2 font-poppins text-sm font-semibold text-slate-700">
                    <MapPin className="size-4 text-bolivar-blue" aria-hidden="true" />
                    ¿De dónde nos visitas?
                  </label>
                  <Input
                    id="origin"
                    name="origin"
                    required
                    minLength={2}
                    maxLength={160}
                    placeholder="Ciudad o sector, ej. Quito · El Batán"
                    className={inputClassName}
                  />
                </div>

                <div className="grid gap-2">
                  <label htmlFor="channel" className="flex items-center gap-2 font-poppins text-sm font-semibold text-slate-700">
                    <Megaphone className="size-4 text-bolivar-blue" aria-hidden="true" />
                    ¿Cómo te enteraste de la clínica?
                  </label>
                  <div className="relative">
                    <select
                      id="channel"
                      name="channel"
                      required
                      value={channel}
                      onChange={(event) => setChannel(event.target.value)}
                      className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-10 text-base text-slate-900 outline-none transition focus-visible:border-bolivar-blue focus-visible:ring-2 focus-visible:ring-bolivar-blue/20"
                    >
                      <option value="" disabled>
                        Selecciona una opción
                      </option>
                      {channels.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                      aria-hidden="true"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <label htmlFor="entryCampaign" className="flex items-center gap-2 font-poppins text-sm font-semibold text-slate-700">
                    <Megaphone className="size-4 text-bolivar-blue" aria-hidden="true" />
                    ¿De qué campaña estás viniendo?
                  </label>
                  <div className="relative">
                    <select
                      id="entryCampaign"
                      name="entryCampaign"
                      required
                      defaultValue=""
                      className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-10 text-base text-slate-900 outline-none transition focus-visible:border-bolivar-blue focus-visible:ring-2 focus-visible:ring-bolivar-blue/20"
                    >
                      <option value="" disabled>
                        Selecciona una campaña
                      </option>
                      {entryCampaigns.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                      aria-hidden="true"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <label htmlFor="campaign" className="flex items-center gap-2 font-poppins text-sm font-semibold text-slate-700">
                    <Stethoscope className="size-4 text-bolivar-blue" aria-hidden="true" />
                    ¿Qué campaña te gustaría para la próxima?
                  </label>
                  <div className="relative">
                    <select
                      id="campaign"
                      name="campaign"
                      required
                      defaultValue=""
                      className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-10 text-base text-slate-900 outline-none transition focus-visible:border-bolivar-blue focus-visible:ring-2 focus-visible:ring-bolivar-blue/20"
                    >
                      <option value="" disabled>
                        Selecciona una especialidad
                      </option>
                      {specialties.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                      aria-hidden="true"
                    />
                  </div>
                </div>

                {channel === "otro" && (
                  <div className="grid gap-2">
                    <label htmlFor="channelOther" className="font-poppins text-sm font-semibold text-slate-700">
                      Especifica cómo te enteraste
                    </label>
                    <Input
                      id="channelOther"
                      name="channelOther"
                      required
                      minLength={2}
                      maxLength={160}
                      placeholder="Ej. Radio, recomendación, evento…"
                      className={inputClassName}
                    />
                  </div>
                )}

                {error && (
                  <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700" role="alert">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={status === "sending"}
                  className="mt-1 h-12 rounded-xl bg-bolivar-green text-base font-bold text-white shadow-[0_10px_24px_rgba(127,168,46,0.22)] hover:bg-[#719629]"
                >
                  {status === "sending" ? (
                    <>
                      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                      Enviando…
                    </>
                  ) : (
                    <>
                      <Send className="size-4" aria-hidden="true" />
                      Enviar mis datos
                    </>
                  )}
                </Button>

                <p className="text-center text-xs leading-5 text-slate-400">
                  Al enviar aceptas que guardemos estos datos para conocerte mejor.
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
