# openapi_client.DefaultApi

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**apply_for_job_jobs_id_apply_post**](DefaultApi.md#apply_for_job_jobs_id_apply_post) | **POST** /jobs/{id}/apply | Apply For Job
[**create_job_jobs_post**](DefaultApi.md#create_job_jobs_post) | **POST** /jobs/ | Create Job
[**list_jobs_jobs_get**](DefaultApi.md#list_jobs_jobs_get) | **GET** /jobs/ | List Jobs


# **apply_for_job_jobs_id_apply_post**
> ApplicationResponse apply_for_job_jobs_id_apply_post(id, application_create)

Apply For Job

Apply for a job.

### Example


```python
import openapi_client
from openapi_client.models.application_create import ApplicationCreate
from openapi_client.models.application_response import ApplicationResponse
from openapi_client.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to http://localhost
# See configuration.py for a list of all supported configuration parameters.
configuration = openapi_client.Configuration(
    host = "http://localhost"
)


# Enter a context with an instance of the API client
with openapi_client.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = openapi_client.DefaultApi(api_client)
    id = 56 # int | 
    application_create = openapi_client.ApplicationCreate() # ApplicationCreate | 

    try:
        # Apply For Job
        api_response = api_instance.apply_for_job_jobs_id_apply_post(id, application_create)
        print("The response of DefaultApi->apply_for_job_jobs_id_apply_post:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling DefaultApi->apply_for_job_jobs_id_apply_post: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **int**|  | 
 **application_create** | [**ApplicationCreate**](ApplicationCreate.md)|  | 

### Return type

[**ApplicationResponse**](ApplicationResponse.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**201** | Successful Response |  -  |
**422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **create_job_jobs_post**
> JobResponse create_job_jobs_post(job_create)

Create Job

Create a new job posting. Deadline must be a future date.

### Example


```python
import openapi_client
from openapi_client.models.job_create import JobCreate
from openapi_client.models.job_response import JobResponse
from openapi_client.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to http://localhost
# See configuration.py for a list of all supported configuration parameters.
configuration = openapi_client.Configuration(
    host = "http://localhost"
)


# Enter a context with an instance of the API client
with openapi_client.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = openapi_client.DefaultApi(api_client)
    job_create = openapi_client.JobCreate() # JobCreate | 

    try:
        # Create Job
        api_response = api_instance.create_job_jobs_post(job_create)
        print("The response of DefaultApi->create_job_jobs_post:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling DefaultApi->create_job_jobs_post: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **job_create** | [**JobCreate**](JobCreate.md)|  | 

### Return type

[**JobResponse**](JobResponse.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**201** | Successful Response |  -  |
**422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **list_jobs_jobs_get**
> List[JobResponse] list_jobs_jobs_get()

List Jobs

Return all job postings.

### Example


```python
import openapi_client
from openapi_client.models.job_response import JobResponse
from openapi_client.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to http://localhost
# See configuration.py for a list of all supported configuration parameters.
configuration = openapi_client.Configuration(
    host = "http://localhost"
)


# Enter a context with an instance of the API client
with openapi_client.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = openapi_client.DefaultApi(api_client)

    try:
        # List Jobs
        api_response = api_instance.list_jobs_jobs_get()
        print("The response of DefaultApi->list_jobs_jobs_get:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling DefaultApi->list_jobs_jobs_get: %s\n" % e)
```



### Parameters

This endpoint does not need any parameter.

### Return type

[**List[JobResponse]**](JobResponse.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Successful Response |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

