from flask import Flask, jsonify
from flask_cors import CORS
import mysql.connector
import os
from dotenv import load_dotenv

app = Flask(__name__)
CORS(app)

# Load environment variables
load_dotenv()

# Database connection (using only `conn`)
conn = mysql.connector.connect(
    host=os.getenv("DB_HOST"),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD"),
    database=os.getenv("DB_NAME")
)
