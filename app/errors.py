from app import app
from flask import render_template
from werkzeug.exceptions import HTTPException

@app.errorhandler(HTTPException)
def handle_error(e):
    return render_template('error.html', e=e), e.code
