import boto3

ec2_resource = boto3.resource('ec2')
ec2_client = boto3.client('ec2')

version = "7b3b7196-0a34-4805-9d07-9ce0295a3289"


scrape_instance_filter = [{
    'Name':'tag:scrape', 
    'Values': [version]}]

master_instance_filter = [{
    'Name':'tag:master',
    'Values': [version]}]

master_response = ec2_client.describe_instances(Filters=master_instance_filter)
scrape_response = ec2_client.describe_instances(Filters=scrape_instance_filter)
instance_ids = []

for r in master_response['Reservations']:
    for inst in r['Instances']:
        instance_ids.append(inst['InstanceId'])

for r in scrape_response['Reservations']:
    for inst in r['Instances']:
        instance_ids.append(inst['InstanceId'])
        
stop_response = ec2_resource.instances.filter(InstanceIds = instance_ids).stop()
print(stop_response)
