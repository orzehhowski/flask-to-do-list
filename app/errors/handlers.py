from app.errors import bp
from flask import render_template
from werkzeug.exceptions import HTTPException

@bp.app_errorhandler(HTTPException)
def handle_error(e):
    return render_template('errors/error.html', e=e, title=f'{e.code} error'), e.code
