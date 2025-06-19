from flask import Flask
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from flask_cors import CORS
from config import Config

from models import db  # <<< buradan alıyoruz, başka yerde db tanımlamayın

def create_app():
    app = Flask(__name__, instance_relative_config=False)
    app.config.from_object(Config)

    # init extensions
    db.init_app(app)
    JWTManager(app)
    Migrate(app, db)
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # register routes
    from routes.auth import auth_bp
    from routes.transactions import transactions_bp
    from routes.recommendations import recommendations_bp
    from routes.prediction import prediction_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(transactions_bp, url_prefix='/api/transactions')
    app.register_blueprint(recommendations_bp, url_prefix='/api')
    app.register_blueprint(prediction_bp)  # eğer prediction_bp kendi prefix’ini içeriyorsa

    return app

if __name__ == "__main__":
    create_app().run(debug=True)
