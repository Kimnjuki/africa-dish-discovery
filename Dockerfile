# glibc image on purpose. @vitejs/plugin-react-swc ships an @swc/core
# native binary that can exit 255 with no output on Alpine/musl.
FROM node:20-slim AS builder

WORKDIR /app

# Prefer IPv4 via Node (npm config "dns-result-order" is invalid on current npm).
ENV NODE_OPTIONS="--max-old-space-size=4096 --dns-result-order=ipv4first"

COPY package.json package-lock.json ./
RUN npm config set registry https://registry.npmjs.org \
    && npm config set fetch-retries 5 \
    && npm config set fetch-retry-mintimeout 20000 \
    && npm config set fetch-retry-maxtimeout 120000 \
    && npm ci --no-audit --no-fund \
    || npm ci --no-audit --no-fund

COPY . .

# Optional: pass these as Coolify build-time args to refresh sitemaps/prerender.
# Build succeeds without them (committed public/sitemap*.xml + skip prerender).
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

# Materialize .env for scripts that read the file; empty values are fine.
RUN { \
      echo "SUPABASE_URL=${SUPABASE_URL}"; \
      echo "SUPABASE_SECRET_KEY=${SUPABASE_SECRET_KEY}"; \
      echo "SUPABASE_PUBLISHABLE_KEY=${SUPABASE_PUBLISHABLE_KEY}"; \
      echo "VITE_SUPABASE_URL=${VITE_SUPABASE_URL}"; \
      echo "VITE_SUPABASE_PUBLISHABLE_KEY=${VITE_SUPABASE_PUBLISHABLE_KEY}"; \
    } > .env

RUN npm run build

FROM nginx:alpine

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
