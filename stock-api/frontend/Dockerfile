FROM node:14
ARG MASTER_IP
WORKDIR /frontend
COPY package.json ./package.json
COPY package-lock.json ./package-lock.json
RUN npm install
COPY . .
ENV REACT_APP_MASTER_IP="${MASTER_IP}"
RUN npm run build
