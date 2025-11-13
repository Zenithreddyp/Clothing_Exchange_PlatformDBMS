from flask import Blueprint, request, jsonify
from config import conn
from middleware.auth_middleware import token_required

clothing_bp = Blueprint("clothing_bp", __name__)


@clothing_bp.route("/add_cloth", methods=["POST"])
@token_required
def addcloth():
    data = request.get_json()
    # Get user_id from token instead of request body
    user_id = request.current_user.get("user_id")
    title = data.get("title")
    description = data.get("description")
    category = data.get("category")  # ('Men', 'Women', 'Kids', 'Unisex')
    brand = data.get("brand")
    size = data.get("size")
    color = data.get("color")
    pickup_location = data.get("pickup_location")
    pickup_latitude = data.get("pickup_latitude")
    pickup_longitude = data.get("pickup_longitude")
    item_condition = data.get("item_condition")  # ('New', 'Gently Used', 'Worn')
    image_url = data.get("image_url")
    item_status = data.get("item_status", "Available")  # Default to 'Available'

    required_fields = ["title", "category", "item_condition"]
    for field in required_fields:
        if not data.get(field):
            return jsonify({"error": f"'{field}' is required"}), 400

    try:
        cursor = conn.cursor()

        query = """
        INSERT INTO clothing_items (
            user_id, title, description, category, brand, size, color,
            pickup_location, pickup_latitude, pickup_longitude,
            item_condition, image_url, item_status
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """

        values = (
            user_id,
            title,
            description,
            category,
            brand,
            size,
            color,
            pickup_location,
            pickup_latitude,
            pickup_longitude,
            item_condition,
            image_url,
            item_status,
        )

        cursor.execute(query, values)
        conn.commit()

        # Get the newly created item
        item_id = cursor.lastrowid
        cursor.close()

        return (
            jsonify(
                {"message": "Clothing item added successfully", "item_id": item_id}
            ),
            201,
        )

    except Exception as e:
        print(f"Error inserting clothing item: {e}")
        return jsonify({"error": "Database error", "details": str(e)}), 500


@clothing_bp.route("/update_cloth/<int:item_id>", methods=["PUT"])
@token_required
def update_cloth(item_id):
    data = request.get_json()
    user_id = request.current_user.get("user_id")

    allowed_fields = [
        "title",
        "description",
        "category",
        "brand",
        "size",
        "color",
        "pickup_location",
        "pickup_latitude",
        "pickup_longitude",
        "item_condition",
        "image_url",
        "item_status",
    ]

    update_data = {k: v for k, v in data.items() if k in allowed_fields}

    if not update_data:
        return jsonify({"error": "No valid fields to update"}), 400

    try:
        cursor = conn.cursor(dictionary=True)

        # First check if item exists and belongs to user
        cursor.execute(
            "SELECT user_id FROM clothing_items WHERE item_id = %s", (item_id,)
        )
        item = cursor.fetchone()

        if not item:
            cursor.close()
            return jsonify({"error": "Item not found"}), 404

        if item["user_id"] != user_id:
            cursor.close()
            return (
                jsonify({"error": "Unauthorized: You can only update your own items"}),
                403,
            )

        set_clause = ", ".join([f"{key} = %s" for key in update_data.keys()])
        values = list(update_data.values())

        query = f"""
        UPDATE clothing_items
        SET {set_clause}
        WHERE item_id = %s;
        """
        values.append(item_id)

        cursor.execute(query, values)
        conn.commit()
        cursor.close()

        return jsonify({"message": "Clothing item updated successfully"}), 200

    except Exception as e:
        print(f"Error updating clothing item: {e}")
        return jsonify({"error": "Database error", "details": str(e)}), 500


@clothing_bp.route("/cloth/<int:item_id>", methods=["GET"])
def get_cloth(item_id):
    """Get a single clothing item by ID (includes seller info)"""
    try:
        cursor = conn.cursor(dictionary=True)

        query = """
        SELECT 
            c.*,
            u.user_id AS seller_user_id,
            u.name AS seller_name,
            u.eco_points AS seller_eco_points
        FROM clothing_items c
        LEFT JOIN users u ON c.user_id = u.user_id
        WHERE c.item_id = %s
        """
        cursor.execute(query, (item_id,))
        item = cursor.fetchone()
        cursor.close()

        if not item:
            return jsonify({"error": "Item not found"}), 404

        return jsonify({"item": item}), 200

    except Exception as e:
        return jsonify({"error": "Database error", "details": str(e)}), 500


@clothing_bp.route("/clothes", methods=["GET"])
def get_clothes():
    """Get all clothing items with optional filters"""
    try:
        category = request.args.get("category")
        statuses = request.args.get("item_status")  # e.g. "exchange,donation"
        exclude_user = request.args.get("exclude_user", type=int)
        size = request.args.get("size")
        search = request.args.get("search")
        limit = request.args.get("limit", type=int)

        cursor = conn.cursor(dictionary=True)

        query = "SELECT * FROM clothing_items WHERE 1=1"
        params = []

        if category:
            query += " AND category = %s"
            params.append(category)

        if statuses:
            status_list = [s.strip() for s in statuses.split(",") if s.strip()]
            placeholders = ", ".join(["%s"] * len(status_list))
            query += f" AND item_status IN ({placeholders})"
            params.extend(status_list)

        if exclude_user is not None:
            query += " AND user_id != %s"
            params.append(exclude_user)

        if size:
            query += " AND size = %s"
            params.append(size)

        if search:
            query += " AND (title LIKE %s OR description LIKE %s)"
            like_term = f"%{search}%"
            params.extend([like_term, like_term])


        query += " ORDER BY item_id DESC"

        if limit:
            query += " LIMIT %s"
            params.append(limit)

        # print("Executing:", query, params)

        cursor.execute(query, params)
        items = cursor.fetchall()

        # print(items)

        return jsonify({"items": items, "count": len(items)}), 200

    except Exception as e:
        print("Unexpected error:", e)
        return jsonify({"error": "Unexpected error", "details": str(e)}), 500

    finally:
        if 'cursor' in locals() and cursor:
            cursor.close()




@clothing_bp.route("/cloth/<int:item_id>", methods=["DELETE"])
@token_required
def delete_cloth(item_id):
    """Delete a clothing item"""
    try:
        user_id = request.current_user.get("user_id")
        cursor = conn.cursor(dictionary=True)

        # Check if item exists and belongs to user
        cursor.execute(
            "SELECT user_id FROM clothing_items WHERE item_id = %s", (item_id,)
        )
        item = cursor.fetchone()

        if not item:
            cursor.close()
            return jsonify({"error": "Item not found"}), 404

        if item["user_id"] != user_id:
            cursor.close()
            return (
                jsonify({"error": "Unauthorized: You can only delete your own items"}),
                403,
            )

        cursor.execute("DELETE FROM clothing_items WHERE item_id = %s", (item_id,))
        conn.commit()
        cursor.close()

        return jsonify({"message": "Clothing item deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": "Database error", "details": str(e)}), 500
