FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY apps/display-screen/package*.json ./apps/display-screen/

RUN npm install --workspace=display-screen

COPY apps/display-screen ./apps/display-screen

WORKDIR /app/apps/display-screen
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/apps/display-screen/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
