from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from datetime import datetime
import json
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# File to store visitor data
VISITOR_FILE = 'visitor_data.json'

def load_visitor_data():
    if os.path.exists(VISITOR_FILE):
        with open(VISITOR_FILE, 'r') as f:
            return json.load(f)
    return {
        'total_visitors': 0,
        'unique_visitors': 0,
        'visitors': {},
        'daily_stats': {}
    }

def save_visitor_data(data):
    with open(VISITOR_FILE, 'w') as f:
        json.dump(data, f)

@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('.', path)

@app.route('/api/visitor', methods=['POST'])
def track_visitor():
    data = load_visitor_data()
    visitor_id = request.headers.get('X-Visitor-ID')
    today = datetime.now().strftime('%Y-%m-%d')
    
    # Initialize daily stats if not exists
    if today not in data['daily_stats']:
        data['daily_stats'][today] = {
            'total': 0,
            'unique': 0
        }
    
    # Update total visitors
    data['total_visitors'] += 1
    data['daily_stats'][today]['total'] += 1
    
    # Update unique visitors if new visitor
    if visitor_id and visitor_id not in data['visitors']:
        data['unique_visitors'] += 1
        data['visitors'][visitor_id] = {
            'first_visit': datetime.now().isoformat(),
            'last_visit': datetime.now().isoformat()
        }
        data['daily_stats'][today]['unique'] += 1
    elif visitor_id:
        data['visitors'][visitor_id]['last_visit'] = datetime.now().isoformat()
    
    save_visitor_data(data)
    
    return jsonify({
        'total_visitors': data['total_visitors'],
        'unique_visitors': data['unique_visitors'],
        'daily_stats': data['daily_stats'][today]
    })

@app.route('/api/stats', methods=['GET'])
def get_stats():
    data = load_visitor_data()
    return jsonify({
        'total_visitors': data['total_visitors'],
        'unique_visitors': data['unique_visitors'],
        'daily_stats': data['daily_stats']
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5001))) 