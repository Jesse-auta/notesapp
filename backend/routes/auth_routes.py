from flask import Blueprint, request, jsonify
from extensions import db
from models.user import User
from utils.auth_utils import hash_password, check_password
from flask_jwt_extended import create_access_token

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
def register():

    data = request.get_json(silent=True)

    if not data:
        return jsonify({"error": "Request body must be valid JSON"}), 400

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    # Check for missing fields
    missing = [field for field in ["name", "email", "password"] if not data.get(field)]
    if missing:
        return jsonify({"error": f"Missing required fields: {', '.join(missing)}"}), 400

    # Type checks
    if not isinstance(name, str) or not isinstance(email, str) or not isinstance(password, str):
        return jsonify({"error": "Name, email and password must all be strings"}), 400

    # Basic email format check
    if "@" not in email or "." not in email:
        return jsonify({"error": "Invalid email format"}), 400

    # Password strength
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400

    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({"error": "Email already registered"}), 409

    try:
        hashed_password = hash_password(password)

        user = User(
            name=name.strip(),
            email=email.strip().lower(),
            password_hash=hashed_password
        )

        db.session.add(user)
        db.session.commit()

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Something went wrong, please try again"}), 500

    return jsonify({"message": "User registered successfully"}), 201


@auth_bp.route("/login", methods=["POST"])
def login():

    data = request.get_json(silent=True)

    if not data:
        return jsonify({"error": "Request body must be valid JSON"}), 400

    email = data.get("email")
    password = data.get("password")

    # Check for missing fields
    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    # Type checks
    if not isinstance(email, str) or not isinstance(password, str):
        return jsonify({"error": "Email and password must be strings"}), 400

    try:
        user = User.query.filter_by(email=email.strip().lower()).first()

        if not user or not check_password(password, user.password_hash):
            return jsonify({"error": "Invalid credentials"}), 401

        access_token = create_access_token(identity=str(user.id))

    except Exception as e:
        return jsonify({"error": "Something went wrong, please try again"}), 500

    return jsonify({
        "token": access_token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email
        }
    }), 200