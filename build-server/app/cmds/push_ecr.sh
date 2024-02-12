#!/bin/bash

# Set the ECR repository name and region
ECR_REPOSITORY_NAME="vercel-server-prod"
ECR_REGION="ap-southeast-1"
PROFILE="akermi"
AWS_ACCOUNT_ID="767397933006"
TAG="v$1"

# Build the Docker image
docker build -t $ECR_REPOSITORY_NAME:$TAG .

# Authenticate to the ECR repository
aws ecr get-login-password --region $ECR_REGION --profile $PROFILE | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$ECR_REGION.amazonaws.com

# Tag the Docker image with the ECR repository URI and the latest tag
docker tag $ECR_REPOSITORY_NAME:$TAG $AWS_ACCOUNT_ID.dkr.ecr.$ECR_REGION.amazonaws.com/$ECR_REPOSITORY_NAME:$TAG

# Push the Docker image to the ECR repository
docker push $AWS_ACCOUNT_ID.dkr.ecr.$ECR_REGION.amazonaws.com/$ECR_REPOSITORY_NAME:$TAG
