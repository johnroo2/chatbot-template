import dotenv

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO

from loguru import logger as log

import sys
from pathlib import Path

from graphing import LangGraphClient

sys.path.append(str(Path(__file__).parent.parent))

from models.general import GeneratePromptRequest

dotenv.load_dotenv()

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins='*')

langgraph_client = LangGraphClient()

@socketio.on('connect')
def handle_connect():
    log.success('Client connected!')

@socketio.on('disconnect')
def handle_disconnect():
    log.error('Client disconnected!')
    
@app.route('/', methods=['GET'])
def index():
    log.info('GET request at /')
    return jsonify({'message': 'Hello, World!'})
    
    
@app.route('/api/generate-prompt', methods=['POST'])
async def generate_prompt():
    log.info('POST request at /api/generate-prompt')
    try:
        data = request.get_json()
        parsed_data = GeneratePromptRequest(**data)
        
        if parsed_data.api_key != dotenv.get_key(dotenv.find_dotenv(), 'API_KEY'):
            log.error(f'Invalid API key: {parsed_data.api_key}')
            return jsonify({'error': 'Invalid API key'}), 401
        
        def stream_output(chunk: str):
            socketio.emit('update-message', {
                'id': parsed_data.message_id,
                'content': chunk
            })
        
        res = await langgraph_client.generate_reply(parsed_data.prompt, parsed_data.history, stream_output)
        
        socketio.emit('finish-message', {
            'id': parsed_data.message_id,
            'content': res
        })
        
        return jsonify({'message': res}), 200
    except Exception as e:
        log.error(f'Error generating prompt: {e}')
        return jsonify({'error': str(e)}), 400
        

if __name__ == '__main__':
    socketio.run(app, debug=True)