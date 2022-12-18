# stocks-api-docker-compose

### Amazon Linux 2 AMI & Docker Compose
- https://gist.github.com/npearce/6f3c7826c7499587f00957fee62f8ee9

touch my_password.txt
docker login
cat ~/my_password.txt | docker login --username joja5627 --password-stdin
docker image tag rhel-httpd:latest registry-host:5000/myadmin/rhel-httpd:latest
docker image push registry-host:5000/myadmin/rhel-httpd:latest
 COMPOSE_DOCKER_CLI_BUILD=1 DOCKER_BUILDKIT=1 DB_HOST=1.1.1.1 docker-compose build --build-arg MASTER_IP="1.1.1.1" mongodb prometheus grafana algorithms-server frontend
