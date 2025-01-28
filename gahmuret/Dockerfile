FROM node:20-alpine

RUN apk add --no-cache openssl python3 libc6-compat
WORKDIR /app
COPY . .

# install dependencies based on the preferred package manager
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

EXPOSE 3000

RUN npm run build

# this docker-start reference isn't used by DOAP by default, see `start` and `postinstall`
CMD ["npm", "run", "docker-start"]
