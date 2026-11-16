# glibc image on purpose. @vitejs/plugin-react-swc ships an @swc/core
# native binary that can exit 255 with no output on Alpine/musl.
FROM node:20-slim AS builder

WORKDIR /app

ENV NODE_OPTIONS=--max-old-space-size=4096

COPY package.json package-lock.json ./
RUN npm config set registry https://registry.npmjs.org \
    && npm config set fetch-retries 5 \
    && npm config set fetch-retry-mintimeout 20000 \
    && npm config set fetch-retry-maxtimeout 120000 \
    && npm config set dns-result-order ipv4first \
    && npm ci --no-audit --no-fund \
    || npm ci --no-audit --no-fund

COPY . .

# Sitemap + African recipe prerender need Supabase at build time (Coolify build env).
ARG SUPABASE_URL
ARG SUPABASE_SECRET_KEY
ARG SUPABASE_PUBLISHABLE_KEY
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PUBLISHABLE_KEY
ENV SUPABASE_URL=$SUPABASE_URL \
    SUPABASE_SECRET_KEY=$SUPABASE_SECRET_KEY \
    SUPABASE_PUBLISHABLE_KEY=$SUPABASE_PUBLISHABLE_KEY \
    VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
    VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY

RUN npm run build

FROM nginx:alpine

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
