FROM node:14
WORKDIR /stock-api
RUN git clone https://github.com/rreichel3/US-Stock-Symbols.git
WORKDIR /stock-api/node-yahoo-finance2
RUN COPY ./node_modules .
RUN npm run build
WORKDIR /stock-api/http-client-with-prom-metrics-tracking
RUN RUN COPY ./node_modules .
RUN npm run build
WORKDIR /stock-api
RUN RUN COPY ./node_modules .
COPY . .
RUN npm run build



