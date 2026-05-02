FROM node:20-alpine AS builder
WORKDIR /repo
RUN corepack enable
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY tsconfig.base.json ./
COPY packages ./packages
COPY apps/api ./apps/api
RUN pnpm install --frozen-lockfile --filter @clinical-notes/api...
RUN pnpm --filter @clinical-notes/api... build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /repo /repo
WORKDIR /repo/apps/api
EXPOSE 3001
CMD ["node", "dist/main.js"]
