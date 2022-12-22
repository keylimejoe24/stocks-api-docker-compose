import requests,asyncio,sys,json,boto3,time
from botocore.exceptions import WaiterError
import ruamel.yaml
from jinja2 import Template
from multiprocessing import Process
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry
import uuid
import time

ec2_resource = boto3.resource('ec2')
ec2_client = boto3.client('ec2')
ssm_client = boto3.client('ssm')


version = "d831bc3e-046b-44e0-ad90-905b3d4d07ff"
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
            response = requests_retry_session().get(endpoint.format(instance["public_ip_address"]))
            print(response)

def run_services_start_command(instance_ids, commands):
   
    response = ssm_client.send_command(
        InstanceIds=instance_ids,
        DocumentName="AWS-RunShellScript",
        Parameters={'commands': commands})

    print(response)

scrape_instance_filter = [{
    'Name':'tag:scrape', 
    'Values': [version]}]

master_instance_filter = [{
    'Name':'tag:master',
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
            "id":inst['InstanceId'],
            "public_ip_address":inst["PublicIpAddress"],
        })
       

for r in scrape_response['Reservations']:
    for inst in r['Instances']:
        instance_ids.append(inst['InstanceId'])
        scrape_instance_ids.append(inst['InstanceId'])
        scrape_instances.append({
            "id":inst['InstanceId'],
            "public_ip_address":inst["PublicIpAddress"],
        })

print(master_instances)
refresh_master_commands = [
       "sudo su",
       "git clone https://github.com/keylimejoe24/stocks-api-docker-compose.git",
       "cd stocks-api-docker-compose",
       "git pull",
       "docker-compose down",
       "docker login --username joja5627 --password-stdin < my_password.txt",
       "docker pull joja5627/prometheus:latest" ,
       "docker pull joja5627/node-server:latest" ,
       "docker pull joja5627/mongo:latest" ,
       "docker pull joja5627/grafana:latest" ,
       "docker pull joja5627/boto3-flask:latest",
       "docker-compose up -d mongodb prometheus grafana algorithms-server frontend boto3-flask"
       ]
   

run_services_start_command([master_instances[0]["id"]], refresh_master_commands)
time.sleep(10)

print("wait_for_services_to_start....")
wait_for_services_to_start([master_instances[0]], ["http://{}:3002/api/health","http://{}:9090/graph", "http://{}:3001/api/health","http://{}:27017","http://{}:3003","http://{}:5000/api/v1/health"])
     
commands = [
     "sudo su",
     "git clone https://github.com/keylimejoe24/stocks-api-docker-compose.git",
       "cd stocks-api-docker-compose",
       "git pull",
       "docker-compose down",
       "docker login --username joja5627 --password-stdin < my_password.txt",
       "docker pull joja5627/node-server:latest" ,
       "docker-compose up -d scraping-server"
    ]
print(commands)
run_services_start_command(scrape_instance_ids, commands)
time.sleep(10)

wait_for_services_to_start(scrape_instances, ["http://{}:3000/metrics"])


print("MASTER INSTANCE ID: " + master_instances[0]["id"])
print("FRONT END: http://{}:3003".format(master_instances[0]["public_ip_address"]))
print("GRAFANA CONNECTION STRING: http://{}:3002".format(master_instances[0]["public_ip_address"]))
print("MONGO CONNECTION STRING: mongodb://root:123456@{}:27017/bezkoder_db?authSource=admin".format(master_instances[0]["public_ip_address"]))
print("DEPLOYMENT VERSION: " + version)