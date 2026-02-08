FROM node:20-slim as builder

WORKDIR /service

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# --- Stage 2: Run ---
FROM node:20-slim
WORKDIR /service

# Only copy the production dependencies (ignores devDependencies)
COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /service/dist ./dist
# COPY --from=builder /service/data ./data

# Ensure the database file stays in a persistent location
EXPOSE 80

CMD ["node", "dist/index.js"]
