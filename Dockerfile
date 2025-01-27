FROM node:lts-alpine AS builder

WORKDIR /opt/netcup-dyndns
COPY *.json ./

RUN npm ci

COPY ./src ./src

RUN npm run prod:build

FROM node:lts-alpine

ENV NODE_ENV=production
USER node

WORKDIR /opt/netcup-dyndns

COPY package.json package-lock.json ./

RUN npm ci

COPY --from=builder /opt/netcup-dyndns/dist ./dist

CMD ["node", "dist/index.js"]
