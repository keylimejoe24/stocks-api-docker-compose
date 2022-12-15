import requests,asyncio,sys,json,boto3,time
from botocore.exceptions import WaiterError
import ruamel.yaml
from jinja2 import Template
from multiprocessing import Process
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry
import uuid

ec2_resource = boto3.resource('ec2')
ec2_client = boto3.client('ec2')
ssm_client = boto3.client('ssm')


version = "7b3b7196-0a34-4805-9d07-9ce0295a3289"
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
        
refresh_master_commands = [
       "sudo su",
       "cd stocks-api-docker-compose",
       "git pull",
       "docker-compose down",
       "docker-compose up mongodb prometheus grafana algorithms-server frontend --build -d"
       ]
   
print(master_instances[0]["id"])
run_services_start_command([master_instances[0]["id"]], refresh_master_commands)
    
print("wait_for_services_to_start....")
wait_for_services_to_start([master_instances[0]], ["http://{}:3002/api/health","http://{}:9090/graph", "http://{}:3001/api/health","http://{}:27017","http://{}:3003"])
     
commands = [
    "sudo su",
    "cd stocks-api-docker-compose",
    "git pull",
    "docker-compose down",
    "DB_HOST={} docker-compose up scraping-server --build -d".format(master_instances[0]["public_ip_address"])
    ]
print(commands)
run_services_start_command(scrape_instance_ids, commands)
wait_for_services_to_start(scrape_instances, ["http://{}:3000/metrics"])
