
FROM --platform=linux/amd64 node:14

VOLUME  /src
WORKDIR /frontend
COPY . . 
RUN npm install
RUN npm run build

