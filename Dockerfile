FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

# Устанавливаем зависимости в зависимости от NODE_ENV
RUN if [ "$NODE_ENV" = "production" ]; then \
        npm ci --only=production; \
    else \
        npm ci; \
    fi

COPY . .

EXPOSE 3000

# Запускаем в зависимости от окружения
CMD if [ "$NODE_ENV" = "production" ]; then \
        npm start; \
    else \
        npm run dev; \
    fi
