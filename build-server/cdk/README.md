# ECR Builder Server CDK App

## Prerequisites

Before running this CDK application, ensure you have the following:

- Node.js and npm installed on your machine. You can check the required Node.js version in the `.nvmrc` file.
  To switch to the required Node.js version, run:
```sh
nvm use
```
- CDK CLI installed (`npm install -g aws-cdk`).
  
  ## Available Scripts

In the project directory, you can run the following npm scripts:

### `npm run build`

Builds the TypeScript files in the project.

### `npm run watch`

Watches for changes in the TypeScript files and automatically recompiles them.

### `npm test`

Runs the Jest tests.

### `npm run cdk`

Runs the CDK CLI.

### `npm run bootstrap:stg:prod`

Bootstraps the AWS environment for the production stage. You can also use the deployment script `./deploy.sh .env bootstrap:stg:prod`.

### `npm run deploy:stg:prod`

Deploys the CDK stack for the production stage, saving outputs to `cdk-outputs.json`. You can also use the deployment script `./deploy.sh .env deploy:stg:prod`.

Make sure to replace `"akermi"` with your AWS CLI profile name if it's different.