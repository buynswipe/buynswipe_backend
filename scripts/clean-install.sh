#!/bin/bash

# Clean pnpm cache and lockfile
echo "Cleaning pnpm cache and lockfile..."
rm -rf node_modules
rm -f pnpm-lock.yaml
pnpm store prune

# Clear pnpm cache
pnpm cache clean --force

# Reinstall dependencies
echo "Reinstalling dependencies..."
pnpm install

echo "Clean install completed!"
