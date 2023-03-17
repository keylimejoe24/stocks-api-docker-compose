import boto3

# Create a Secrets Manager client
secretsmanager = boto3.client('secretsmanager')


# Define the secrets to store
my_secrets = {
    'APCA-API-KEY-ID': "",
    'APCA-API-SECRET-KEY':""
}

# Store the secrets in AWS Secrets Manager
for secret_name, secret_value in my_secrets.items():
    response = secretsmanager.create_secret(
        Name=secret_name,
        SecretString=secret_value
    )

    print(f"Stored secret '{secret_name}' in AWS Secrets Manager.")