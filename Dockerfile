FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

# Install dependencies based on NODE_ENV
RUN if [ "$NODE_ENV" = "production" ]; then \
        npm ci --only=production; \
    else \
        npm ci; \
    fi

COPY . .

EXPOSE 3000

# Run based on environment
CMD if [ "$NODE_ENV" = "production" ]; then \
        npm start; \
    else \
        npm run dev; \
    fi