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

echo "HTML Lint"
npx htmlhint index.html assets/**/*.html

echo "CSS Lint"
npx stylelint ./**/*.css 

echo "JSCPD"
npx jscpd --pattern ./*.js assets/**.js ./*.css assets/**.css ./*.html assets/**.html

echo "ESLint"
npx eslint ./assets/**/*.js __tests__/**/*.js


echo "Jest Test"
npx jest