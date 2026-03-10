from flask import Flask, session, redirect, request
from utils.scheduler import start_scheduler
from dotenv import load_dotenv
import os

load_dotenv()

def create_app():

    app = Flask(__name__)
    app.secret_key = "super_secret_key"

    app.config['MAIL_APP_PASSWORD'] = os.getenv("MAIL_APP_PASSWORD")

    from route import routes_bp
    app.register_blueprint(routes_bp)


    @app.before_request
    def check_login():

        if request.endpoint in ["routes_bp.login", "static"]:
            return

        if request.path.startswith("/api"):
            return

        if "user" not in session:
            return redirect("/login")


    if os.environ.get("RUN_MAIN") == "true":
        start_scheduler()

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=5001, debug=True)