FROM node:18-alpine

WORKDIR /app

# Copy root package.json and workspace packages
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/

# Install dependencies
RUN npm install --workspace=backend

# Copy backend source
COPY apps/backend ./apps/backend

WORKDIR /app/apps/backend

# Create logs directory
RUN mkdir -p logs

EXPOSE 5000

CMD ["npm", "start"]
