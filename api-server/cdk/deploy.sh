#!/bin/sh

export $(grep -v '^#' $1 | xargs)

# echo $CDK_DEFAULT_REGION
npm run $2
