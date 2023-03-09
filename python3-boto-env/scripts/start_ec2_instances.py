import boto3

ec2_resource = boto3.resource('ec2')
ec2_client = boto3.client('ec2')

version = "86f5efea-e061-4b33-b71d-ca443f39e619"


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
        print(inst)

for r in scrape_response['Reservations']:
    for inst in r['Instances']:
        instance_ids.append(inst['InstanceId'])
        
start_response = ec2_resource.instances.filter(InstanceIds = instance_ids).start()

# print("MASTER INSTANCE ID: " + master_instances[0]["id"])
# print("FRONT END: http://{}:3003".format(master_instances[0]["public_ip_address"]))
# print("GRAFANA CONNECTION STRING: http://{}:3002".format(master_instances[0]["public_ip_address"]))
# print("MONGO CONNECTION STRING: mongodb://root:123456@{}:27017/bezkoder_db?authSource=admin".format(master_instances[0]["public_ip_address"]))
# print("DEPLOYMENT VERSION: " + version)
