# Semáforo de Salud Preventivo

Aplicación web para Clínica Bolívar. Evalúa ocho mediciones en el navegador, calcula el IMC y presenta un semáforo preventivo con desglose por indicador. Incluye un formulario de feedback que registra en PostgreSQL el nombre, la procedencia y cómo se enteró el paciente de la clínica.

## Estructura

```text
.
├── app/
│   ├── feedback/page.tsx      # Ruta del formulario
│   ├── globals.css            # Tailwind, tokens de marca y animaciones
│   ├── layout.tsx             # Metadatos y layout raíz
│   └── page.tsx               # Ruta principal
├── api/
│   ├── index.mjs              # API Node: POST /api/feedback y GET /api/health
│   ├── db.mjs                 # PostgreSQL (o PGlite en desarrollo)
│   ├── schema.sql             # Tabla feedback
│   ├── channels.json          # Canales disponibles (compartidos con la UI)
│   └── Dockerfile             # Imagen del API
├── components/
│   ├── feedback/
│   │   └── feedback-form.tsx  # Formulario de registro
│   ├── health/
│   │   ├── gauge-chart.tsx    # Velocímetro SVG animado
│   │   ├── health-checker.tsx # Flujo formulario → dashboard
│   │   └── review-module.tsx  # Reseña condicional de 5 estrellas
│   └── ui/                    # Primitivas accesibles de interfaz
├── lib/
│   └── health.ts              # Validación y motor de clasificación local
├── public/
│   └── favicon.svg
├── .env.example
├── Dockerfile                 # Imagen estática del frontend
├── docker-compose.yml         # web + api + db (PostgreSQL 17)
└── next.config.ts
```

## Puesta en marcha local

1. Instala Node.js 22 o superior.
2. Instala las dependencias del frontend y del API:

```bash
npm ci
npm run api:install
```

3. Copia `.env.example` como `.env.local` si quieres cambiar la URL de Google Maps.
4. Levanta el API y el frontend en dos terminales:

```bash
# Terminal 1: API en http://localhost:3001
npm run api

# Terminal 2: frontend en http://localhost:5173
npm run dev
```

El API usa PGlite (PostgreSQL embebido) en `.data/pglite` cuando no defines `DATABASE_URL`, así que no necesitas instalar PostgreSQL para desarrollar. Los datos de prueba quedan en esa carpeta, que está ignorada por Git.

Para usar un PostgreSQL propio en local:

```bash
DATABASE_URL=postgres://usuario:clave@127.0.0.1:5432/base npm run api
```

El formulario está en `http://localhost:5173/feedback` y también se enlaza desde el encabezado de la página principal.

## Formulario y base de datos

Tabla `feedback`:

| Campo           | Tipo         | Detalle                                                        |
| --------------- | ------------ | -------------------------------------------------------------- |
| `id`            | `bigint`     | Clave primaria autoincremental.                                |
| `name`          | `text`       | Nombre completo.                                               |
| `origin`        | `text`       | Ciudad o sector de procedencia.                                |
| `channel`       | `text`       | `facebook`, `instagram`, `tiktok`, `volante` u `otro`.          |
| `channel_other` | `text`       | Detalle cuando `channel = 'otro'`.                             |
| `created_at`    | `timestamptz`| Fecha de registro.                                             |

Endpoints:

- `POST /api/feedback`: valida y registra una respuesta.
- `GET /api/health`: comprueba que el API y la base de datos responden.

Para consultar los registros en el VPS:

```bash
docker compose exec db psql -U feedbackclinica -d feedbackclinica \
  -c "select id, name, origin, channel, channel_other, created_at from feedback order by created_at desc;"
```

Respaldo rápido:

```bash
docker compose exec db pg_dump -U feedbackclinica feedbackclinica > feedback-backup.sql
```

## Despliegue en el VPS

En el servidor `76.13.166.188`, el proyecto vive en `/root/FeedbackClinica` y Nginx publica la app en `https://hsiatx2025.cloud/FeedbackClinica/`, redirigiendo al puerto `8095` del host.

1. Actualiza el código en el servidor (`git pull` o copia de los archivos).
2. La primera vez crea el `.env` y cambia la contraseña:

```bash
cp .env.example .env
# edita POSTGRES_PASSWORD
```

3. Si existe el contenedor antiguo del frontend, retíralo para liberar el puerto:

```bash
docker rm -f feedbackclinica-frontend
```

4. Construye y levanta los tres servicios:

```bash
docker compose up -d --build
```

El compose levanta:

- `db`: PostgreSQL 17 con volumen persistente `feedback_pgdata`.
- `api`: Node + Express, solo accesible desde la red interna.
- `web`: Nginx con el export estático, publica `${WEB_PORT:-8095}` y enruta `/api/` al API.

Si ya tienes un PostgreSQL propio, define `DATABASE_URL` en el `.env` y ajústalo al host donde esté disponible. Por defecto se usa el contenedor `db`.

## Criterios del semáforo

El resultado general toma el nivel más importante detectado entre IMC, presión arterial, frecuencia cardiaca, saturación de oxígeno, temperatura y frecuencia respiratoria. Los rangos son preventivos y orientativos para adultos; no constituyen diagnóstico médico.

## Privacidad

Las mediciones del chequeo viven únicamente en el estado temporal de la pestaña; al recargar o cerrar la página desaparecen. El formulario de feedback es la única parte que guarda datos: nombre, procedencia y canal de llegada, con el fin de conocer cómo llegan los pacientes a la clínica. La única salida externa es el enlace voluntario a Google Maps cuando la calificación es de cuatro o cinco estrellas.
