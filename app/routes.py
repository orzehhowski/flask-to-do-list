from msilib.schema import Error
from urllib import request
from app import app, db
from app.forms import LoginForm, RegistrationForm
from flask import render_template, redirect, url_for, jsonify, request
from flask_login import current_user, login_required, login_user, logout_user
from app.models import User, List, Task


@login_required
@app.route('/')
@app.route('/index')
def index():
    lists = List.query.filter_by(author=current_user).all()
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
        db.session.commit()
        login_user(user)
        return redirect(url_for('index'))
    return render_template('register.html', form=form)


@app.route('/add_list', methods=['POST'])
def add_list():
    list_name = request.json['list_name']
    if not list_name:
        return jsonify({'error': "List name can't be empty!"})
    if len(list_name) > 32:
        return jsonify({'error': "This name is too long."})
    users_lists = List.query.filter_by(author=current_user).all()
    lists_names = [l.name for l in users_lists]
    if list_name in lists_names:
        return jsonify({'error': "Lists can't have the same names!"})
    new_list = List(name=list_name, author=current_user)
    db.session.add(new_list)
    db.session.commit()
    return jsonify({})


