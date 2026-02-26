FROM node:20-alpine

WORKDIR /app

RUN npm install -g pnpm

COPY package.json ./
RUN pnpm install

COPY . .
RUN pnpm build

ENV NODE_ENV=production
EXPOSE 8000

CMD ["node", "dist/index.js"]
