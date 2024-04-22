import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), 'job_sdk')))

import openapi_client
from pprint import pprint

configuration = openapi_client.Configuration(host="http://localhost:8000")
with openapi_client.ApiClient(configuration) as api_client:
    api_instance = openapi_client.DefaultApi(api_client)
    api_response = api_instance.list_jobs_jobs_get()
    pprint(api_response)
