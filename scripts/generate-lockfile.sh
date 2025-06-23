#!/bin/bash

echo "Generating package-lock.json..."

# Clean existing dependencies
rm -rf node_modules
rm -f package-lock.json
rm -f pnpm-lock.yaml
rm -f yarn.lock

# Install dependencies to generate lockfile
npm install --legacy-peer-deps

echo "Package-lock.json generated successfully!"
