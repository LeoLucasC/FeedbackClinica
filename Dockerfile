FROM node:22-alpine AS builder

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .

ARG NEXT_PUBLIC_GOOGLE_REVIEW_URL=https://maps.app.goo.gl/Qjt9xkPTfEkLzey46
ENV NEXT_PUBLIC_GOOGLE_REVIEW_URL=$NEXT_PUBLIC_GOOGLE_REVIEW_URL

RUN npm run build

FROM nginx:1.27-alpine AS runner
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist/client /usr/share/nginx/html
EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1
