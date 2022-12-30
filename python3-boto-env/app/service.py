import logging
from flask import current_app
import boto3
import uuid
import requests,json
import os

log = logging.getLogger('stocks.sub')

ec2_resource = boto3.resource('ec2')
ec2_client = boto3.client('ec2')

def divide_chunks(l, n):
    for i in range(0, len(l), n):
        yield l[i:i + n]


class Service(object):
  def start_scrape(self,scrape_id):
    
    tickers = []
    with open('./US-Stock-Symbols/all/all_tickers.txt') as f:
        lines = f.readlines()
        for line in lines:
            tickers.append(line.strip())
        f.close()

    version = os.getenv('DEPLOYMENT_VERSION')
    log.debug(version)

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
    
    ticker_chunks = list(divide_chunks(tickers, 500))
    
    for index, url in enumerate(urls):
        log.debug('started scrape' + scrape_id)
        log.debug(url)
        log.debug(ticker_chunks[index])
        log.debug(len(ticker_chunks[index]))
        myobj = {'tickers': ticker_chunks[index],'scrapeID':scrape_id} 
        log.debug(myobj)
        response = requests.post(url, json = myobj)
        log.warn(response)
        
    return json.dumps({'success':True}), 200, {'ContentType':'application/json'}  


    
   
