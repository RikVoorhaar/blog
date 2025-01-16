FROM node:current-alpine AS blog

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . . 
RUN npm run build --verbose

USER node:node

CMD ["node", "build"]