import requests,asyncio,sys,json,boto3,time
from botocore.exceptions import WaiterError
import ruamel.yaml
from jinja2 import Template
from multiprocessing import Process
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry
import uuid

session = boto3.Session()
credentials = session.get_credentials()

ec2 = boto3.resource('ec2')
ec2_client = boto3.client('ec2')
ssm_client = boto3.client('ssm')
command_executed_waiter = ssm_client.get_waiter('command_executed')


MAX_RETRY = 10


def scrape_us_stock_symbols(instances):
    tickers = []

    with open('US-Stock-Symbols/all/all_tickers.txt') as f:
        lines = f.readlines()
        for line in lines:
            tickers.append(line.strip())
        f.close()

    symbol_chunks = [tickers[i:i + 1000] for i in range(0, len(tickers), 1000)]

    for indx, chunk in enumerate(symbol_chunks):
        url = 'http://{}:3000/api/scrape/run'.format(
            instances[indx].public_ip_address)
        myobj = {'tickers': chunk}
        print(instances[indx].id)
        print(instances[indx].public_ip_address)
        print(url)
        response = requests.post(url, json=myobj)
        print(response)


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
            "job_name": "{}".format(instance.id),
            "static_configs": [
                {
                    "targets": ["{}:{}".format(instance.public_ip_address, 3000)]
                }
            ]
        })

    yaml = ruamel.yaml.YAML(typ=['rt', 'string'])
    yaml.indent(sequence=4, offset=2)
    prometheus_config = yaml.dump_to_string(prometheus_template)
    print("Generated Prometheus Config: ")
    print(prometheus_config)
    return prometheus_config

def start_master_servers(instances,scrape_instances):
    prometheus_config = generate_prometheus_config(scrape_instances)
    print("run_master_server_start_command....")
    create_prometheus_config = 'echo "{}" > prometheus/prometheus.yml'.format(prometheus_config)
    
    commands = [
        "sudo su",
        "git clone https://github.com/keylimejoe24/stocks-api-docker-compose.git",
        "cd stocks-api-docker-compose",
        create_prometheus_config,
        "docker-compose up mongodb prometheus grafana algorithms-server -d"
        ]
   
    print(instances[0].id)
    run_services_start_command([instances[0].id], commands)
    
    print("wait_for_services_to_start....")
    wait_for_services_to_start([instances[0]], ["http://{}:3002/api/health","http://{}:9090/graph", "http://{}:3001/api/health","http://{}:27017"])
    return 

def start_scrape_servers(instances,scrape_instances,scrape_instances_ids):
    print("run_scrape_server_start_commands....")
    print("starting....")
    print(scrape_instances_ids)
   
    commands = [
    "sudo su",
    "git clone https://github.com/keylimejoe24/stocks-api-docker-compose.git",
    "cd stocks-api-docker-compose",
    "DB_HOST={} docker-compose up scraping-server --build -d".format(instances[0].public_ip_address)
    ]
    print(commands)
    run_services_start_command(scrape_instances_ids, commands)
    wait_for_services_to_start(scrape_instances, ["http://{}:3000/metrics"])

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
            print("trying " + endpoint.format(instance.public_ip_address))
            response = requests_retry_session().get(endpoint.format(instance.public_ip_address))
            print(response)

def run_services_start_command(instance_ids, commands):
   
    response = ssm_client.send_command(
        InstanceIds=instance_ids,
        DocumentName="AWS-RunShellScript",
        Parameters={'commands': commands})

    print(response)

def divide_chunks(l, n):
    for i in range(0, len(l), n):
        yield l[i:i + n]

def start_scrape(urls,scrape_id):
    tickers = []
    with open('/Users/favoritechild/dev/stocks-api-docker-compose/aws-cdk-python/scripts/US-Stock-Symbols/all/all_tickers.txt') as f:
        lines = f.readlines()
        for line in lines:
            tickers.append(line.strip())
        f.close()

    ticker_chunks = list(divide_chunks(tickers, 400))

    for index, url in enumerate(urls):
        print(url)
        print(ticker_chunks[index])
        print(len(ticker_chunks[index]))
        myobj = {'tickers': ticker_chunks[index],'scrapeID':scrape_id} 
        response = requests.post(url, json = myobj)
        print(response)


def main():
    instances = ec2.create_instances(
        ImageId="ami-01425ace5debe9cee",
        MinCount=1,
        MaxCount=1,
        InstanceType="t2.micro",
        KeyName="stock-api",
        SecurityGroupIds=["launch-wizard-1", "default"],
        IamInstanceProfile={
            'Arn': 'arn:aws:iam::313155636620:instance-profile/MyEC2SSMRole'}
    )
    scrape_instances = ec2.create_instances(
        ImageId="ami-01425ace5debe9cee",
        MinCount=20,
        MaxCount=20,
        InstanceType="t2.micro",
        KeyName="stock-api",
        SecurityGroupIds=["launch-wizard-1", "default"],
        IamInstanceProfile={
            'Arn': 'arn:aws:iam::313155636620:instance-profile/MyEC2SSMRole'}
    )

    instances_starting = True
    instance_ids = [o.id for o in instances]

    scrape_instances_starting = True
    scrape_instance_ids = [o.id for o in scrape_instances]

    for instance in instances:
        instance.wait_until_running()
        instance.reload()

    for instance in scrape_instances:
        instance.wait_until_running()
        instance.reload()

    while scrape_instances_starting:
        time.sleep(.50)
        print("scrape instances starting....")
        starting_instances = boto3.client(
            "ec2").describe_instance_status(InstanceIds=scrape_instance_ids)
        for each in starting_instances["InstanceStatuses"]:
            if each["InstanceStatus"]["Status"] == 'ok' and each["SystemStatus"]["Details"][0]["Status"] == 'passed' and each["SystemStatus"]["Status"]:
                scrape_instances_starting = False

    while instances_starting:
        time.sleep(.50)
        print("instances starting....")
        starting_instances = boto3.client(
            "ec2").describe_instance_status(InstanceIds=instance_ids)
        for each in starting_instances["InstanceStatuses"]:
            if each["InstanceStatus"]["Status"] == 'ok' and each["SystemStatus"]["Details"][0]["Status"] == 'passed' and each["SystemStatus"]["Status"]:
                instances_starting = False
   
    
    start_master_servers(instances,scrape_instances)
    start_scrape_servers(instances,scrape_instances,scrape_instance_ids)
    urls = [
       
    ]
    for instance in scrape_instances: 
        urls.append("http://{}:3000/api/scrape/run".format(instance.public_ip_address))
    scrape_id = str(uuid.uuid4())
    print("start_scrape...")
    start_scrape(urls,scrape_id)
    print("SCRAPE ID: " + scrape_id)
    print("GRAFANA CONNECTION STRING: http://{}:3002".format(instances[0].public_ip_address))
    print("MONGO CONNECTION STRING: mongodb://root:123456@{}:27017/bezkoder_db?authSource=admin".format(instances[0].public_ip_address))
    print("ALGORITHMS ENDPOINT: http://{}:3001/api/scrape/runAlgorithms/{}".format(instances[0].public_ip_address,scrape_id))
   
   

if __name__=='__main__':
    main()


# scrape_us_stock_symbols()
