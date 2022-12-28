import requests,asyncio,sys,json,boto3,time
from botocore.exceptions import WaiterError
import ruamel.yaml
from jinja2 import Template
from multiprocessing import Process
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry

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
        "wget https://github.com/keylimejoe24/stocks-api-docker-compose/archive/refs/heads/main.zip",
        "unzip main.zip",
        "cd stocks-api-docker-compose-main",
        create_prometheus_config,
        "docker-compose up mongodb prometheus grafana algorithms-server -d"
        ]


   
    print(instances[0].id)
    run_services_start_command([instances[0].id], commands)
    
    print("wait_for_services_to_start....")
    wait_for_services_to_start([instances[0]], ["http://{}:3002/api/health","http://{}:9090/graph", "http://{}:3001/api/health"])
    return 

def start_scrape_servers(instances,scrape_instances,scrape_instances_ids):
    print("run_scrape_server_start_commands....")
    print("starting....")
    print(scrape_instances_ids)
   
    commands = [
   "sudo su",
    "wget https://github.com/keylimejoe24/stocks-api-docker-compose/archive/refs/heads/main.zip",
    "unzip main.zip",
    'git clone https://github.com/keylimejoe24/stocks-api-docker-compose.git',
    "cd stocks-api-docker-compose-main",
    "DB_HOST={} docker-compose up scraping-server -d".format(instances[0].public_ip_address)
    ]
    print(commands)
    run_services_start_command([scrape_instances_ids], commands)
    wait_for_services_to_start([scrape_instances], ["http://{}:3000/metrics"])

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
    # for id in instance_ids:
    #     get_command_invocation_params = {
    #         'CommandId': command_id,
    #         'InstanceId': id
    #     }
    #     for i in range(MAX_RETRY):
    #         try:
    #            command_executed_waiter.wait(**get_command_invocation_params)
    #            break
    #         except WaiterError as err:
    #             print(err)
    #             last_resp = err.last_response
    #             if 'Error' in last_resp:
    #                 if last_resp['Error']['Code'] != 'InvocationDoesNotExist' or i + 1 == MAX_RETRY:
    #                     raise err
    #             else:
    #                 if last_resp['Status'] == 'Failed':
    #                     print(last_resp['StandardErrorContent'],
    #                           file=sys.stderr)
    #                     exit(last_resp['ResponseCode'])
    #             continue




def main():
    instances = ec2.create_instances(
        ImageId="ami-07a5697be048d9f83",
        MinCount=1,
        MaxCount=1,
        InstanceType="t3.micro",
        KeyName="stock-api",
        SecurityGroupIds=["launch-wizard-1", "default"],
        IamInstanceProfile={
            'Arn': 'arn:aws:iam::313155636620:instance-profile/MyEC2SSMRole'}
    )
    scrape_instances = ec2.create_instances(
        ImageId="ami-07a5697be048d9f83",
        MinCount=8,
        MaxCount=8,
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
   
    # instances = [ec2.Instance(id='i-0bc9a3c701522f22c')]
    # scrape_instances = [ec2.Instance(id='i-03f3c7b9c6ea086b5'), ec2.Instance(id='i-0f22ca1bd74366468'), ec2.Instance(id='i-0f47db9ef2053b187'), ec2.Instance(id='i-07cf88ac94a9634aa'), ec2.Instance(id='i-0e911d8fce9cfbf2b'), ec2.Instance(id='i-0193d8247fb677eab'), ec2.Instance(id='i-0ec385bd59b7d4726'), ec2.Instance(id='i-06081f3cabf622235')]
    # scrape_instance_ids = ['i-03f3c7b9c6ea086b5', 'i-0f22ca1bd74366468', 'i-0f47db9ef2053b187', 'i-07cf88ac94a9634aa', 'i-0e911d8fce9cfbf2b', 'i-0193d8247fb677eab', 'i-0ec385bd59b7d4726', 'i-06081f3cabf622235']
    start_master_servers(instances,scrape_instances)
    start_scrape_servers(instances,scrape_instances,scrape_instance_ids)
   

if __name__=='__main__':
    main()


# scrape_us_stock_symbols()
