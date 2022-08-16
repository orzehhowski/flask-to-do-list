from app import app
from app.forms import LoginForm, RegistrationForm
from flask import render_template, redirect
from flask_login import current_user, login_required, login_user, logout_user


# @login_required
@app.route('/')
@app.route('/index')
def index():
    return render_template('index.html')


@app.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        pass
    return render_template('login.html', form=form)


@app.route('/logout')
def logout():
    pass