"use client";

import { useState } from "react";
import { CheckCircle2, ExternalLink, MessageSquareText, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const GOOGLE_REVIEW_URL =
  process.env.NEXT_PUBLIC_GOOGLE_REVIEW_URL ||
  "https://maps.app.goo.gl/Qjt9xkPTfEkLzey46";

export function ReviewModule() {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState("");

  function selectRating(value: number) {
    setRating(value);
    setSubmitted(false);
  }

  function submitFeedback(event: React.FormEvent) {
    event.preventDefault();
    if (feedback.trim()) setSubmitted(true);
  }

  return (
    <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_16px_50px_rgba(31,65,88,0.07)] sm:p-7">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-yellow-50 text-bolivar-yellow">
          <MessageSquareText className="size-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-950">¿Cómo fue tu experiencia?</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">Tu opinión nos ayuda a mejorar este chequeo preventivo.</p>
        </div>
      </div>

      <div className="mt-5 flex gap-1" role="radiogroup" aria-label="Califica tu experiencia de 1 a 5 estrellas">
        {[1, 2, 3, 4, 5].map((star) => {
          const active = star <= (hovered || rating);
          return (
            <button
              key={star}
              type="button"
              role="radio"
              aria-checked={rating === star}
              aria-label={`${star} ${star === 1 ? "estrella" : "estrellas"}`}
              onClick={() => selectRating(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              onFocus={() => setHovered(star)}
              onBlur={() => setHovered(0)}
              className="rounded-lg p-1.5 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bolivar-blue"
            >
              <Star className={`size-8 transition-colors ${active ? "fill-bolivar-yellow text-bolivar-yellow" : "fill-transparent text-slate-300"}`} aria-hidden="true" />
            </button>
          );
        })}
      </div>

      {rating >= 4 && (
        <div className="mt-5 rounded-2xl border border-green-100 bg-green-50/60 p-4">
          <p className="text-sm leading-6 text-slate-700">Nos alegra saberlo. ¿Nos ayudas compartiendo tu experiencia?</p>
          <Button asChild className="mt-3 h-11 w-full rounded-xl bg-bolivar-green font-bold text-white hover:bg-[#719629] sm:w-auto">
            <a href={GOOGLE_REVIEW_URL} target="_blank" rel="noreferrer">
              Publicar en Google Maps
              <ExternalLink className="size-4" aria-hidden="true" />
            </a>
          </Button>
        </div>
      )}

      {rating > 0 && rating <= 3 && !submitted && (
        <form className="mt-5" onSubmit={submitFeedback}>
          <label htmlFor="feedback" className="text-sm font-semibold text-slate-700">Cuéntanos qué podemos mejorar</label>
          <Textarea
            id="feedback"
            value={feedback}
            onChange={(event) => setFeedback(event.target.value)}
            placeholder="Escribe aquí tu comentario..."
            minLength={3}
            required
            className="mt-2 min-h-28 resize-none rounded-xl border-slate-200 bg-white text-base shadow-none focus-visible:border-bolivar-blue focus-visible:ring-bolivar-blue/15"
          />
          <Button type="submit" className="mt-3 h-11 w-full rounded-xl bg-bolivar-blue font-bold text-white hover:bg-[#4c7fa8] sm:w-auto">
            Enviar comentario
          </Button>
          <p className="mt-2 text-xs leading-5 text-slate-400">Demo sin almacenamiento: el comentario permanece únicamente durante esta sesión.</p>
        </form>
      )}

      {submitted && (
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-sky-100 bg-sky-50/70 p-4 text-sm leading-6 text-slate-700" role="status">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-bolivar-blue" aria-hidden="true" />
          Gracias. Tu comentario quedó registrado en esta sesión de demostración.
        </div>
      )}
    </section>
  );
}
