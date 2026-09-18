# worker/Dockerfile

# ---- Stage 1: install + build ----
FROM node:24-alpine AS builder
WORKDIR /app

COPY worker/package*.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY worker/ .
RUN npm run build

# ---- Stage 2: run only what's needed ----
FROM node:24-alpine AS runner
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

CMD ["node", "dist/index.js"]