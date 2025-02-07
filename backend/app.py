from flask import Flask, jsonify, request, Response
from werkzeug.utils import secure_filename
from flask_cors import CORS
import os, time, random
from flask_socketio import SocketIO, emit
import datetime

from gemini_wrap import answer_question

from google.oauth2 import id_token
from google.auth.transport import requests as GoogleRequests
from flask_jwt_extended import create_access_token, JWTManager, jwt_required, get_jwt_identity
from dotenv import load_dotenv
load_dotenv()

# Connect to mongodb
import pymongo
import json
client = pymongo.MongoClient(os.getenv('MONGO_URI'))
db = client['Book-keeper']
users = db['users']
notebooks = db['notebooks']

if db is None:
    raise Warning("The database, Book-keeper does not exist. Please check if the database is online and has been set up correctly.")

GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
GOOGLE_SECRET_KEY = os.getenv('GOOGLE_SECRET_KEY')

# App config

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")
# Initialize the JWT Manager
app.config['JWT_SECRET_KEY'] = 'your-secret-key'  # Replace with your own secret key
jwt = JWTManager(app)

app.config['UPLOAD_FOLDER'] = './pdfs'
ALLOWED_EXTENSIONS = ['pdf']

def check_if_upload_folder_exists():
    '''Checks if the app.config['UPLOAD_FOLDER'] exists'''
    return os.path.exists(app.config['UPLOAD_FOLDER'])

def is_file_allowed(file_name):
    '''Checks if the file has an extension and whether that extension is within the ALLOWED_EXTENSIONS list.'''
    print(file_name.split('.')[-1])
    return file_name and '.' in file_name and ALLOWED_EXTENSIONS and file_name.split('.')[-1] in ALLOWED_EXTENSIONS

if not check_if_upload_folder_exists():
    raise Warning("The Upload folder has not been set or doesn't exist")

@app.route('/api/upload',methods=["POST"])
def home():
    # Check if the file was sent or not
    if 'file' not in request.files or request.files['file'].filename == '':
        return jsonify('A file was not sent with the request.'), 400
    # Save the file
    file = request.files['file']
    if is_file_allowed(file.filename):
        file_name = secure_filename(file.filename)
        file.save(os.path.join(app.config['UPLOAD_FOLDER'],file_name))
        return jsonify('File saved'),200

    return jsonify("Something isn't right..."), 500

@socketio.on('ask_question')
def handle_question(data):
    question = data.get('questionText')
    if not question:
        emit('error', {'message': 'No question received'})
        return
    def prawn():
        for i in ["Contrary to popular belief, Lorem Ipsum is not simply random text."," It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor ","at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of \"de Finibus Bonorum et Malorum\" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This b","ook is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, \"Lorem ipsum dolor sit amet..\", comes from a line in section 1.10.32.The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for ","those interested. Sections 1.10.32 and 1.10.33 from \"de Finibus Bonorum et Malorum\" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham."]:
            time.sleep(random.random())
            yield i
    try:
        ans = answer_question(question_text=question)
        for chunk in ans:
            emit('answer_chunk', {'text': chunk.text})
        # p = prawn()
        # for chunk in p:
        #     emit('answer_chunk',{'text':str(chunk)})
    except Exception as e:
        emit('error', {'message': str(e)})

@app.route('/api/login', methods=['POST'])
def login():
    req_data = request.get_json()
    credential = req_data.get('credential')
    if not credential:
        return jsonify({'error': 'No credentials provided'}), 400
    try:
        # Verify the token
        idinfo = id_token.verify_oauth2_token(credential, GoogleRequests.Request(), GOOGLE_CLIENT_ID)

        # ID token is valid; get the user's Google Account information
        userid = idinfo['sub']
        email = idinfo.get('email')
        name = idinfo.get('name')
        picture = idinfo.get('picture')

        # Create or update the user in the database 
        user = users.find_one({'email': email})
        if not user:
            user = {
                'email': email,
                'name': name,
                'picture': picture
            }
            user_id = users.insert_one(user).inserted_id
            default_notebook = {
                'owner': user_id,
                'name': 'Starter Notebook',
                'lastModified' : time.time_ns(),
                'notes': [] # Will store the IDs of notes
            }
            notebooks.insert_one(default_notebook)
        else:
            users.update_one({'email': email}, {'$set': {'name': name}})

        user_id = user['_id']
        user_notebooks = list(notebooks.find({'owner': user_id}))

        # Create token
        access_token = create_access_token(identity=email)
        res = jsonify({'status': 'success', 'access_token_cookie': access_token,'user': json.loads(json.dumps(user, default=str)),'notebooks': [json.loads(json.dumps(nb, default=str)) for nb in user_notebooks]})
        return res, 200

    except ValueError:
        # Invalid token
        return jsonify({'error': 'Invalid token'}), 400
    

@app.route('/api/check-auth', methods=['GET'])
@jwt_required(locations=['headers'])
def check_auth():
    # jwt_required() will make sure the user has a valid JWT before calling this endpoint
    current_user = get_jwt_identity()
    # Fetch user details if necessary
    user = {'email': current_user}
    return jsonify({'user': user}), 200


@app.route('/api/logout', methods=['POST'])
def logout():
    res = jsonify({'message': 'Logged out'})
    res.set_cookie('access_token_cookie', '', max_age=0)
    return res, 200

@app.route('/api/notebooks', methods=['GET'])
@jwt_required(locations=['headers'])
def get_notebooks():
    current_user = get_jwt_identity()
    user = users.find_one({'email': current_user})
    user_notebooks = list(notebooks.find({'owner': user['_id']}))
    return jsonify({'notebooks': [json.loads(json.dumps(nb, default=str)) for nb in sorted(user_notebooks,key=lambda notebook: notebook['lastModified'],reverse=True)]})

@app.route('/api/notebooks', methods=['POST'])
@jwt_required(locations=['headers'])
def create_notebook():
    print("Hi")
    current_user = get_jwt_identity()

    user = users.find_one({'email': current_user})
    req_data = request.get_json()
    notebook_name = req_data.get('name')

    if not notebook_name:
        return jsonify({'error': 'No notebook name provided'}), 400
    # print(user)
    # if not user:
    #     return jsonify({'error': 'User unauthorized'}), 401
    
    # Create and add the notebook
    new_notebook = {
        'owner': user['_id'],
        'name': notebook_name,
        'lastModified': time.time_ns(),
        'notes': []
    }
    new_notebook_id = notebooks.insert_one(new_notebook).inserted_id

    # Sending the new notebook's ID and name as confirmation.
    return jsonify({'notebook_id': str(new_notebook_id),'notebook_name':notebook_name}), 201


if __name__ == '__main__':
    socketio.run(app, debug=True, port=8000)