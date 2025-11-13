from flask import Blueprint, request, jsonify
from config import conn
from middleware.auth_middleware import token_required

eco_points_bp = Blueprint("eco_points_bp", __name__)


@eco_points_bp.route("/eco_points", methods=["GET"])
@token_required
def get_eco_points():
    """Get user's eco points and transaction history"""
    # print("Current user:", request.current_user)

    try:

        user_id = request.current_user.get("user_id")
        # user_id = request.current_user.get("user_id")
        cursor = conn.cursor(dictionary=True)
        
        # Get user's total eco points
        cursor.execute("SELECT eco_points FROM users WHERE user_id = %s", (user_id,))
        user = cursor.fetchone()
        total_points = user["eco_points"] if user else 0

        
        
        # # Get transaction history
        # cursor.execute(
        #     """
        #     SELECT transaction_id, transaction_type, points, reason, transaction_date,
        #            exchange_id, donation_id
        #     FROM eco_point_transaction
        #     WHERE user_id = %s
        #     ORDER BY transaction_date DESC
        #     LIMIT 10
        #     """,
        #     (user_id,)
        # )
        # transactions = cursor.fetchall()
        # cursor.close()

        # # Format transactions for frontend
        # formatted_transactions = []
        # for txn in transactions:
        #     formatted_transactions.append({
        #         "id": txn["transaction_id"],
        #         "type": txn["transaction_type"],
        #         "points": txn["points"],
        #         "note": txn["reason"] or "",
        #         "date": txn["transaction_date"].isoformat() if txn["transaction_date"] else None,
        #         "exchange_id": txn["exchange_id"],
        #         "donation_id": txn["donation_id"]
        #     })
        # print(f"tota is {total_points}")

        return jsonify({
            "total": total_points,
            # "transactions": formatted_transactions
        }), 200
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return jsonify({"error": "Database error", "details": str(e)}), 500


@eco_points_bp.route("/eco_points/transactions", methods=["GET"])
@token_required
def get_transactions():
    """Get detailed transaction history with pagination"""
    try:
        user_id = request.current_user.get("user_id")
        page = request.args.get("page", 1, type=int)
        limit = request.args.get("limit", 50, type=int)
        offset = (page - 1) * limit
        
        cursor = conn.cursor(dictionary=True)
        
        # Get total count
        cursor.execute(
            "SELECT COUNT(*) as total FROM eco_point_transaction WHERE user_id = %s",
            (user_id,)
        )
        total = cursor.fetchone()["total"]
        
        # Get transactions
        cursor.execute(
            """
            SELECT transaction_id, transaction_type, points, reason, transaction_date,
                   exchange_id, donation_id
            FROM eco_point_transaction
            WHERE user_id = %s
            ORDER BY transaction_date DESC
            LIMIT %s OFFSET %s
            """,
            (user_id, limit, offset)
        )
        transactions = cursor.fetchall()
        cursor.close()

        formatted_transactions = []
        for txn in transactions:
            formatted_transactions.append({
                "id": txn["transaction_id"],
                "type": txn["transaction_type"],
                "points": txn["points"],
                "reason": txn["reason"],
                "date": txn["transaction_date"].isoformat() if txn["transaction_date"] else None,
                "exchange_id": txn["exchange_id"],
                "donation_id": txn["donation_id"]
            })

            # print(formatted_transactions)

        return jsonify({
            "transactions": formatted_transactions,
            "total": total,
            "page": page,
            "limit": limit,
            "pages": (total + limit - 1) // limit
        }), 200
    except Exception as e:
        return jsonify({"error": "Database error", "details": str(e)}), 500

