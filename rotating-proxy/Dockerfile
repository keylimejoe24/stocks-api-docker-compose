FROM python:3.11 as python-base

RUN apt-get update && apt-get install -y \
    curl \
    jq \
    ccrypt \ 
    awscli



# https://python-poetry.org/docs#ci-recommendations
ENV POETRY_VERSION=1.4.0
ENV POETRY_HOME=/opt/poetry
ENV POETRY_VENV=/opt/poetry-venv

# Tell Poetry where to place its cache and virtual environment
ENV POETRY_CACHE_DIR=/opt/.cache

# Create stage for Poetry installation
FROM python-base as poetry-base

# Creating a virtual environment just for poetry and install it with pip
RUN python3 -m venv $POETRY_VENV \
	&& $POETRY_VENV/bin/pip install -U pip setuptools \
	&& $POETRY_VENV/bin/pip install poetry==${POETRY_VERSION}

# Create a new stage from the base python image
FROM python-base as example-app

# Copy Poetry to app image
COPY --from=poetry-base ${POETRY_VENV} ${POETRY_VENV}

# Add Poetry to PATH
ENV PATH="${PATH}:${POETRY_VENV}/bin"

WORKDIR /app

# Copy Dependencies
COPY poetry.lock pyproject.toml ./

# [OPTIONAL] Validate the project is properly configured
RUN poetry check

# Install Dependencies --no-interaction --no-cache --without dev
RUN poetry install 

# Copy Application
COPY . /app

COPY aws_secrets.json.cpt . 
COPY decrypt_secrets.sh . 
RUN sh decrypt_secrets.sh



# Run Application
EXPOSE 5001
# "flask", "run", "--host=0.0.0.0","-p 5001"
CMD [ "poetry", "run", "python", "app.py"  ]