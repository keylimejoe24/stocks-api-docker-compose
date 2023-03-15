import boto3
from botocore.exceptions import ClientError


def check_eip():
    ec2 = boto3.client("ec2")
    res_describe = ec2.describe_addresses()

    if res_describe["Addresses"]:
        return res_describe["Addresses"][0]["PublicIp"]
    else:
        return "NO EIP"

InstanceID = "i-09ca014e14358b00b"

ec2 = boto3.client("ec2")

try:
    print("Step0: ", check_eip())

    allocation = ec2.allocate_address(Domain="vpc")
    print("Step1: ", check_eip())

    response = ec2.associate_address(
        AllocationId=allocation["AllocationId"], InstanceId=InstanceID
    )
    print("Step2: ", check_eip())

    # Do something here with the new EIP

    response2 = ec2.disassociate_address(
        AssociationId=response["AssociationId"])
    print("Step3: ", check_eip())

    response3 = ec2.release_address(AllocationId=allocation["AllocationId"])
    print("Step4: ", check_eip())

except ClientError as e:
    print(e)