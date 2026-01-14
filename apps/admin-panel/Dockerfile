FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY apps/admin-panel/package*.json ./apps/admin-panel/

RUN npm install --workspace=admin-panel

COPY apps/admin-panel ./apps/admin-panel

WORKDIR /app/apps/admin-panel
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/apps/admin-panel/dist /usr/share/nginx/html
COPY apps/admin-panel/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
