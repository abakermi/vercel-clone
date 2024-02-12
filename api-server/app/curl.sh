#!/bin/bash
curl
# Set the API endpoint URL
url="http://localhost:9000/project"

# Set the request body JSON data
request_data='{"gitURL": "https://github.com/chhpt/nextjs-starter"}'

# Send the POST request to the API endpoint using curl
curl -X POST -H "Content-Type: application/json" -d "$request_data" "$url"
