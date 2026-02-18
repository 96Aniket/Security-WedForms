from flask import Flask, session
from utils.scheduler import start_scheduler
from dotenv import load_dotenv
import os

def create_app():
    app = Flask(__name__)
    app.secret_key = 'super_secret_key'

    app.config['MAIL_APP_PASSWORD'] = os.getenv("MAIL_APP_PASSWORD")

    @app.before_request
    def set_default_user():

        email = "Pilsecurity.CS04@pipelineinfra.com"

        username_part = email.split('@')[0]
        location = username_part.split('.')[-1].upper()
        name_part = username_part.replace(f".{location}", "")
        name = name_part.replace('.', ' ').title()

        if email.lower() == "admin@pipelineinfra.com":
            role = "admin"
        else:
            role = "user"

        session['user'] = {
            "email": email,
            "name": name,
            "location": location,
            "role": role
        }

    from route import routes_bp
    app.register_blueprint(routes_bp)
    
    if os.environ.get("RUN_MAIN") == "true":
        start_scheduler()


    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5001, debug=True)
