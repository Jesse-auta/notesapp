from flask import Flask
from config import Config
from extensions import db, migrate, jwt, cors
from routes.auth_routes import auth_bp
from routes.note_routes import note_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    cors.init_app(app)

    #ALl BLUEPRINTS SHOULD COME UNDER HERE
    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(note_bp, url_prefix="/notes")

    from models.user import User
    from models.note import Note

    return app

app = create_app()

if __name__ == "__main__":
    app.run(debug=True)
