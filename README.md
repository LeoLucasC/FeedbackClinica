# Semáforo de Salud Preventivo

Aplicación web estática para Clínica Bolívar. Evalúa ocho mediciones en el navegador, calcula el IMC y presenta un semáforo preventivo con desglose por indicador. No incluye backend, cuentas, cookies ni base de datos.

## Estructura

```text
.
├── app/
│   ├── globals.css            # Tailwind, tokens de marca y animaciones
│   ├── layout.tsx             # Metadatos y layout raíz
│   └── page.tsx               # Ruta principal
├── components/
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
├── Dockerfile
├── docker-compose.yml
├── nginx.conf
└── next.config.ts
```

## Puesta en marcha

1. Instala Node.js 22 o superior.
2. Copia `.env.example` como `.env.local` y reemplaza la URL de Google Maps.
3. Instala y ejecuta:

```bash
npm ci
npm run dev
```

La aplicación se abre en `http://localhost:5173`.

## Despliegue en el VPS

En el servidor `76.13.166.188`, instala Docker y el plugin Docker Compose. Copia el proyecto y ejecuta:

```bash
cp .env.example .env
docker compose up -d --build
```

El contenedor publica el sitio en el puerto 80 y sirve el export estático con Nginx. No se levanta PostgreSQL ni FastAPI porque toda la lógica funciona localmente en el navegador.

## Criterios del semáforo

El resultado general toma el nivel más importante detectado entre IMC, presión arterial, frecuencia cardiaca, saturación de oxígeno, temperatura y frecuencia respiratoria. Los rangos son preventivos y orientativos para adultos; no constituyen diagnóstico médico.

## Privacidad

Las mediciones y el comentario interno viven únicamente en el estado temporal de la pestaña. Al recargar o cerrar la página desaparecen. La única salida externa disponible es el enlace voluntario a Google Maps cuando la calificación es de cuatro o cinco estrellas.
