# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all deps (including dev, needed for build)
RUN npm install

# Copy rest of the source
COPY . .

# Build app
RUN npm run build


# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Copy only package files and install prod deps
COPY package*.json ./
RUN npm install --omit=dev

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Expose the backend port
EXPOSE 4000

# Run production build
CMD ["node", "dist/main"]
