from flask import Blueprint, request, jsonify
from app import db
from models import User
from flask_jwt_extended import create_access_token
from datetime import timedelta

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"msg": "No input data provided"}), 400

        first_name = data.get('first_name')
        last_name = data.get('last_name')
        email = data.get('email')
        password = data.get('password')

        if User.query.filter_by(email=email).first():
            return jsonify({"msg": "Email already registered"}), 400

        new_user = User(first_name=first_name, last_name=last_name, email=email)
        new_user.set_password(password)
        db.session.add(new_user)
        db.session.commit()

        return jsonify({"msg": "User registered successfully"}), 201

    except Exception as e:
        db.session.rollback()  # Hata durumunda işlemleri geri al
        print("Error during registration:", e)  # Konsola hata yazdır
        return jsonify({"msg": "Registration failed", "error": str(e)}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data:
        return jsonify({"msg": "No input data provided"}), 400
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()
    if user and user.check_password(password):
        access_token = create_access_token(identity=str(user.id), expires_delta=timedelta(hours=1))
        return jsonify({"token": access_token, "user": user.to_dict()}), 200
    else:
        return jsonify({"msg": "Invalid email or password"}), 401
