# Imagem base com Node
FROM node:20 AS base
WORKDIR /usr/src/app
COPY package*.json ./

# =========================
# Stage de dependências
# =========================
FROM base AS deps
RUN npm ci --only=production

# =========================
# Stage de build
# =========================
FROM base AS build
RUN npm ci
COPY . .
RUN npm run build

# =========================
# Stage de desenvolvimento
# =========================
FROM node:20 AS development
WORKDIR /usr/src/app

# Instala todas dependências (inclui dev)
COPY package*.json ./
RUN npm install

# Copia o código (mas em dev, geralmente você monta via volume no docker-compose)
COPY . .

EXPOSE 3000
CMD ["npm", "run", "start:dev"]

# =========================
# Stage de produção
# =========================
FROM node:20-slim AS production
RUN useradd --user-group --create-home --shell /bin/false appuser
WORKDIR /usr/src/app

# Copia apenas dependências de produção
COPY --from=deps /usr/src/app/node_modules ./node_modules

# Copia artefatos do build
COPY --from=build /usr/src/app/dist ./dist
COPY package*.json ./

USER appuser
EXPOSE 3000
CMD ["node", "dist/main"]