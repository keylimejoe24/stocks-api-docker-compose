from flask import request, jsonify
from flask_restful import Resource
from flask_restful.reqparse import RequestParser
from flask import current_app

import json
import logging

log = logging.getLogger('stocks.sub')

from models import todo

todo = todo.Todo()


parser = RequestParser()

parser.add_argument("id")


class TodoCollection(Resource):
    def get(self):
     	return jsonify(todo.find({}))

    def post(self):
        args = parser.parse_args()
        log.debug(args)
        response = todo.create({"id": args["id"],"tickers":args["tickers"]})
        return response, 201


class Todo(Resource):

    def get(self, todo_id):
        return jsonify(todo.find_by_id(todo_id))

    def put(self, todo_id):
        args = parser.parse_args()
        response = todo.update(
            todo_id, {"id": args["id"]})
        return response, 201

    def delete(self, todo_id):
        current_app.logger.info("HERE!")
        todo_remove = todo.find({"id":todo_id})
        current_app.logger.info(jsonify(todo_remove))
        current_app.logger.info(todo_remove)
        todo.delete(todo_remove[0]["_id"])
        return "Record Deleted", 204
