
FROM --platform=linux/amd64  node:14 as base


COPY package.json ./package.json
COPY package-lock.json ./package-lock.json
RUN npm install

FROM base AS release
VOLUME  /frontend
WORKDIR /frontend
RUN npm run build
