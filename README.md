# stocks-api-docker-compose

### Amazon Linux 2 AMI & Docker Compose
- https://gist.github.com/npearce/6f3c7826c7499587f00957fee62f8ee9

DB_HOST=1.1.1.1 COMPOSE_DOCKER_CLI_BUILD=1 DOCKER_BUILDKIT=1 docker-compose build mongodb prometheus grafana algorithms-server frontend --build-arg MASTER_IP="1.1.1.1"
