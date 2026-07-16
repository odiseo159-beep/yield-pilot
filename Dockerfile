FROM node:22-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
# Railway no soporta la instrucción VOLUME de Docker (falla el build). La persistencia
# de data/decisions.jsonl se configura desde su dashboard: Settings -> Volumes ->
# New Volume, mount path /app/data. El directorio lo crea la app en runtime igual.
EXPOSE 1997
CMD ["node", "dist/index.js"]
