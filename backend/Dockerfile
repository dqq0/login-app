# Base image
FROM node:20-alpine AS base

# Working directory
WORKDIR /app

# Dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Dev stage
FROM base AS dev
ENV NODE_ENV=development
CMD ["npm", "run", "dev"]

# Prod stage
FROM base AS prod
ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm", "start"]
