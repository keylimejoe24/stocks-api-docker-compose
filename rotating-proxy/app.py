import requests
import requests_ip_rotator
from flask import Flask, request, Response,jsonify, make_response
from requests_ip_rotator import ApiGateway, EXTRA_REGIONS, ALL_REGIONS
import json
import logging
import os
import requests_random_user_agent
import json 
logging.basicConfig(level=logging.INFO)

app = Flask(__name__)

api_gateways = {
    "https://query1.finance.yahoo.com" : ApiGateway(site="https://query1.finance.yahoo.com" ,regions=ALL_REGIONS),
    "https://finance.yahoo.com" : ApiGateway(site="https://finance.yahoo.com" ,regions=ALL_REGIONS)
}

@app.route('/stop', methods=['POST','GET'])
def stop_gateway():
    print('Api Gateway Stop')
    for key in api_gateways:
       api_gateways[key].shutdown()
       print('{} stopped...'.format(key))
    return Response(
        status=200,
    )

@app.route('/start', methods=['POST','GET'])
def start_gateway():
    print('Api Gateway Start')
    for key in api_gateways:
        print('{} started...'.format(key))
        api_gateways[key].start()
    return Response(
        status=200,
    )

@app.route('/api/proxy', methods=['POST','GET'])
def proxy_request():
   

    
    # Get the headers from the incoming request
    data = request.get_json()   
    root_url = data.get('root_url')
    query_url = data.get('query_url')   
    params = data.get('params')
    gateway = api_gateways[root_url]
    app.logger.info(root_url)
    app.logger.info(query_url)
    app.logger.info(params)
    session = requests.Session()
    session.mount(root_url, gateway)

    resp = session.get(query_url,
                params=params
            )
    
    # app.logger.info(resp.content)
    app.logger.info(resp.status_code)

    excluded_headers = ['content-encoding', 'content-length', 'transfer-encoding', 'connection']  #NOTE we here exclude all "hop-by-hop headers" defined by RFC 2616 section 13.5.1 ref. https://www.rfc-editor.org/rfc/rfc2616#section-13.5.1
    headers          = [
        (k,v) for k,v in resp.raw.headers.items()
        if k.lower() not in excluded_headers
    ]


    return Response(
        response=resp.content,
        status=resp.status_code,
        headers=headers
    )
def main():
    try:
        print('Api Gateway Start')
        for key in api_gateways:
            print('{} started...'.format(key))
            api_gateways[key].start()
        
        app.run(host="0.0.0.0", port=5001)
    finally:
         print('Api Gateway Stop')
         for key in api_gateways:
            api_gateways[key].shutdown()
            print('{} stopped...'.format(key))

if __name__ == "__main__":
   main()
    
   