from flask import Blueprint, request, jsonify
from config import conn
from middleware.auth_middleware import token_required

conversation_bp = Blueprint("conversation_bp", __name__)


@conversation_bp.route("/messages", methods=["GET"])
@token_required
def get_messages():
    """Get messages or conversation list"""
    try:
        user_id = request.current_user.get("user_id")
        list_mode = request.args.get("list") == "1"
        conversation_id = request.args.get("conversation_id")
        
        cursor = conn.cursor(dictionary=True)
        
        if list_mode:
            query = """
            SELECT c.conversation_id,
                   CASE 
                       WHEN c.user1_id = %s THEN u2.user_id
                       ELSE u1.user_id
                   END as other_user_id,
                   CASE 
                       WHEN c.user1_id = %s THEN u2.name
                       ELSE u1.name
                   END as other_user_name,
                   (SELECT message_text FROM Messages 
                    WHERE conversation_id = c.conversation_id 
                    ORDER BY timestamp DESC LIMIT 1) as last_message,
                   (SELECT timestamp FROM Messages 
                    WHERE conversation_id = c.conversation_id 
                    ORDER BY timestamp DESC LIMIT 1) as last_message_time
            FROM Conversations c
            LEFT JOIN users u1 ON c.user1_id = u1.user_id
            LEFT JOIN users u2 ON c.user2_id = u2.user_id
            WHERE c.user1_id = %s OR c.user2_id = %s
            ORDER BY last_message_time DESC
            """
            cursor.execute(query, (user_id, user_id, user_id, user_id))
            conversations = cursor.fetchall()
            cursor.close()
            
            formatted_conversations = []
            for conv in conversations:
                formatted_conversations.append({
                    "id": conv["conversation_id"],
                    "name": conv["other_user_name"],
                    "last_message": conv["last_message"] or "",
                    "last_message_time": conv["last_message_time"].isoformat() if conv["last_message_time"] else None
                })
            
            return jsonify(formatted_conversations), 200
        
        elif conversation_id:

            cursor.execute(
                """
                SELECT conversation_id FROM Conversations
                WHERE conversation_id = %s AND (user1_id = %s OR user2_id = %s)
                """,
                (conversation_id, user_id, user_id)
            )
            conversation = cursor.fetchone()
            
            if not conversation:
                cursor.close()
                return jsonify({"error": "Conversation not found or access denied"}), 404
            
            cursor.execute(
                """
                SELECT message_id, sender_id, message_text, timestamp
                FROM Messages
                WHERE conversation_id = %s
                ORDER BY timestamp ASC
                """,
                (conversation_id,)
            )
            messages = cursor.fetchall()
            cursor.close()
            
            formatted_messages = []
            for msg in messages:
                formatted_messages.append({
                    "id": msg["message_id"],
                    "text": msg["message_text"],
                    "is_self": msg["sender_id"] == user_id,
                    "created_at": msg["timestamp"].isoformat() if msg["timestamp"] else None
                })
            
            return jsonify(formatted_messages), 200
        else:
            cursor.close()
            return jsonify({"error": "Either 'list=1' or 'conversation_id' parameter is required"}), 400
            
    except Exception as e:
        return jsonify({"error": "Database error", "details": str(e)}), 500


@conversation_bp.route("/messages", methods=["POST"])
@token_required
def send_message():
    """Send a message or create a conversation"""
    try:
        user_id = request.current_user.get("user_id")
        data = request.get_json()
        
        conversation_id = data.get("conversation_id")
        message_text = data.get("text") or data.get("message_text")
        other_user_id = data.get("other_user_id")
        
        if not message_text:
            return jsonify({"error": "message text is required"}), 400
        
        cursor = conn.cursor(dictionary=True)
        
        if conversation_id:
            cursor.execute(
                """
                SELECT conversation_id FROM Conversations
                WHERE conversation_id = %s AND (user1_id = %s OR user2_id = %s)
                """,
                (conversation_id, user_id, user_id)
            )
            conversation = cursor.fetchone()
            
            if not conversation:
                cursor.close()
                return jsonify({"error": "Conversation not found or access denied"}), 404
        
        elif other_user_id:
            if other_user_id == user_id:
                cursor.close()
                return jsonify({"error": "You cannot message yourself"}), 400
            
            cursor.execute(
                """
                SELECT conversation_id FROM Conversations
                WHERE (user1_id = %s AND user2_id = %s) OR (user1_id = %s AND user2_id = %s)
                """,
                (user_id, other_user_id, other_user_id, user_id)
            )
            existing = cursor.fetchone()
            
            if existing:
                conversation_id = existing["conversation_id"]
            else:
                cursor.execute(
                    """
                    INSERT INTO Conversations (user1_id, user2_id, start_time)
                    VALUES (%s, %s, NOW())
                    """,
                    (user_id, other_user_id)
                )
                conversation_id = cursor.lastrowid
        
        else:
            cursor.close()
            return jsonify({"error": "Either conversation_id or other_user_id is required"}), 400
        
        cursor.execute(
            """
            INSERT INTO Messages (conversation_id, sender_id, message_text, timestamp)
            VALUES (%s, %s, %s, NOW())
            """,
            (conversation_id, user_id, message_text)
        )
        message_id = cursor.lastrowid
        conn.commit()
        cursor.close()

        return jsonify({
            "id": message_id,
            "conversation_id": conversation_id,
            "text": message_text,
            "is_self": True,
            "created_at": None 
        }), 201
    except Exception as e:
        return jsonify({"error": "Database error", "details": str(e)}), 500


@conversation_bp.route("/conversations", methods=["GET"])
@token_required
def get_conversations():
    """Get all conversations for the current user"""
    try:
        user_id = request.current_user.get("user_id")
        
        cursor = conn.cursor(dictionary=True)
        query = """
        SELECT c.conversation_id,
               CASE 
                   WHEN c.user1_id = %s THEN u2.user_id
                   ELSE u1.user_id
               END as other_user_id,
               CASE 
                   WHEN c.user1_id = %s THEN u2.name
                   ELSE u1.name
               END as other_user_name,
               c.start_time,
               (SELECT COUNT(*) FROM Messages 
                WHERE conversation_id = c.conversation_id 
                AND sender_id != %s 
                AND timestamp > COALESCE((SELECT MAX(timestamp) FROM Messages 
                                         WHERE conversation_id = c.conversation_id 
                                         AND sender_id = %s), '1970-01-01')) as unread_count
        FROM Conversations c
        LEFT JOIN users u1 ON c.user1_id = u1.user_id
        LEFT JOIN users u2 ON c.user2_id = u2.user_id
        WHERE c.user1_id = %s OR c.user2_id = %s
        ORDER BY c.start_time DESC
        """
        cursor.execute(query, (user_id, user_id, user_id, user_id, user_id, user_id))
        conversations = cursor.fetchall()
        cursor.close()
    
        formatted_conversations = []
        for conv in conversations:
            formatted_conversations.append({
                "id": conv["conversation_id"],
                "other_user_id": conv["other_user_id"],
                "other_user_name": conv["other_user_name"],
                "start_time": conv["start_time"].isoformat() if conv["start_time"] else None,
                "unread_count": conv["unread_count"] or 0
            })
        
        return jsonify({"conversations": formatted_conversations}), 200
    except Exception as e:
        return jsonify({"error": "Database error", "details": str(e)}), 500


@conversation_bp.route("/conversations/<int:other_user_id>", methods=["POST"])
@token_required
def create_conversation(other_user_id):
    """Create or get a conversation with another user"""
    try:
        user_id = request.current_user.get("user_id")
        
        if other_user_id == user_id:
            return jsonify({"error": "You cannot create a conversation with yourself"}), 400
        
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute(
            """
            SELECT conversation_id FROM Conversations
            WHERE (user1_id = %s AND user2_id = %s) OR (user1_id = %s AND user2_id = %s)
            """,
            (user_id, other_user_id, other_user_id, user_id)
        )
        existing = cursor.fetchone()
        
        if existing:
            cursor.close()
            return jsonify({
                "conversation_id": existing["conversation_id"],
                "message": "Conversation already exists"
            }), 200
        
        cursor.execute(
            """
            INSERT INTO Conversations (user1_id, user2_id, start_time)
            VALUES (%s, %s, NOW())
            """,
            (user_id, other_user_id)
        )
        conversation_id = cursor.lastrowid
        conn.commit()
        cursor.close()

        return jsonify({
            "conversation_id": conversation_id,
            "message": "Conversation created successfully"
        }), 201
    except Exception as e:
        return jsonify({"error": "Database error", "details": str(e)}), 500

