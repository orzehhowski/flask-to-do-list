from app import db
from app.auth import bp
from app.auth.forms import LoginForm, RegistrationForm
from flask import render_template, redirect, url_for
from flask_login import current_user, login_required, login_user, logout_user
from app.models import User, List


@bp.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('main.index'))
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(username=form.username.data).first()
        login_user(user, remember=form.remember_me.data)
        return redirect(url_for('main.index'))
    print(form.username.errors)
    return render_template('auth/login.html', form=form, title="ToDo List - login")


@bp.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('auth.login'))


@bp.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('main.index'))
    form = RegistrationForm()
    if form.validate_on_submit():
        user = User(username=form.username.data)
        user.set_password_hash(form.password.data)
        db.session.add(user)
        default_list = List(name='My list', author=user)
        db.session.add(default_list)
        db.session.commit()
        login_user(user)
        return redirect(url_for('main.index'))
    return render_template('auth/register.html', form=form, title='ToDo List - register')
