#!/bin/bash
echo "HTML Validation..."
html5validator --root . --blacklist node_modules

echo "Github action linting..."
./actionlint

echo "HTML Linting..."
npx htmlhint "index.html"
npx htmlhint "assets/**/*.html"

echo "CSS linting..."
npx stylelint "**/*.css"

echo "JavaScript Linting..."
npx eslint "**/*.js"

echo "Copy Pase detection..."
npx jscpd --pattern "*.js" "assets/**.js"
npx jscpd --pattern "*.css" "assets/**.css"
npx jscpd --pattern "*.html" "assets/**.html"