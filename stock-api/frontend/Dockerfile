FROM node:14
ARG MASTER_IP
WORKDIR /frontend
COPY . .
ENV REACT_APP_MASTER_IP="${MASTER_IP}"
RUN npm install
RUN npm run build


