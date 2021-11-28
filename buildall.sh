#!/bin/bash
PLATFORM=""
NAME=""

case "$OSTYPE" in
	linux-*)
		PLATFORM="linux"
		NAME="Linux"
	;;
	msys|cygwin|win32)
		PLATFORM="win"
		NAME="Windows"
	;;
	darwin*)
		PLATFORM="darwin"
		NAME="macOS"
	;;
	*)
		echo "Unrecognizable OS!"
		exit
	;;
esac

npm run-script build-${PLATFORM}

zip -r build-${NAME}-x64 import-pandas-cookbook-app-${PLATFORM}-x64
rm -rf import-pandas-cookbook-app-${PLATFORM}-x64