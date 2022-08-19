import json
from app import app, db
from app.forms import LoginForm, RegistrationForm
from flask import render_template, redirect, url_for, jsonify, request
from flask_login import current_user, login_required, login_user, logout_user
from app.models import User, List, Task


@app.route('/')
@app.route('/index')
@login_required
def index():
    lists = List.query.filter_by(author=current_user).order_by(-List.id)
    return render_template('index.html', lists=lists)


@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(username=form.username.data).first()
        login_user(user, remember=form.remember_me.data)
        return redirect(url_for('index'))
    print(form.username.errors)
    return render_template('login.html', form=form)


@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))


@app.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    form = RegistrationForm()
    if form.validate_on_submit():
        user = User(username=form.username.data)
        user.set_password_hash(form.password.data)
        db.session.add(user)
        default_list = List(name='My list', author=user)
        db.session.add(default_list)
        db.session.commit()
        login_user(user)
        return redirect(url_for('index'))
    return render_template('register.html', form=form)


@app.route('/add_list', methods=['POST'])
@login_required
def add_list():
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
    return jsonify({})


@app.route('/add_task', methods=['POST'])
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
    return jsonify({})


@app.route('/edit_list', methods=['POST'])
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
    return jsonify({})


@app.route('/edit_task', methods=['POST'])
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
        return jsonify({})
    active_list = List.query.filter_by(name=active_list_name, author=current_user).first_or_404()
    task_to_edit = Task.query.filter_by(name=old_name, parent_list=active_list).first_or_404()
    task_to_edit.name = new_name
    db.session.commit()
    return jsonify({})


@app.route('/delete_list', methods=['POST'])
@login_required
def delete_list():
    if List.query.filter_by(author=current_user).count() == 1:
        return jsonify({'error': "You can't delete your last list!"})
    list_name = request.json['list_name']
    to_delete = List.query.filter_by(name=list_name, author=current_user).first_or_404()
    db.session.delete(to_delete)
    db.session.commit()
    return jsonify({})


@app.route('/delete_task', methods=['POST'])
@login_required
def delete_task():
    active_list_name = request.json['active_list']
    task_name = request.json['task_name']
    active_list = List.query.filter_by(name=active_list_name, author=current_user).first_or_404()
    task = Task.query.filter_by(name=task_name, parent_list=active_list).first_or_404()
    db.session.delete(task)
    db.session.commit()
    return jsonify({})

@app.route('/mark_task_as_done', methods=['POST'])
@login_required
def mark_task_as_done():
    active_list_name = request.json['active_list']
    task_name = request.json['task_name']
    active_list = List.query.filter_by(name=active_list_name, author=current_user).first_or_404()
    task = Task.query.filter_by(name=task_name, parent_list=active_list).first_or_404()
    task.is_done = True
    db.session.commit()
    return jsonify({})


@app.route('/tasks', methods=['POST'])
@login_required
def tasks():
    list_name = request.json['list_name']
    active_list = List.query.filter_by(author=current_user, name=list_name).first_or_404()
    tasks = [[task.name, task.is_done] for task in active_list.tasks]
    return jsonify({'tasks': tasks})
