# Сборка фронтенда (Vite + React)
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --no-audit --no-fund || npm install --no-audit --no-fund
COPY . .
RUN npm run build

# Прод-образ: Nginx для отдачи SPA и проксирования /api
FROM nginx:1.27-alpine
# Копируем собранную статику
COPY --from=build /app/dist /usr/share/nginx/html
# Копируем конфиг nginx с прокси /api -> api:3001
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
