FROM node:14
WORKDIR /frontend
COPY . .
ENV REACT_APP_NOT_SECRET_CODE="test"
RUN npm install
RUN npm run build


