from app.api import bp 
from app import db
from flask import request
from flask_login import current_user, login_required
from app.models import List, Task
from flask_restful import Resource


class Lists(Resource):
    @login_required
    def post(self):
        if List.query.filter_by(author=current_user).count() > 21:
            return {'error': "You have reached lists limit!"}
        list_name = request.json['list_name']
        if not list_name:
            return {"error": "List name can't be empty!"}
        if len(list_name) > 32:
            return {'error': "This name is too long."}
        the_same_list = List.query.filter_by(author=current_user, name=list_name).first()
        if the_same_list:
            return {'error': "Lists can't have the same names!"}
        new_list = List(name=list_name, author=current_user)
        db.session.add(new_list)
        db.session.commit()
        return {}, 201

    @login_required
    def put(self):
        old_name = request.json['old_name']
        new_name = request.json['new_name']
        if not new_name:
            return {'error': "List name can't be empty!"}
        if len(new_name) > 32:
            return {'error': "This name is too long."}
        if new_name == old_name:
            return {}, 200
        the_same_list = List.query.filter_by(name=new_name, author=current_user).first()
        if the_same_list:
            return{'error': "Lists can't have the same names!"}
        list_to_edit = List.query.filter_by(name=old_name, author=current_user).first_or_404()
        list_to_edit.name = new_name
        db.session.commit()
        return {}, 200

    @login_required
    def delete(self):
        if List.query.filter_by(author=current_user).count() == 1:
           return {'error': "You can't delete your last list!"}
        list_name = request.json['list_name']
        to_delete = List.query.filter_by(name=list_name, author=current_user).first_or_404()
        db.session.delete(to_delete)
        db.session.commit()
        return {}, 200


class Tasks(Resource):
    @login_required
    def post(self):
        task_name = request.json['task_name']
        list_name = request.json['list_name']
        if not task_name:
            return {'error': "Task name can't be empty!"}
        if len(task_name) > 64:
            return {'error': "This name is too long."}
        active_list = List.query.filter_by(name=list_name, author=current_user).first_or_404()
        task = Task(name=task_name, parent_list=active_list)
        db.session.add(task)
        db.session.commit()
        return {}, 201
    
    @login_required
    def put(self):
        mark_as_done = request.json['mark_as_done']
        active_list_name = request.json['active_list']
        if mark_as_done:
            task_name = request.json['task_name']
            active_list = List.query.filter_by(name=active_list_name, author=current_user).first_or_404()
            task = Task.query.filter_by(name=task_name, parent_list=active_list).first_or_404()
            task.is_done = True
            db.session.commit()
            return {}, 200
        mark_as_undone = request.json['mark_as_undone']
        if mark_as_undone:
            task_name = request.json['task_name']
            active_list = List.query.filter_by(name=active_list_name, author=current_user).first_or_404()
            task = Task.query.filter_by(name=task_name, parent_list=active_list).first_or_404()
            task.is_done = False
            db.session.commit()
            return {}, 200
        old_name = request.json['old_name']
        new_name = request.json['new_name']
        if not new_name:
            return {'error': "Task can't be empty!"}
        if len(new_name) > 64:
            return {'error': "This task is too long."}
        if new_name == old_name:
            return {}, 200
        active_list = List.query.filter_by(name=active_list_name, author=current_user).first_or_404()
        task_to_edit = Task.query.filter_by(name=old_name, parent_list=active_list).first_or_404()
        task_to_edit.name = new_name
        db.session.commit()
        return {}, 200

    @login_required
    def delete(self):
        active_list_name = request.json['active_list']
        task_name = request.json['task_name']
        active_list = List.query.filter_by(name=active_list_name, author=current_user).first_or_404()
        task = Task.query.filter_by(name=task_name, parent_list=active_list).first_or_404()
        db.session.delete(task)
        db.session.commit()
        return {}, 200


class Display_list(Resource):
    @login_required
    def post(self):
        list_name = request.json['list_name']
        active_list = List.query.filter_by(author=current_user, name=list_name).first_or_404()
        tasks = [[task.name, task.is_done] for task in active_list.tasks]
        return {'tasks': tasks}