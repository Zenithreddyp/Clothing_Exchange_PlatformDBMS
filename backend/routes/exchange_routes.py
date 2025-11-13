from flask import Blueprint, request, jsonify
from config import conn
from middleware.auth_middleware import token_required

exchange_bp = Blueprint("exchange_bp", __name__)


@exchange_bp.route("/exchange", methods=["GET"])
@token_required
def get_exchange_requests():
    """Get exchange requests (both sent and received)"""
    try:
        user_id = request.current_user.get("user_id")
        filter_type = request.args.get("filter", "all")  # all, sent, received
        
        cursor = conn.cursor(dictionary=True)
        
        if filter_type == "sent":
            # Only requests sent by current user
            query = """
            SELECT er.exchange_id, er.requester_id, er.owner_id, er.requested_item_id,
                   er.offered_item_id, er.offerd_points, er.exchange_status,
                   er.request_date, er.approval_date,
                   req_item.title as requested_title, req_item.image_url as requested_image,
                   req_item.category as requested_category,
                   off_item.title as offered_title, off_item.image_url as offered_image,
                   off_item.category as offered_category,
                   owner.name as owner_name, requester.name as requester_name
            FROM exchangerequest er
            LEFT JOIN clothing_items req_item ON er.requested_item_id = req_item.item_id
            LEFT JOIN clothing_items off_item ON er.offered_item_id = off_item.item_id
            LEFT JOIN users owner ON er.owner_id = owner.user_id
            LEFT JOIN users requester ON er.requester_id = requester.user_id
            WHERE er.requester_id = %s
            ORDER BY er.request_date DESC
            """
            cursor.execute(query, (user_id,))
        elif filter_type == "received":
            # Only requests received by current user
            query = """
            SELECT er.exchange_id, er.requester_id, er.owner_id, er.requested_item_id,
                   er.offered_item_id, er.offerd_points, er.exchange_status,
                   er.request_date, er.approval_date,
                   req_item.title as requested_title, req_item.image_url as requested_image,
                   req_item.category as requested_category,
                   off_item.title as offered_title, off_item.image_url as offered_image,
                   off_item.category as offered_category,
                   owner.name as owner_name, requester.name as requester_name
            FROM exchangerequest er
            LEFT JOIN clothing_items req_item ON er.requested_item_id = req_item.item_id
            LEFT JOIN clothing_items off_item ON er.offered_item_id = off_item.item_id
            LEFT JOIN users owner ON er.owner_id = owner.user_id
            LEFT JOIN users requester ON er.requester_id = requester.user_id
            WHERE er.owner_id = %s
            ORDER BY er.request_date DESC
            """
            cursor.execute(query, (user_id,))
        else:
            # All requests (sent or received)
            query = """
            SELECT er.exchange_id, er.requester_id, er.owner_id, er.requested_item_id,
                   er.offered_item_id, er.offerd_points, er.exchange_status,
                   er.request_date, er.approval_date,
                   req_item.title as requested_title, req_item.image_url as requested_image,
                   req_item.category as requested_category,
                   off_item.title as offered_title, off_item.image_url as offered_image,
                   off_item.category as offered_category,
                   owner.name as owner_name, requester.name as requester_name
            FROM exchangerequest er
            LEFT JOIN clothing_items req_item ON er.requested_item_id = req_item.item_id
            LEFT JOIN clothing_items off_item ON er.offered_item_id = off_item.item_id
            LEFT JOIN users owner ON er.owner_id = owner.user_id
            LEFT JOIN users requester ON er.requester_id = requester.user_id
            WHERE er.requester_id = %s OR er.owner_id = %s
            ORDER BY er.request_date DESC
            """
            cursor.execute(query, (user_id, user_id))
        
        requests = cursor.fetchall()
        cursor.close()

        # Format for frontend
        formatted_requests = []
        for req in requests:
            formatted_requests.append({
                "id": req["exchange_id"],
                "requester_id": req["requester_id"],
                "owner_id": req["owner_id"],
                "requester_name": req["requester_name"],
                "owner_name": req["owner_name"],
                "requested_item_id": req["requested_item_id"],
                "requested_title": req["requested_title"],
                "requested_image": req["requested_image"],
                "requested_category": req["requested_category"],
                "offered_item_id": req["offered_item_id"],
                "offered_title": req["offered_title"],
                "offered_image": req["offered_image"],
                "offered_category": req["offered_category"],
                "offered_points": req["offerd_points"],
                "status": req["exchange_status"],
                "request_date": req["request_date"].isoformat() if req["request_date"] else None,
                "approval_date": req["approval_date"].isoformat() if req["approval_date"] else None,
                "is_sent": req["requester_id"] == user_id
            })

        return jsonify({"requests": formatted_requests}), 200
    except Exception as e:
        return jsonify({"error": "Database error", "details": str(e)}), 500


@exchange_bp.route("/exchange", methods=["POST"])
@token_required
def create_exchange_request():
    """Create a new exchange request"""
    try:
        requester_id = request.current_user.get("user_id")
        data = request.get_json()
        
        requested_item_id = data.get("requested_item_id")
        offered_item_id = data.get("offered_item_id")
        offered_points = data.get("offered_points")
        
        if not requested_item_id:
            return jsonify({"error": "requested_item_id is required"}), 400
        
        if not offered_item_id and not offered_points:
            return jsonify({"error": "Either offered_item_id or offered_points is required"}), 400

        cursor = conn.cursor(dictionary=True)
        
        # Check if requested item exists and is available
        cursor.execute(
            """
            SELECT user_id, item_status, title
            FROM clothing_items
            WHERE item_id = %s AND item_status = 'Available'
            """,
            (requested_item_id,)
        )
        requested_item = cursor.fetchone()
        
        if not requested_item:
            cursor.close()
            return jsonify({"error": "Requested item not found or not available"}), 404
        
        owner_id = requested_item["user_id"]
        
        if owner_id == requester_id:
            cursor.close()
            return jsonify({"error": "You cannot request your own item"}), 400
        
        # Check if offered item exists and belongs to requester (if provided)
        if offered_item_id:
            cursor.execute(
                """
                SELECT user_id, item_status
                FROM clothing_items
                WHERE item_id = %s
                """,
                (offered_item_id,)
            )
            offered_item = cursor.fetchone()
            
            if not offered_item:
                cursor.close()
                return jsonify({"error": "Offered item not found"}), 404
            
            if offered_item["user_id"] != requester_id:
                cursor.close()
                return jsonify({"error": "You can only offer your own items"}), 403
            
            if offered_item["item_status"] != "Available":
                cursor.close()
                return jsonify({"error": "Offered item is not available"}), 400
        
        # Check if requester has enough points (if offering points)
        if offered_points and offered_points > 0:
            cursor.execute("SELECT eco_points FROM users WHERE user_id = %s", (requester_id,))
            user = cursor.fetchone()
            if user["eco_points"] < offered_points:
                cursor.close()
                return jsonify({"error": "Insufficient eco points"}), 400
        
        # Check for existing pending request
        cursor.execute(
            """
            SELECT exchange_id FROM exchangerequest
            WHERE requester_id = %s AND requested_item_id = %s AND exchange_status = 'Pending'
            """,
            (requester_id, requested_item_id)
        )
        existing = cursor.fetchone()
        if existing:
            cursor.close()
            return jsonify({"error": "You already have a pending request for this item"}), 400
        
        # Create exchange request
        cursor.execute(
            """
            INSERT INTO exchangerequest
            (requester_id, owner_id, requested_item_id, offered_item_id, offerd_points,
             exchange_status, request_date)
            VALUES (%s, %s, %s, %s, %s, 'Pending', NOW())
            """,
            (requester_id, owner_id, requested_item_id, offered_item_id, offered_points)
        )
        exchange_id = cursor.lastrowid
        conn.commit()
        cursor.close()

        return jsonify({
            "message": "Exchange request created successfully",
            "exchange_id": exchange_id
        }), 201
    except Exception as e:
        return jsonify({"error": "Database error", "details": str(e)}), 500


@exchange_bp.route("/exchange/<int:exchange_id>/accept", methods=["POST"])
@token_required
def accept_exchange(exchange_id):
    """Accept an exchange request"""
    try:
        user_id = request.current_user.get("user_id")
        
        cursor = conn.cursor(dictionary=True)
        
        # Get exchange request with item costs
        cursor.execute(
            """
            SELECT er.*, 
                   req_item.user_id as requested_item_owner,
                   req_item.cost as requested_item_cost,
                   off_item.cost as offered_item_cost
            FROM exchangerequest er
            JOIN clothing_items req_item ON er.requested_item_id = req_item.item_id
            LEFT JOIN clothing_items off_item ON er.offered_item_id = off_item.item_id
            WHERE er.exchange_id = %s
            """,
            (exchange_id,)
        )
        exchange = cursor.fetchone()
        
        if not exchange:
            cursor.close()
            return jsonify({"error": "Exchange request not found"}), 404
        
        # Check if user is the owner of the requested item
        if exchange["owner_id"] != user_id:
            cursor.close()
            return jsonify({"error": "Unauthorized: You can only accept requests for your own items"}), 403
        
        if exchange["exchange_status"] != "Pending":
            cursor.close()
            return jsonify({"error": f"Exchange request is already {exchange['exchange_status']}"}), 400
        
        # Update exchange status
        cursor.execute(
            """
            UPDATE exchangerequest
            SET exchange_status = 'Accepted', approval_date = NOW()
            WHERE exchange_id = %s
            """,
            (exchange_id,)
        )
        
        # Update item statuses to 'Exchanged' when exchange is accepted
        cursor.execute(
            "UPDATE clothing_items SET item_status = 'Exchanged' WHERE item_id = %s",
            (exchange["requested_item_id"],)
        )
        
        if exchange["offered_item_id"]:
            cursor.execute(
                "UPDATE clothing_items SET item_status = 'Exchanged' WHERE item_id = %s",
                (exchange["offered_item_id"],)
            )
        
        # Handle eco points if offered
        if exchange["offerd_points"] and exchange["offerd_points"] > 0:
            # Deduct points from requester
            cursor.execute(
                "UPDATE users SET eco_points = eco_points - %s WHERE user_id = %s",
                (exchange["offerd_points"], exchange["requester_id"])
            )
            
            # Add points to owner
            cursor.execute(
                "UPDATE users SET eco_points = eco_points + %s WHERE user_id = %s",
                (exchange["offerd_points"], exchange["owner_id"])
            )
            
            # Record transaction for requester (spend)
            cursor.execute(
                """
                INSERT INTO eco_point_transaction
                (user_id, transaction_type, exchange_id, points, reason, transaction_date)
                VALUES (%s, 'Spend', %s, %s, 'Exchange', NOW())
                """,
                (exchange["requester_id"], exchange_id, exchange["offerd_points"])
            )
            
            # Record transaction for owner (earn)
            cursor.execute(
                """
                INSERT INTO eco_point_transaction
                (user_id, transaction_type, exchange_id, points, reason, transaction_date)
                VALUES (%s, 'Earn', %s, %s, 'Exchange', NOW())
                """,
                (exchange["owner_id"], exchange_id, exchange["offerd_points"])
            )
        
        # Calculate bonus points: 10% of the total exchange value
        requested_cost = exchange.get("requested_item_cost") or 0
        offered_cost = exchange.get("offered_item_cost") or 0
        offered_points_value = exchange.get("offerd_points") or 0
        
        # Total value includes both item costs and any points offered
        total_value = requested_cost + offered_cost + offered_points_value
        
        # Calculate 10% bonus (minimum 1 point if there's any value)
        if total_value > 0:
            bonus_points = max(1, int(total_value * 0.10))  # 10% of total value, minimum 1 point
        else:
            bonus_points = 0  # No bonus if items have no value
        
        # Award bonus points to both users
        if bonus_points > 0:
            cursor.execute(
                "UPDATE users SET eco_points = eco_points + %s WHERE user_id = %s",
                (bonus_points, exchange["requester_id"])
            )
            cursor.execute(
                "UPDATE users SET eco_points = eco_points + %s WHERE user_id = %s",
                (bonus_points, exchange["owner_id"])
            )
            
            # Record eco point transactions for bonus
            cursor.execute(
                """
                INSERT INTO eco_point_transaction
                (user_id, transaction_type, exchange_id, points, reason, transaction_date)
                VALUES (%s, 'Earn', %s, %s, 'Exchange Bonus (10% of value)', NOW())
                """,
                (exchange["requester_id"], exchange_id, bonus_points)
            )
            cursor.execute(
                """
                INSERT INTO eco_point_transaction
                (user_id, transaction_type, exchange_id, points, reason, transaction_date)
                VALUES (%s, 'Earn', %s, %s, 'Exchange Bonus (10% of value)', NOW())
                """,
                (exchange["owner_id"], exchange_id, bonus_points)
            )
        
        conn.commit()
        cursor.close()

        return jsonify({
            "message": "Exchange request accepted successfully",
            "bonus_points": bonus_points,
            "total_exchange_value": total_value
        }), 200
    except Exception as e:
        return jsonify({"error": "Database error", "details": str(e)}), 500


@exchange_bp.route("/exchange/<int:exchange_id>/reject", methods=["POST"])
@token_required
def reject_exchange(exchange_id):
    """Reject an exchange request"""
    try:
        user_id = request.current_user.get("user_id")
        
        cursor = conn.cursor(dictionary=True)
        
        # Get exchange request
        cursor.execute(
            "SELECT * FROM exchangerequest WHERE exchange_id = %s",
            (exchange_id,)
        )
        exchange = cursor.fetchone()
        
        if not exchange:
            cursor.close()
            return jsonify({"error": "Exchange request not found"}), 404
        
        # Check if user is the owner of the requested item
        if exchange["owner_id"] != user_id:
            cursor.close()
            return jsonify({"error": "Unauthorized: You can only reject requests for your own items"}), 403
        
        if exchange["exchange_status"] != "Pending":
            cursor.close()
            return jsonify({"error": f"Exchange request is already {exchange['exchange_status']}"}), 400
        
        # Update exchange status
        cursor.execute(
            """
            UPDATE exchangerequest
            SET exchange_status = 'Rejected', approval_date = NOW()
            WHERE exchange_id = %s
            """,
            (exchange_id,)
        )
        conn.commit()
        cursor.close()

        return jsonify({"message": "Exchange request rejected successfully"}), 200
    except Exception as e:
        return jsonify({"error": "Database error", "details": str(e)}), 500


@exchange_bp.route("/exchange/<int:exchange_id>", methods=["GET"])
@token_required
def get_exchange(exchange_id):
    """Get a specific exchange request"""
    try:
        user_id = request.current_user.get("user_id")
        
        cursor = conn.cursor(dictionary=True)
        
        query = """
        SELECT er.*, 
               req_item.title as requested_title, req_item.image_url as requested_image,
               req_item.category as requested_category, req_item.description as requested_description,
               off_item.title as offered_title, off_item.image_url as offered_image,
               off_item.category as offered_category, off_item.description as offered_description,
               owner.name as owner_name, requester.name as requester_name
        FROM exchangerequest er
        LEFT JOIN clothing_items req_item ON er.requested_item_id = req_item.item_id
        LEFT JOIN clothing_items off_item ON er.offered_item_id = off_item.item_id
        LEFT JOIN users owner ON er.owner_id = owner.user_id
        LEFT JOIN users requester ON er.requester_id = requester.user_id
        WHERE er.exchange_id = %s AND (er.requester_id = %s OR er.owner_id = %s)
        """
        
        cursor.execute(query, (exchange_id, user_id, user_id))
        exchange = cursor.fetchone()
        cursor.close()

        if not exchange:
            return jsonify({"error": "Exchange request not found"}), 404

        return jsonify({
            "id": exchange["exchange_id"],
            "requester_id": exchange["requester_id"],
            "owner_id": exchange["owner_id"],
            "requester_name": exchange["requester_name"],
            "owner_name": exchange["owner_name"],
            "requested_item_id": exchange["requested_item_id"],
            "requested_title": exchange["requested_title"],
            "requested_image": exchange["requested_image"],
            "requested_category": exchange["requested_category"],
            "requested_description": exchange["requested_description"],
            "offered_item_id": exchange["offered_item_id"],
            "offered_title": exchange["offered_title"],
            "offered_image": exchange["offered_image"],
            "offered_category": exchange["offered_category"],
            "offered_description": exchange["offered_description"],
            "offered_points": exchange["offerd_points"],
            "status": exchange["exchange_status"],
            "request_date": exchange["request_date"].isoformat() if exchange["request_date"] else None,
            "approval_date": exchange["approval_date"].isoformat() if exchange["approval_date"] else None
        }), 200
    except Exception as e:
        return jsonify({"error": "Database error", "details": str(e)}), 500

