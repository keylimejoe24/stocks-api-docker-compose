from flask import Flask
import json
from service import Service
from flask import request
from views.todos import TodoCollection, Todo
from flask_cors import CORS
from flask_restful import Api
from flask import current_app
import logging
import sys 



app = Flask("stocks")
cors = CORS(app, resources={r"/api/*": {"origins": "*"}})
app.config['CORS_HEADERS'] = 'Content-Type'
api = Api(app, prefix="/api/v1")

api.add_resource(TodoCollection, '/scrape_starts')
api.add_resource(Todo, '/scrape_start/<todo_id>')

service = Service()

handler = logging.StreamHandler(sys.stdout)
handler.setFormatter(logging.Formatter(
    '%(asctime)s - %(name)s - %(levelname)s - %(message)s'))
app.logger.addHandler(handler)
app.logger.setLevel(logging.DEBUG)


@app.route('/api/v1/run_scrape', methods = ['POST'])
def start_scrape():
    data = json.loads(request.data)
    scrape_id = data['scrapeID']
    app.logger.debug("TESTING!")
    return service.start_scrape(scrape_id)

@app.route('/api/v1/health', methods = ['GET'])
def health_check():
    return json.dumps({'ok':True}), 200, {'ContentType':'application/json'}  
    
     

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
    return response

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
