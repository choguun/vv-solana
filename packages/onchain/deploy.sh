#!/bin/bash

# Deploy the Anchor program
anchor deploy

# Check if the deployment was successful
if [ $? -eq 0 ]; then
    echo "Anchor deployment successful!"

    # Run post-deployment scripts or commands here
    # For example, interact with the deployed program or initialize accounts
    ts-node postdeploy-script.ts
else
    echo "Anchor deployment failed. Exiting..."
    exit 1
fi
