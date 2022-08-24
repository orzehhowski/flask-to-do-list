from app.main import bp
from flask import render_template
from flask_login import current_user, login_required
from app.models import List

@bp.route('/')
@bp.route('/index')
@login_required
def index():
    lists = List.query.filter_by(author=current_user).order_by(-List.id)
    return render_template('index.html', lists=lists, title='ToDo List')

