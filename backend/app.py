from flask import Flask, jsonify, request, Response
from werkzeug.utils import secure_filename
from flask_cors import CORS
import os, time, random
from flask_socketio import SocketIO, emit

from gemini_wrap import answer_question

# App config

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

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

if __name__ == '__main__':
    socketio.run(app, debug=True, port=8000)