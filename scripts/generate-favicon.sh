#!/bin/bash

# Convert PNG to ICO
convert public/favicon-32x32.png public/favicon.ico

# Verify the file was created
if [ -f "public/favicon.ico" ]; then
    echo "favicon.ico generated successfully"
else
    echo "Error: Failed to generate favicon.ico"
    exit 1
fi
