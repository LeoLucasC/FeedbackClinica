import { readFile } from "node:fs/promises";
import express from "express";

import { getDatabase } from "./db.mjs";

const channels = JSON.parse(
  await readFile(new URL("./channels.json", import.meta.url), "utf8"),
).channels;
const specialties = JSON.parse(
  await readFile(new URL("./specialties.json", import.meta.url), "utf8"),
).specialties;
const entryCampaigns = JSON.parse(
  await readFile(new URL("./entry-campaigns.json", import.meta.url), "utf8"),
).entryCampaigns;
const channelValues = new Set(channels.map((channel) => channel.value));
const specialtyValues = new Set(specialties.map((specialty) => specialty.value));
const entryCampaignValues = new Set(
  entryCampaigns.map((entryCampaign) => entryCampaign.value),
);
const limits = {
  name: [2, 120],
  origin: [2, 160],
  channelOther: [2, 160],
};

const database = await getDatabase();
const app = express();

app.disable("x-powered-by");
app.use(express.json({ limit: "16kb" }));

app.get("/api/health", async (_request, response) => {
  try {
    await database.query("SELECT 1");
    response.json({ ok: true, database: database.driver });
  } catch (error) {
    console.error("[feedback-api] health check failed:", error);
    response.status(503).json({ ok: false });
  }
});

app.post("/api/feedback", async (request, response) => {
  const parsed = parseFeedback(request.body);
  if (parsed.error) {
    response.status(400).json({ error: parsed.error });
    return;
  }

  try {
    const { rows } = await database.query(
      `INSERT INTO feedback (name, origin, channel, channel_other, entry_campaign, campaign)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, created_at`,
      [
        parsed.name,
        parsed.origin,
        parsed.channel,
        parsed.channelOther,
        parsed.entryCampaign,
        parsed.campaign,
      ],
    );
    response.status(201).json({ id: rows[0].id, createdAt: rows[0].created_at });
  } catch (error) {
    console.error("[feedback-api] insert failed:", error);
    response.status(500).json({
      error: "No pudimos guardar tu respuesta. Intenta nuevamente.",
    });
  }
});

app.use((_request, response) => {
  response.status(404).json({ error: "No encontrado" });
});

// Express detecta los manejadores de error por su aridad de 4 parámetros.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((error, _request, response, _next) => {
  if (error?.type === "entity.parse.failed") {
    response.status(400).json({ error: "Datos inválidos." });
    return;
  }
  console.error("[feedback-api] unexpected error:", error);
  response.status(500).json({ error: "Error interno." });
});

function clean(value) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

function parseFeedback(body) {
  if (!body || typeof body !== "object") {
    return { error: "Datos inválidos." };
  }

  const name = clean(body.name);
  const origin = clean(body.origin);
  const channel = clean(body.channel).toLowerCase();
  const channelOther = clean(body.channelOther);
  const entryCampaign = clean(body.entryCampaign).toLowerCase();
  const campaign = clean(body.campaign).toLowerCase();

  if (name.length < limits.name[0] || name.length > limits.name[1]) {
    return { error: "Escribe tu nombre (entre 2 y 120 caracteres)." };
  }
  if (origin.length < limits.origin[0] || origin.length > limits.origin[1]) {
    return { error: "Indica de dónde nos visitas (entre 2 y 160 caracteres)." };
  }
  if (!channelValues.has(channel)) {
    return { error: "Selecciona cómo te enteraste de la clínica." };
  }
  if (
    channel === "otro" &&
    (channelOther.length < limits.channelOther[0] ||
      channelOther.length > limits.channelOther[1])
  ) {
    return { error: "Especifica cómo te enteraste de la clínica." };
  }
  if (!specialtyValues.has(campaign)) {
    return { error: "Selecciona la campaña que te gustaría para la próxima." };
  }
  if (!entryCampaignValues.has(entryCampaign)) {
    return { error: "Selecciona de qué campaña estás viniendo." };
  }

  return {
    name,
    origin,
    channel,
    channelOther: channel === "otro" ? channelOther : null,
    entryCampaign,
    campaign,
  };
}

const port = Number(process.env.PORT) || 3001;
const server = app.listen(port, "0.0.0.0", () => {
  console.log(`[feedback-api] escuchando en :${port} (${database.driver})`);
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    server.close(async () => {
      await database.close();
      process.exit(0);
    });
  });
}
