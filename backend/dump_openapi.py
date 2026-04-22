import json
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from main import app

with open('openapi.json', 'w') as f:
    json.dump(app.openapi(), f)
