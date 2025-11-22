
FROM node:20

RUN npm install -g pnpm

WORKDIR /app

EXPOSE 9999

CMD [ "pnpm", "--filter", "scheduler", "dev" ]
