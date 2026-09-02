# USAM Learning Worlds — Backend Dockerfile
# Multi-stage build targeting Node 22 (current prod runs bare Node 18.20.8
# via PM2 without a container; this closes the CI/CD/Dockerfile gap flagged
# in the 2026-09-02 security audit, item j).
#
# NOTE: this Dockerfile is added for CI build-verification and as a path to
# containerized deploys. Kids-server production deploy still runs via PM2 +
# start.sh as of this commit — switching the live deploy to this container
# is a separate, deliberate infra decision (not done in this change) so we
# don't disrupt a working PM2 setup without a tested rollout plan.

FROM node:22-bookworm-slim AS builder
WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:22-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

RUN groupadd -r usam && useradd -r -g usam usam

COPY package*.json ./
COPY prisma ./prisma
RUN npm ci --omit=dev && npx prisma generate

COPY --from=builder /app/dist ./dist

USER usam

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/health',(r)=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

CMD ["node", "dist/src/main.js"]
