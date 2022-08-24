from app import db
from app.main import bp
from flask import render_template, jsonify, request
from flask_login import current_user, login_required
from app.models import List, Task
from flask_restful import Resource


# @bp.route('/')
# @bp.route('/index')
class Index(Resource):
    @login_required
    def get(self):
        lists = List.query.filter_by(author=current_user).order_by(-List.id)
        return render_template('index.html', lists=lists, title='ToDo List')


@bp.route('/add-list', methods=['POST'])
@login_required
def add_list():
    if List.query.filter_by(author=current_user).count() > 21:
        return jsonify({'error': "You have reached lists limit!"})
    list_name = request.json['list_name']
    if not list_name:
        return jsonify({'error': "List name can't be empty!"})
    if len(list_name) > 32:
        return jsonify({'error': "This name is too long."})
    the_same_list = List.query.filter_by(author=current_user, name=list_name).first()
    if the_same_list:
        return jsonify({'error': "Lists can't have the same names!"})
    new_list = List(name=list_name, author=current_user)
    db.session.add(new_list)
    db.session.commit()
    return 200


@bp.route('/add-task', methods=['POST'])
@login_required
def add_task():
    task_name = request.json['task_name']
    list_name = request.json['list_name']
    if not task_name:
        return jsonify({'error': "Task name can't be empty!"})
    if len(task_name) > 64:
        return jsonify({'error': "This name is too long."})
    active_list = List.query.filter_by(name=list_name, author=current_user).first_or_404()
    task = Task(name=task_name, parent_list=active_list)
    db.session.add(task)
    db.session.commit()
    return 200


@bp.route('/edit-list', methods=['POST'])
@login_required
def edit_list():
    old_name = request.json['old_name']
    new_name = request.json['new_name']
    if not new_name:
        return jsonify({'error': "List name can't be empty!"})
    if len(new_name) > 32:
        return jsonify({'error': "This name is too long."})
    if new_name == old_name:
        return jsonify({})
    the_same_list = List.query.filter_by(name=new_name, author=current_user).first()
    if the_same_list:
        return jsonify({'error': "Lists can't have the same names!"})
    list_to_edit = List.query.filter_by(name=old_name, author=current_user).first_or_404()
    list_to_edit.name = new_name
    db.session.commit()
    return 200


@bp.route('/edit-task', methods=['POST'])
@login_required
def edit_task():
    old_name = request.json['old_name']
    new_name = request.json['new_name']
    active_list_name = request.json['active_list']
    if not new_name:
        return jsonify({'error': "Task can't be empty!"})
    if len(new_name) > 64:
        return jsonify({'error': "This task is too long."})
    if new_name == old_name:
        return 200
    active_list = List.query.filter_by(name=active_list_name, author=current_user).first_or_404()
    task_to_edit = Task.query.filter_by(name=old_name, parent_list=active_list).first_or_404()
    task_to_edit.name = new_name
    db.session.commit()
    return 200


@bp.route('/delete-list', methods=['POST'])
@login_required
def delete_list():
    if List.query.filter_by(author=current_user).count() == 1:
        return jsonify({'error': "You can't delete your last list!"})
    list_name = request.json['list_name']
    to_delete = List.query.filter_by(name=list_name, author=current_user).first_or_404()
    db.session.delete(to_delete)
    db.session.commit()
    return 200


@bp.route('/delete-task', methods=['POST'])
@login_required
def delete_task():
    active_list_name = request.json['active_list']
    task_name = request.json['task_name']
    active_list = List.query.filter_by(name=active_list_name, author=current_user).first_or_404()
    task = Task.query.filter_by(name=task_name, parent_list=active_list).first_or_404()
    db.session.delete(task)
    db.session.commit()
    return 200

@bp.route('/mark-task-as-done', methods=['POST'])
@login_required
def mark_task_as_done():
    active_list_name = request.json['active_list']
    task_name = request.json['task_name']
    active_list = List.query.filter_by(name=active_list_name, author=current_user).first_or_404()
    task = Task.query.filter_by(name=task_name, parent_list=active_list).first_or_404()
    task.is_done = True
    db.session.commit()
    return 200


@bp.route('/mark-task-as-undone', methods=['POST'])
@login_required
def mark_task_as_undone():
    active_list_name = request.json['active_list']
    task_name = request.json['task_name']
    active_list = List.query.filter_by(name=active_list_name, author=current_user).first_or_404()
    task = Task.query.filter_by(name=task_name, parent_list=active_list).first_or_404()
    task.is_done = False
    db.session.commit()
    return 200


@bp.route('/tasks', methods=['POST'])
@login_required
def tasks():
    list_name = request.json['list_name']
    active_list = List.query.filter_by(author=current_user, name=list_name).first_or_404()
    tasks = [[task.name, task.is_done] for task in active_list.tasks]
    return jsonify({'tasks': tasks})
