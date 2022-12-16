FROM node:14
ARG MASTER_IP
WORKDIR /frontend
COPY ./package.json .
RUN npm install
ENV REACT_APP_MASTER_IP="${MASTER_IP}"
RUN npm run build


