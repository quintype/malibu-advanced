#!/bin/bash

# # Clone the source repository
# git clone --branch master --single-branch https://github.com/quintype/quintype-node-arrow.git temp_repo

cp -r ../quintype-node-arrow temp_repo

# Go to the cloned repository
cd temp_repo

# Create the target directory if it doesn't exist
mkdir -p ../app/isomorphic/arrow

# Copy the files to the target directory
cp -r src/* ../app/isomorphic/arrow/

echo "Files copied successfully!"

# Clean up by removing the temporary directory
cd ..
rm -rf temp_repo
