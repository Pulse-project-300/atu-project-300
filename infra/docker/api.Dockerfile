FROM node:20

RUN npm install -g pnpm

WORKDIR /app

EXPOSE 8000

CMD [ "pnpm", "--filter", "api", "dev" ]
