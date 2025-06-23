#!/bin/bash

echo "Checking for workspace references..."

# Check all JSON files for workspace references
find . -name "*.json" -not -path "./node_modules/*" -not -path "./.next/*" | xargs grep -l "workspace:" 2>/dev/null || echo "No workspace references found in JSON files"

# Check all YAML files for workspace references  
find . -name "*.yaml" -o -name "*.yml" -not -path "./node_modules/*" -not -path "./.next/*" | xargs grep -l "workspace:" 2>/dev/null || echo "No workspace references found in YAML files"

# Check package.json specifically
if grep -q "workspace:" package.json 2>/dev/null; then
    echo "WARNING: workspace references found in package.json"
    grep "workspace:" package.json
else
    echo "No workspace references in package.json"
fi

echo "Check complete!"
