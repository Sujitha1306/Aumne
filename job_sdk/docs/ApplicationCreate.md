# ApplicationCreate

Request schema for creating a job application.

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**applicant_name** | **str** |  | 

## Example

```python
from openapi_client.models.application_create import ApplicationCreate

# TODO update the JSON string below
json = "{}"
# create an instance of ApplicationCreate from a JSON string
application_create_instance = ApplicationCreate.from_json(json)
# print the JSON string representation of the object
print(ApplicationCreate.to_json())

# convert the object into a dict
application_create_dict = application_create_instance.to_dict()
# create an instance of ApplicationCreate from a dict
application_create_from_dict = ApplicationCreate.from_dict(application_create_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


