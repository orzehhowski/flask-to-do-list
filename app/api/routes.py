from app import db
from flask import request
from flask_login import current_user, login_required
from app.models import List, Task
from flask_restful import Resource
from app.api.errors import bad_request


class ListAPI(Resource):
    @login_required
    def get(self, id):
        active_list = List.query.get_or_404(int(id))
        tasks = [{'id':task.id, 'name':task.name, 'done':task.is_done} for task in active_list.tasks]
        return {'tasks': tasks}

    @login_required
    def post(self, id):
        if List.query.filter_by(author=current_user).count() > 21:
            return bad_request("You have reached lists limit!")
        list_name = request.json['list_name']
        if not list_name:
            return bad_request("List name can't be empty!")
        if len(list_name) > 32:
            return bad_request("This name is too long.")
        the_same_list = List.query.filter_by(author=current_user, name=list_name).first()
        if the_same_list:
            return bad_request("Lists can't have the same names!")
        new_list = List(name=list_name, author=current_user)
        db.session.add(new_list)
        db.session.commit()
        return {'id': new_list.id}, 201

    @login_required
    def put(self, id):
        old_name = request.json['old_name']
        new_name = request.json['new_name']
        if not new_name:
            return bad_request("List name can't be empty!")
        if len(new_name) > 32:
            return bad_request("This name is too long.")
        if new_name == old_name:
            return {}, 200
        the_same_list = List.query.filter_by(name=new_name, author=current_user).first()
        if the_same_list:
            return bad_request("Lists can't have the same names!")
        list_to_edit = List.query.get_or_404(int(id))
        list_to_edit.name = new_name
        db.session.commit()
        return {}, 200

    @login_required
    def delete(self, id):
        if List.query.filter_by(author=current_user).count() == 1:
           return bad_request("You can't delete your last list!")
        to_delete = List.query.get_or_404(int(id))
        db.session.delete(to_delete)
        db.session.commit()
        return {}, 200


class TaskAPI(Resource):
    @login_required
    def get(self, id):
        return Task.query.get_or_404(int(id))

    @login_required
    def post(self, id):
        task_name = request.json['task_name']
        list_id = request.json['list'][7:]
        if not task_name:
            return bad_request("Task name can't be empty!")
        if len(task_name) > 64:
            return bad_request("This name is too long.")
        active_list = List.query.get_or_404(list_id)
        task = Task(name=task_name, parent_list=active_list)
        db.session.add(task)
        db.session.commit()
        return {}, 201

    @login_required
    def put(self, id):
        mark_as_done = request.json['mark_as_done']
        if mark_as_done:
            task = Task.query.get_or_404(id)
            task.is_done = True
            db.session.commit()
            return {}, 200
        mark_as_undone = request.json['mark_as_undone']
        if mark_as_undone:
            task = Task.query.get_or_404(id)
            task.is_done = False
            db.session.commit()
            return {}, 200
        old_name = request.json['old_name']
        new_name = request.json['new_name']
        if not new_name:
            return bad_request("Task can't be empty!")
        if len(new_name) > 64:
            return bad_request("This task is too long.")
        if new_name == old_name:
            return {}, 200
        task = Task.query.get_or_404(id)
        task.name = new_name
        db.session.commit()
        return {}, 200

    @login_required
    def delete(self, id):
        task = Task.query.get_or_404(id)
        db.session.delete(task)
        db.session.commit()
        return {}, 200
