#!/bin/bash
PLATFORM=""
NAME=$1


case "$OSTYPE" in
	linux-*)
		PLATFORM="linux"
	;;
	msys|cygwin|win32)
		PLATFORM="win32"
	;;
	darwin*)
		PLATFORM="darwin"
	;;
	*)
		echo "Unrecognizable OS!"
		exit
	;;
esac

mkdir electron-build
cp -r assets electron-build/assets/
cp index.html electron-build/index.html
cp ci/release-package.json electron-build/package.json

cd electron-build || exit
npm install
cd ..
npm run-script "build-${PLATFORM}"

mv "import-pandas-cookbook-app-${PLATFORM}-x64" "build-${NAME}-x64"
rm -rf electron-build