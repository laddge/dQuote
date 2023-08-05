FROM node:20.5.0-alpine3.18

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Files required by pnpm install
COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

# Bundle app source
COPY . .

CMD [ "pnpm", "start" ]
