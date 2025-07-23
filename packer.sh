#!/bin/sh

rm -rf ./dist
echo "Removed ./dist directory"
yarn build
echo "Compiled typescript"
cp package.json ./dist/
echo "Copied package.json"
cd ./dist/ || exit
yarn unlink
yarn link
echo "Unlinked and linked yarn packages in ./dist"
cd ..