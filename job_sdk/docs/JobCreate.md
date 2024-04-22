# JobCreate

Request schema for creating a job posting.

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**title** | **str** |  | 
**deadline** | **datetime** |  | 

## Example

```python
from openapi_client.models.job_create import JobCreate

# TODO update the JSON string below
json = "{}"
# create an instance of JobCreate from a JSON string
job_create_instance = JobCreate.from_json(json)
# print the JSON string representation of the object
print(JobCreate.to_json())

# convert the object into a dict
job_create_dict = job_create_instance.to_dict()
# create an instance of JobCreate from a dict
job_create_from_dict = JobCreate.from_dict(job_create_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


