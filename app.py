from flask import Flask , session

def create_app():
    app = Flask(__name__)

    app.secret_key = 'super_secret_key'

    @app.before_request
    def set_default_user():
        if 'user' not in session:
            session['user'] = {
                "email": "Pilsecurity.CS01@pipelineinfra.com",
                "name": "PIL Security CS01"
            }


    from route import routes_bp
    app.register_blueprint(routes_bp)


    return app


if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)

