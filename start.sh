#!/bin/sh

echo "Running migrations..."
npm run migrate

echo "Running seeds..."
npm run seed

echo "Starting server..."
npm run start