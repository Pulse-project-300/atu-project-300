FROM node:20

# Install pnpm globally
RUN npm install -g pnpm

WORKDIR /app

# Source is mounted from host in dev mode
EXPOSE 3000

# Default command gets overridden in docker compose
CMD [ "pnpm", "--filter", "web", "dev" ]
