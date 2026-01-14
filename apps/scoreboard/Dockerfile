FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY apps/scoreboard/package*.json ./apps/scoreboard/

RUN npm install --workspace=scoreboard

COPY apps/scoreboard ./apps/scoreboard

WORKDIR /app/apps/scoreboard
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/apps/scoreboard/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
