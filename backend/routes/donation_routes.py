from flask import Blueprint, request, jsonify
from config import conn
from middleware.auth_middleware import token_required

donation_bp = Blueprint("donation_bp", __name__)


@donation_bp.route("/donations", methods=["GET"])
@token_required
def get_donations():
    """Get all donations for the current user"""
    try:
        user_id = request.current_user.get("user_id")
        cursor = conn.cursor(dictionary=True)
        
        query = """
        SELECT d.donation_id, d.item_id, d.recipient, d.donation_date,
               ci.title, ci.description, ci.category, ci.image_url,
               ci.item_condition
        FROM donation d
        JOIN clothing_items ci ON d.item_id = ci.item_id
        WHERE d.donor_id = %s
        ORDER BY d.donation_date DESC
        """
        
        cursor.execute(query, (user_id,))
        donations = cursor.fetchall()
        cursor.close()

        # Format response for frontend
        formatted_donations = []
        for donation in donations:
            formatted_donations.append({
                "id": donation["donation_id"],
                "item_id": donation["item_id"],
                "title": donation["title"],
                "description": donation["description"],
                "category": donation["category"],
                "recipient": donation["recipient"],
                "donation_date": donation["donation_date"].isoformat() if donation["donation_date"] else None,
                "image_url": donation["image_url"],
                "item_condition": donation["item_condition"]
            })

        return jsonify({"donations": formatted_donations}), 200
    except Exception as e:
        return jsonify({"error": "Database error", "details": str(e)}), 500


@donation_bp.route("/donations", methods=["POST"])
@token_required
def create_donation():
    """Create a new donation"""
    try:
        user_id = request.current_user.get("user_id")
        data = request.get_json()
        
        # Accept both 'title' (for frontend compatibility) and 'item_id'
        item_id = data.get("item_id")
        recipient = data.get("recipient", "")
        
        # If title is provided, try to find item by title (for backward compatibility)
        if not item_id and data.get("title"):
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                "SELECT item_id FROM clothing_items WHERE title = %s AND user_id = %s AND item_status != 'Donated' LIMIT 1",
                (data.get("title"), user_id)
            )
            item = cursor.fetchone()
            if item:
                item_id = item["item_id"]
            cursor.close()
        
        if not item_id:
            return jsonify({"error": "item_id is required"}), 400

        cursor = conn.cursor(dictionary=True)
        
        # Check if item exists and belongs to user
        cursor.execute(
            "SELECT item_id, item_status FROM clothing_items WHERE item_id = %s AND user_id = %s",
            (item_id, user_id)
        )
        item = cursor.fetchone()
        
        if not item:
            cursor.close()
            return jsonify({"error": "Item not found or you don't have permission to donate this item"}), 404
        
        if item["item_status"] == "Donated":
            cursor.close()
            return jsonify({"error": "Item has already been donated"}), 400

        # Create donation
        cursor.execute(
            """
            INSERT INTO donation (donor_id, item_id, recipient, donation_date)
            VALUES (%s, %s, %s, NOW())
            """,
            (user_id, item_id, recipient)
        )
        donation_id = cursor.lastrowid
        
        # Update item status to 'Donated'
        cursor.execute(
            "UPDATE clothing_items SET item_status = 'Donated' WHERE item_id = %s",
            (item_id,)
        )
        
        # Award eco points for donation
        points = 50  # Points for donation
        cursor.execute(
            """
            INSERT INTO eco_point_transaction 
            (user_id, transaction_type, donation_id, points, reason, transaction_date)
            VALUES (%s, 'Earn', %s, %s, 'Donation', NOW())
            """,
            (user_id, donation_id, points)
        )
        
        # Update user's eco_points
        cursor.execute(
            "UPDATE users SET eco_points = eco_points + %s WHERE user_id = %s",
            (points, user_id)
        )
        
        conn.commit()
        cursor.close()

        return jsonify({
            "message": "Donation created successfully",
            "donation_id": donation_id,
            "points_earned": points
        }), 201
    except Exception as e:
        return jsonify({"error": "Database error", "details": str(e)}), 500


@donation_bp.route("/donations/<int:donation_id>", methods=["GET"])
@token_required
def get_donation(donation_id):
    """Get a specific donation by ID"""
    try:
        user_id = request.current_user.get("user_id")
        cursor = conn.cursor(dictionary=True)
        
        query = """
        SELECT d.donation_id, d.item_id, d.recipient, d.donation_date,
               ci.title, ci.description, ci.category, ci.image_url,
               ci.item_condition, ci.brand, ci.size, ci.color
        FROM donation d
        JOIN clothing_items ci ON d.item_id = ci.item_id
        WHERE d.donation_id = %s AND d.donor_id = %s
        """
        
        cursor.execute(query, (donation_id, user_id))
        donation = cursor.fetchone()
        cursor.close()

        if not donation:
            return jsonify({"error": "Donation not found"}), 404

        return jsonify({
            "id": donation["donation_id"],
            "item_id": donation["item_id"],
            "title": donation["title"],
            "description": donation["description"],
            "category": donation["category"],
            "recipient": donation["recipient"],
            "donation_date": donation["donation_date"].isoformat() if donation["donation_date"] else None,
            "image_url": donation["image_url"],
            "item_condition": donation["item_condition"],
            "brand": donation["brand"],
            "size": donation["size"],
            "color": donation["color"]
        }), 200
    except Exception as e:
        return jsonify({"error": "Database error", "details": str(e)}), 500

