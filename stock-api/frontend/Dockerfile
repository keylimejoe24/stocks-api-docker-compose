
FROM --platform=linux/amd64  node:14 as base
WORKDIR /frontend
COPY package.json ./package.json
COPY package-lock.json ./package-lock.json
RUN npm install

FROM base AS release
COPY . .
RUN npm run build
