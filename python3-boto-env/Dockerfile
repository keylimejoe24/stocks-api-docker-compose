ARG MASTER_IP
ARG ACCESS_KEY
ARG SECRET_ACCESS_KEY

FROM --platform=linux/amd64 python:3.9-alpine
VOLUME /scripts
ENV MONGO_CONNECTION_STRING='mongodb://root:123456@mongodb:27017/bezkoder_db?authSource=admin'

RUN apk add build-base git gcc musl-dev python3-dev libffi-dev openssl-dev cargo openssl curl
RUN git clone https://github.com/rreichel3/US-Stock-Symbols.git
WORKDIR /US-Stock-Symbols
RUN git pull
WORKDIR /
ENV VIRTUAL_ENV=/opt/venv
RUN python3 -m venv $VIRTUAL_ENV
ENV PATH="$VIRTUAL_ENV/bin:$PATH"
COPY requirements.txt .
RUN /opt/venv/bin/python3 -m pip install --upgrade pip
RUN pip3 install -r requirements.txt

COPY /app /app
ENV AWS_ACCESS_KEY_ID=${ACCESS_KEY}
ENV AWS_SECRET_ACCESS_KEY=${SECRET_ACCESS_KEY}
ENV AWS_DEFAULT_REGION=us-east-1

CMD ["python","app/app.py"]
