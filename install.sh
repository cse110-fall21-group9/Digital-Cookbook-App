#!/bin/sh
pip install html5validator
npm install htmlhint --save-dev
npm install eslint@6.8.0 --save-dev
npm install stylelint stylelint-config-standard --save-devs

touch .eslintrc.json
mv .eslintrc.json .esintrc1.json
npx eslint --init
mv .esintrc1.json .eslintrc.json
