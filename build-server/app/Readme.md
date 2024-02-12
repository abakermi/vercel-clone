# Docker Image Push to ECR Repository

This script automates the process of building a Docker image, tagging it, and pushing it to an Amazon Elastic Container Registry (ECR) repository.

## Prerequisites

Before running this script, ensure you have the following:

- Docker installed on your machine.
- AWS CLI installed and configured with appropriate credentials and permissions.
- Permission to push images to the specified ECR repository.

## Usage

1. Ensure that the script file (`cmds/push_to_ecr.sh`) has execute permissions. If not, you can set the permissions using the following command:
```sh
chmod +x cmds/push_to_ecr.sh
```

2. Execute the script by providing a version number as an argument:
```sh
./cmds/push_to_ecr.sh <version_number>
```
Replace `<version_number>` with the desired version tag for your Docker image.

3. The script will build the Docker image, tag it with the specified version number, authenticate to the ECR repository, and push the image to the repository.

4. Once the script completes execution, the Docker image will be available in the specified ECR repository with the provided version tag.

## Important Notes

- Make sure to set the correct values for the following variables in the script:
- `ECR_REPOSITORY_NAME`: The name of the ECR repository.
- `ECR_REGION`: The AWS region where the ECR repository is located.
- `PROFILE`: Your AWS CLI profile name.
- `AWS_ACCOUNT_ID`: Your AWS account ID.
- `TAG`: The version tag for the Docker image.

- Ensure that Docker is properly configured and running before executing the script.
