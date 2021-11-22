#!/bin/bash
echo "HTML Validation..."
html5validator --root . --blacklist node_modules

echo "Github action linting..."

case "$OSTYPE" in
	linux-*)
		./actionlint
	;;
	msys|cygwin|win32)
		./actionlint.exe
	;;
esac

echo "html lint"
npx htmlhint index.html assets/**/*.html

echo "css lint"
npx stylelint **/*.css 

echo "jscpd"
npx jscpd --pattern *.js assets/**.js *.css assets/**.css *.html assets/**.html

echo "eslint"
npx eslint **/*.js

echo "standard"
npx standard