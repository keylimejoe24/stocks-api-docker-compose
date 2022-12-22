from flask import Flask
import json
from service import Service
from flask import request
from views.todos import TodoCollection, Todo
from flask_cors import CORS
from flask_restful import Api
from Logger import logger, LogLevel, TraceException
from flask import current_app

app = Flask(__name__)
cors = CORS(app, resources={r"/api/*": {"origins": "*"}})
app.config['CORS_HEADERS'] = 'Content-Type'
api = Api(app, prefix="/api/v1")

# all routes
api.add_resource(TodoCollection, '/scrape_starts')
api.add_resource(Todo, '/scrape_start/<todo_id>')

service = Service()
@app.route('/api/v1/run_scrape', methods = ['POST'])
def start_scrape():
    data = json.loads(request.data)
    scrape_id = data['scrapeID']
    return service.start_scrape(scrape_id)

@app.route('/api/v1/health', methods = ['GET'])
def start_scrape():
    return json.dumps({'ok':True}), 200, {'ContentType':'application/json'}  
    
     

# @app.after_request
# def after_request(response):
#     response.headers.add('Access-Control-Allow-Origin', '*')
#     response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
#     response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
#     return response

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
