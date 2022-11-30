FROM node:14
WORKDIR /stock-api
COPY ./package.json .
COPY . .
RUN npm install
WORKDIR /stock-api/node-yahoo-finance2
RUN npm install
RUN npm run build
WORKDIR /stock-api/http-client-with-prom-metrics-tracking
RUN npm install
RUN npm run build
WORKDIR /stock-api


