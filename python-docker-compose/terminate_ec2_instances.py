import boto3

ec2 = boto3.resource('ec2')
instance_ids = []
for instance in ec2.instances.all():
    instance_ids.append(instance.id)

ec2.instances.filter(InstanceIds = instance_ids).terminate()