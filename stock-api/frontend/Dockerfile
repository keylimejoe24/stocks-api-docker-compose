FROM node:14
ARG MASTER_IP
WORKDIR /frontend
ADD package.json /frontend
RUN npm install
COPY . .
ENV REACT_APP_MASTER_IP="${MASTER_IP}"
RUN npm run build
