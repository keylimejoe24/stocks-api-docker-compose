# stocks-api-docker-compose

### Amazon Linux 2 AMI & Docker Compose
- https://gist.github.com/npearce/6f3c7826c7499587f00957fee62f8ee9

touch my_password.txt
docker login
cat ~/my_password.txt | docker login --username joja5627 --password-stdin
docker image tag rhel-httpd:latest registry-host:5000/myadmin/rhel-httpd:latest
docker image push registry-host:5000/myadmin/rhel-httpd:latest
docker push joja5627/algorithms-server:tagname

 COMPOSE_DOCKER_CLI_BUILD=1 DOCKER_BUILDKIT=1 DB_HOST=1.1.1.1 docker-compose build --build-arg MASTER_IP="1.1.1.1"

<none>                               <none>    32db177fea3d   4 minutes ago   1.69GB
stocks-api-docker-compose_frontend   latest    6e18bb27dd8b   5 minutes ago   1.32GB
mongo                                latest    0850fead9327   9 days ago      700MB
joja5627/scraping-server             latest    184138ec8cb1   2 weeks ago     1.99GB
joja5627/algorithms-server           latest    184138ec8cb1   2 weeks ago     1.99GB
grafana/grafana                      7.1.5     9ad3ce931acd   2 years ago     180MB
prom/prometheus                      v2.20.1   b205ccdd28d3   2 years ago     145MB

docker image tag grafana/grafana joja5627/grafana:latest
docker image tag prom/prometheus joja5627/prometheus:latest