FROM python:3.9-alpine

VOLUME /scripts


RUN apk add build-base git
RUN git clone https://github.com/rreichel3/US-Stock-Symbols.git
WORKDIR /US-Stock-Symbols
RUN git pull
WORKDIR /

ENV VIRTUAL_ENV=/opt/venv
RUN python3 -m venv $VIRTUAL_ENV
ENV PATH="$VIRTUAL_ENV/bin:$PATH"
COPY requirements.txt .
RUN /usr/local/bin/python -m pip install --upgrade pip

RUN pip3 install -r requirements.txt
