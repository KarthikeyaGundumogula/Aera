# ─── Aera Frontend Dockerfile ──────────────────────────────────────────────────
FROM node:22-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy application source
COPY . .

EXPOSE 3000

# Start Vite dev server listening on 0.0.0.0 for Docker network exposure
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]
