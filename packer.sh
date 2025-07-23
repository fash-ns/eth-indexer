#!/bin/sh

rm -rf ./dist
echo "Removed ./dist directory"
yarn build
echo "Compiled typescript"
cp package.json ./dist/
echo "Copied package.json"
cp README.md ./dist/
echo "Copied README.md"
cd ./dist/ || exit
# yarn unlink
# yarn link
npm publish
echo "Unlinked and linked yarn packages in ./dist"
cd ..