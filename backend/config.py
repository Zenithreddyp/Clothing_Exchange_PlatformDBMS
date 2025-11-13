from flask import Flask,jsonify 
from flask_cors import CORS 
import mysql.connector 



app = Flask(__name__) 
CORS(app) 



# def get_db_connection(): 
conn = mysql.connector.connect(
    host='localhost', 
    user='root', 
    password='NewPassword123!', 
    database='scep_db' 
    ) # return conn