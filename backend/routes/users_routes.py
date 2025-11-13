from flask import Blueprint, request, jsonify
from flask_bcrypt import Bcrypt
from config import conn
from utils.jwt_utils import generate_access_token, generate_refresh_token, verify_token
from middleware.auth_middleware import token_required
import re


bcrypt = Bcrypt()

users_bp = Blueprint("users_bp", __name__)


@users_bp.route("/register", methods=["POST"])
def register():
    try:
        data = request.get_json()
        name = data.get("name")
        email = data.get("email")
        password = data.get("password")
        phone = data.get("phone")

        if not name or not email or not password:
            return jsonify({"error": "Name, email, and password are required"}), 400

        # Check if user already exists
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        existing_user = cursor.fetchone()

        if existing_user:
            cursor.close()
            return jsonify({"error": "User with this email already exists"}), 400

        hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")

        cursor.execute(
            """
            INSERT INTO users (name, email, password, phone)
            VALUES (%s, %s, %s, %s)
        """,
            (name, email, hashed_password, phone),
        )
        conn.commit()

        # Get the newly created user
        user_id = cursor.lastrowid
        cursor.execute("SELECT * FROM users WHERE user_id = %s", (user_id,))
        user = cursor.fetchone()
        cursor.close()

        # Generate tokens
        access_token = generate_access_token(user["user_id"], user["email"])
        refresh_token = generate_refresh_token(user["user_id"], user["email"])

        return (
            jsonify(
                {
                    "message": "User registered successfully",
                    "access_token": access_token,
                    "refresh_token": refresh_token,
                    "user": {
                        "user_id": user["user_id"],
                        "name": user["name"],
                        "email": user["email"],
                        "phone": user["phone"],
                        "eco_points": user.get("eco_points", 0),
                    },
                }
            ),
            201,
        )
    except Exception as e:
        return jsonify({"error": "Registration failed", "details": str(e)}), 500


@users_bp.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json()
        # Accept both 'email' and 'loginId' for flexibility
        login_id = data.get("email") or data.get("loginId")
        password = data.get("password")

        if not login_id or not password:
            return jsonify({"error": "Missing login credentials"}), 400

        cursor = conn.cursor(dictionary=True)

        # Check if login_id is an email or phone
        if re.match(r"[^@]+@[^@]+\.[^@]+", login_id):
            query = "SELECT * FROM users WHERE email = %s"
        else:
            query = "SELECT * FROM users WHERE phone = %s"

        cursor.execute(query, (login_id,))
        user = cursor.fetchone()
        cursor.close()

        if not user:
            return jsonify({"error": "User not found"}), 404

        if not bcrypt.check_password_hash(user["password"], password):
            return jsonify({"error": "Invalid password"}), 401

        # Generate tokens
        access_token = generate_access_token(user["user_id"], user["email"])
        refresh_token = generate_refresh_token(user["user_id"], user["email"])

        return (
            jsonify(
                {
                    "message": "Login successful",
                    "access_token": access_token,
                    "refresh_token": refresh_token,
                    "token": access_token,  # Keep for backward compatibility
                    "user": {
                        "user_id": user["user_id"],
                        "name": user["name"],
                        "email": user["email"],
                        "phone": user["phone"],
                        "eco_points": user.get("eco_points", 0),
                    },
                    "eco_points": user.get(
                        "eco_points", 0
                    ),  # Also include at top level for frontend
                }
            ),
            200,
        )
    except Exception as e:
        return jsonify({"error": "Login failed", "details": str(e)}), 500


@users_bp.route("/refresh", methods=["POST"])
def refresh():
    """Refresh access token using refresh token"""
    try:
        data = request.get_json()
        refresh_token = data.get("refresh_token")

        if not refresh_token:
            return jsonify({"error": "Refresh token is required"}), 400

        # Verify refresh token
        payload = verify_token(refresh_token, token_type="refresh")
        if not payload:
            return jsonify({"error": "Invalid or expired refresh token"}), 401

        # Get user from database
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            "SELECT * FROM users WHERE user_id = %s", (payload.get("user_id"),)
        )
        user = cursor.fetchone()
        cursor.close()

        if not user:
            return jsonify({"error": "User not found"}), 404

        # Generate new access token
        access_token = generate_access_token(user["user_id"], user["email"])

        return (
            jsonify(
                {
                    "access_token": access_token,
                    "token": access_token,  # Keep for backward compatibility
                }
            ),
            200,
        )
    except Exception as e:
        return jsonify({"error": "Token refresh failed", "details": str(e)}), 500


@users_bp.route("/me", methods=["GET"])
@token_required
def get_current_user():
    """Get current user information from token"""
    user_id = request.current_user.get("user_id")
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        "SELECT user_id, name, email, phone, eco_points FROM users WHERE user_id = %s",
        (user_id,),
    )
    user = cursor.fetchone()
    cursor.close()

    if not user:
        return jsonify({"error": "User not found"}), 404

    return (
        jsonify(
            {
                "user": {
                    "user_id": user["user_id"],
                    "name": user["name"],
                    "email": user["email"],
                    "phone": user["phone"],
                    "eco_points": user.get("eco_points", 0),
                }
            }
        ),
        200,
    )


@users_bp.route("/user/<int:user_id>", methods=["GET"])
def get_user_by_id(user_id):
    try:
        cursor = conn.cursor(
            dictionary=True, buffered=True
        )  # ✅ buffered fixes “commands out of sync”

        # 1️⃣ Get user details
        cursor.execute(
            """
            SELECT user_id, name, email, phone, eco_points
            FROM users
            WHERE user_id = %s
        """,
            (user_id,),
        )
        user = cursor.fetchone()

        if not user:
            cursor.close()
            return jsonify({"error": "User not found"}), 404

        # ✅ Create a *new* cursor for the next query
        cursor2 = conn.cursor(dictionary=True, buffered=True)
        cursor2.execute(
            """
                SELECT 
                    item_id,
                    title,
                    description,
                    category,
                    brand,
                    size,
                    item_condition,
                    cost,
                    image_url
                FROM clothing_items
                WHERE user_id = %s
                ORDER BY item_id DESC  -- use item_id instead if you want newest first
            """,
            (user_id,),
        )
        items = cursor2.fetchall()

        cursor.close()
        cursor2.close()

        return (
            jsonify(
                {
                    "user": {
                        "user_id": user["user_id"],
                        "name": user["name"],
                        "email": user["email"],
                        "phone": user.get("phone"),
                        "eco_points": user.get("eco_points", 0),
                        "items": items or [],
                    }
                }
            ),
            200,
        )

    except Exception as e:
        import traceback

        print(traceback.format_exc())
        return jsonify({"error": "Failed to load user", "details": str(e)}), 500





@users_bp.route("user/my-items", methods=["GET"])
@token_required
def get_my_items():
    """
    Return all clothing items belonging to the currently authenticated user
    where item_status = 'available'.
    """
    try:
        user_id = request.current_user.get("user_id")

        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT 
                item_id,
                title,
                description,
                category,
                brand,
                size,
                item_condition,
                cost,
                image_url,
                item_status
            FROM clothing_items
            WHERE user_id = %s AND item_status = 'available'
            ORDER BY item_id DESC
            """,
            (user_id,),
        )
        items = cursor.fetchall()
        cursor.close()

        return jsonify({"items": items or []}), 200

    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return jsonify({"error": "Failed to load your items", "details": str(e)}), 500
