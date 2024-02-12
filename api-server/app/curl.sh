#!/bin/bash
curl 
# Set the API endpoint URL
url="http://localhost:9000/api/route"

# Set the request body JSON data
request_data='{"source": {"lng":51.52133174232717,"lat":25.387693441819387}, "destination": {"lng":51.5237457305209,"lat":25.39140569815405}, "mode": "driving"}'

# Send the POST request to the API endpoint using curl
curl -X POST -H "Content-Type: application/json" -d "$request_data" "$url"
