import requests
import asyncio
import sys
import json
import boto3
import time
from botocore.exceptions import WaiterError
import ruamel.yaml
from jinja2 import Template
from multiprocessing import Process
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry
import uuid
import time
import sys
import git
import subprocess


ec2_resource = boto3.resource('ec2')
ec2_client = boto3.client('ec2')
ssm_client = boto3.client('ssm')


version = sys.argv[1]

def generate_socket_io_config(instances):
    socket_io_urls = []
    for instance in instances:
        socket_io_urls.append("{}:{}".format(instance["public_ip_address"], 3000))
    
    json_object = json.dumps(socket_io_urls, indent=4)
    print(socket_io_urls)
    return json_object

def generate_prometheus_config(instances):
    print(instances)
    prometheus_template = {
        "global": {
            "scrape_interval": "5s"
        },
        "scrape_configs": [

        ]
    }

    for instance in instances:
       
        prometheus_template["scrape_configs"].append({
            "job_name": "{}".format(instance['id']),
            "static_configs": [
                {
                    "targets": ["{}:{}".format(instance["public_ip_address"], 3000)]
                }
            ]
        })

    yaml = ruamel.yaml.YAML(typ=['rt', 'string'])
    yaml.indent(sequence=4, offset=2)
    prometheus_config = yaml.dump_to_string(prometheus_template)
    print("Generated Prometheus Config: ")
    print(prometheus_config)
    return prometheus_config

def requests_retry_session(
    retries=10000,
    backoff_factor=0.3,
    status_forcelist=(500, 502, 504),
    session=None,
):
    session = session or requests.Session()
    retry = Retry(
        total=retries,
        read=retries,
        connect=retries,
        backoff_factor=backoff_factor,
        status_forcelist=status_forcelist,
    )
    adapter = HTTPAdapter(max_retries=retry)
    session.mount('http://', adapter)
    session.mount('https://', adapter)
    return session


def wait_for_services_to_start(instances, endpoints):
    for instance in instances:
        for endpoint in endpoints:
            print("trying " + endpoint.format(instance["public_ip_address"]))
            response = requests_retry_session().get(
                endpoint.format(instance["public_ip_address"]))
            print(response)


def run_services_start_command(instance_ids, commands):

    response = ssm_client.send_command(
        InstanceIds=instance_ids,
        DocumentName="AWS-RunShellScript",
        Parameters={'commands': commands})

    print(response)


scrape_instance_filter = [{
    'Name': 'tag:scrape',
    'Values': [version]}]

master_instance_filter = [{
    'Name': 'tag:master',
    'Values': [version]}]

master_response = ec2_client.describe_instances(Filters=master_instance_filter)
scrape_response = ec2_client.describe_instances(Filters=scrape_instance_filter)
instance_ids = []

master_instances = []
scrape_instances = []

scrape_instance_ids = []

for r in master_response['Reservations']:
    for inst in r['Instances']:
        instance_ids.append(inst['InstanceId'])

        master_instances.append({
            "id": inst['InstanceId'],
            "public_ip_address": inst["PublicIpAddress"],
        })


for r in scrape_response['Reservations']:
    for inst in r['Instances']:
        instance_ids.append(inst['InstanceId'])
        scrape_instance_ids.append(inst['InstanceId'])
        scrape_instances.append({
            "id": inst['InstanceId'],
            "public_ip_address": inst["PublicIpAddress"],
        })

print("generate prometheus config....")
prometheus_config = generate_prometheus_config(scrape_instances)
socket_io_config = generate_socket_io_config(scrape_instances)


text_file = open("prometheus/prometheus.yml", "w")
n = text_file.write(prometheus_config)
text_file.close()

text_file = open("stock-api/frontend/src/socket_io_config.json", "w")
n = text_file.write(socket_io_config)
text_file.close()


repo = git.Repo('.', search_parent_directories=True)
repo.git.add(update=True)
repo.index.commit("generated prometheus config")
origin = repo.remote(name='origin')
origin.push()

print(master_instances)
refresh_master_commands = [
    "sudo su",
    "cd /home/ssm-user",
    # "git clone https://github.com/keylimejoe24/stocks-api-docker-compose.git",
    "cd stocks-api-docker-compose",
    "docker-compose down",
    "docker system prune --filter  'until=5h' -f",
    "git pull --no-edit origin main",
    "DB_HOST={} docker-compose up -d --build mongodb prometheus grafana algorithms-server frontend boto3-flask".format(master_instances[0]["public_ip_address"])
]


run_services_start_command(
    [master_instances[0]["id"]], refresh_master_commands)
time.sleep(10)

print("wait_for_services_to_start....")
wait_for_services_to_start([master_instances[0]], ["http://{}:3002/api/health", "http://{}:9090/graph",
                           "http://{}:3001/api/health", "http://{}:27017", "http://{}:3003", "http://{}:5000/api/v1/health"])

commands = [
    "sudo su",
    "cd /home/ssm-user/stocks-api-docker-compose",
    # "git clone https://github.com/keylimejoe24/stocks-api-docker-compose.git",
    
    "docker-compose down",
    "docker system prune --filter  'until=5h' -f"
    "git pull",
    # "docker login --username joja5627 --password-stdin < my_password.txt",  
    "DB_HOST={} docker-compose up --build -d scraping-server".format(master_instances[0]["public_ip_address"])
]
print(commands)
run_services_start_command(scrape_instance_ids, commands)
time.sleep(10)

wait_for_services_to_start(scrape_instances, ["http://{}:3000/metrics"])


print("MASTER INSTANCE ID: " + master_instances[0]["id"])
print(
    "FRONT END: http://{}:3003".format(master_instances[0]["public_ip_address"]))
print("GRAFANA CONNECTION STRING: http://{}:3002".format(
    master_instances[0]["public_ip_address"]))
print("MONGO CONNECTION STRING: mongodb://root:123456@{}:27017/bezkoder_db?authSource=admin".format(
    master_instances[0]["public_ip_address"]))
print("DEPLOYMENT VERSION: " + version)

