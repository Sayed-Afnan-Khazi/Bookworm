from flask import Flask, jsonify, request, Response
from werkzeug.utils import secure_filename
from flask_cors import CORS
import os, time, random
from flask_socketio import SocketIO, emit
from bson import ObjectId

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
chats = db['chats']

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

app.config['UPLOAD_FOLDER'] = './data'
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
                'chats': [] # Will store the IDs of notes
            }
            notebook_id = notebooks.insert_one(default_notebook).inserted_id
            os.mkdir(f"./data/user_{user_id}")
            os.mkdir(f"./data/user_{user_id}/notebook_{notebook_id}")
            os.mkdir(f"./data/user_{user_id}/notebook_{notebook_id}/notebook_global_files")
        else:
            users.update_one({'email': email}, {'$set': {'name': name}})

        user_id = user['_id']

        # Create token
        access_token = create_access_token(identity=email)
        res = jsonify({'status': 'success', 'access_token_cookie': access_token,'user': json.loads(json.dumps(user, default=str))})
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
        'chats': []
    }
    new_notebook_id = notebooks.insert_one(new_notebook).inserted_id
    user_id = user['_id']
    # We will use some kind of object storage later
    os.mkdir(f"./data/user_{user_id}/notebook_{new_notebook_id}")
    os.mkdir(f"./data/user_{user_id}/notebook_{new_notebook_id}/notebook_global_files")

    # Sending the new notebook's ID and name as confirmation.
    return jsonify({'notebook_id': str(new_notebook_id),'notebook_name':notebook_name}), 201

@app.route('/api/notebook/<notebook_id>', methods=['GET'])
@jwt_required(locations=['headers'])
def notebook_page(notebook_id):
    if not ObjectId.is_valid(notebook_id):
        return jsonify({'error':"This notebook either doesn't exist or you're not allowed to access it."}),401
    current_user = get_jwt_identity()
    user = users.find_one({'email': current_user})
    nb = notebooks.find_one({'_id': ObjectId(notebook_id),'owner':user['_id']})
    nb_chats = list(chats.find({'notebook_id':ObjectId(notebook_id)}))
    if not nb:
        return jsonify({'error':"This notebook either doesn't exist or you're not allowed to access it."}),401
    else:
        return jsonify({'notebook': json.loads(json.dumps(nb, default=str)),'chats':json.loads(json.dumps(nb_chats, default=str))})

@app.route('/api/chat',methods = ['POST'])
@jwt_required(locations=['headers'])
def create_chat():
    current_user = get_jwt_identity()

    # Get the user and request data
    user = users.find_one({'email': current_user})
    req_data = request.get_json()
    chat_name = req_data.get('chat_name')
    notebook_id = req_data.get('notebook_id')
    
    # Check to make sure the notebook exists and it belongs to that user
    if not notebook_id:
        return jsonify({'error': 'No notebook_id provided'}), 400

    nb = notebooks.find_one({'_id':ObjectId(notebook_id),'owner':user['_id']})

    if not nb:
        return jsonify({'error': 'Notebook or user invalid'}), 400
    
    if not chat_name:
        return jsonify({'error': 'No chat name provided'}), 400

    # Create a new chat 
    new_chat = {
        'notebook_id': nb['_id'],
        'name': chat_name,
        'lastModified': time.time_ns(),
        'chat_history': ['Hello there!']
    }

    new_chat_id = chats.insert_one(new_chat).inserted_id
    # Add that chat's _id to the notebook's list of chats
    add_chat_result = notebooks.update_one({'_id': nb['_id']}, {'$push': {'chats': new_chat_id}})

    if add_chat_result.modified_count:
        user_id = user['_id']
        notebook_id = nb['_id']
        os.mkdir(f"./data/user_{user_id}/notebook_{notebook_id}/chat_{new_chat_id}_files")
        return jsonify({'new_chat_id':str(new_chat_id)}), 200
    else:
        return jsonify({'error':'An error occurred while trying to create a new chat'})

@app.route('/api/chat/upload',methods=["POST"])
@jwt_required(locations=['headers'])
def upload_chat_file():
    # Check if the file was sent or not
    if 'file' not in request.files or request.files['file'].filename == '':
        return jsonify({"error":'A file was not sent with the request.'}), 400
    
    current_user = get_jwt_identity()

    # Get the user and request data
    user = users.find_one({'email': current_user})
    user_id = user['_id']
    req_data = request.get_json()
    chat_id = req_data.get('chat_id')
    notebook_id = req_data.get('notebook_id')
    
    # Save the file
    file = request.files['file']
    if is_file_allowed(file.filename):
        file_name = secure_filename(file.filename)
        file.save(os.path.join(app.config['UPLOAD_FOLDER'],'user_'+user_id,'notebook_'+notebook_id,'chat_'+chat_id+'_files',file_name))
        return jsonify('File saved'),200

    return jsonify("Something isn't right..."), 500





if __name__ == '__main__':
    socketio.run(app, debug=True, port=8000)