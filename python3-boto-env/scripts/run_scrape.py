import boto3
import uuid
import requests

ec2_resource = boto3.resource('ec2')
ec2_client = boto3.client('ec2')

def divide_chunks(l, n):
    for i in range(0, len(l), n):
        yield l[i:i + n]

def start_scrape(urls,scrape_id):
    tickers = []
    with open('./scripts/US-Stock-Symbols/all/all_tickers.txt') as f:
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

version = "923aba20-f9f8-4eab-9078-b5489b360bbc"
scrape_instance_filter = [{
    'Name':'tag:scrape', 
    'Values': [version]}]

scrape_response = ec2_client.describe_instances(Filters=scrape_instance_filter)
scrape_instances = []

for r in scrape_response['Reservations']:
    for inst in r['Instances']:
        scrape_instances.append({
            "id":inst['InstanceId'],
            "public_ip_address":inst["PublicIpAddress"],
        })

urls = []
for instance in scrape_instances: 
    urls.append("http://{}:3000/api/scrape/run".format(instance["public_ip_address"]))

print("start_scrape...")
scrape_id = str(uuid.uuid4())
start_scrape(urls,scrape_id)
print("SCRAPE ID: " + scrape_id)