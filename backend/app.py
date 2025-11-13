# from flask import request, jsonify 
from flask import jsonify
from config import app, conn
from routes.users_routes import users_bp
from routes.clothing_routes import clothing_bp
from routes.donation_routes import donation_bp
from routes.eco_points_routes import eco_points_bp
from routes.exchange_routes import exchange_bp
from routes.conversation_routes import conversation_bp

@app.route('/get_tables', methods=["GET"])
def get_tables():
    cursor = conn.cursor()
    cursor.execute("SHOW TABLES;")
    tables = cursor.fetchall()
    cursor.close()
    # conn.close()
    table_names = [table[0] for table in tables]
    return jsonify({"tables": table_names}, 200)


# Register all blueprints
app.register_blueprint(users_bp, url_prefix="/api/users")
app.register_blueprint(clothing_bp, url_prefix="/api")
app.register_blueprint(donation_bp, url_prefix="/api")
app.register_blueprint(eco_points_bp, url_prefix="/api")
app.register_blueprint(exchange_bp, url_prefix="/api")
app.register_blueprint(conversation_bp, url_prefix="/api")


if __name__ == '__main__':
    app.run(debug=True)



# if __name__ == "__main__":
#     with app.app_context():
#         db.create_all()
#     app.run(debug=True)