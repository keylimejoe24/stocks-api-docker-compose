FROM node:14
WORKDIR /stock-api
RUN git clone https://github.com/rreichel3/US-Stock-Symbols.git
WORKDIR /stock-api/node-yahoo-finance2
RUN COPY ./node_modules.tar.gz .
RUN tar -C /node_modules -zxvf node_modules.tar.gz
RUN npm run build
WORKDIR /stock-api/http-client-with-prom-metrics-tracking
RUN COPY ./node_modules.tar.gz .
RUN tar -C /node_modules -zxvf node_modules.tar.gz
RUN npm run build
WORKDIR /stock-api
COPY . .
RUN tar -C /node_modules -zxvf node_modules.tar.gz
RUN npm run build



