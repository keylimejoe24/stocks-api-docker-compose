FROM node:14
WORKDIR /stock-api
RUN git clone https://github.com/rreichel3/US-Stock-Symbols.git
COPY package.json ./package.json
COPY package-lock.json ./package-lock.json
RUN npm install
COPY . .
WORKDIR /stock-api/node-yahoo-finance2
RUN npm install
RUN npm run build
WORKDIR /stock-api/http-client-with-prom-metrics-tracking
RUN npm install
RUN npm run build
WORKDIR /stock-api